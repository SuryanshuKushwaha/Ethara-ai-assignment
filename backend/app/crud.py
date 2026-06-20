from decimal import Decimal
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models, schemas


def get_products(db: Session):
    return db.execute(select(models.Product)).scalars().all()


def get_product(db: Session, product_id: int):
    return db.get(models.Product, product_id)


def get_product_by_sku(db: Session, sku: str):
    return db.execute(select(models.Product).where(models.Product.sku == sku)).scalar_one_or_none()


def create_product(db: Session, product: schemas.ProductCreate):
    if get_product_by_sku(db, product.sku):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product SKU already exists")

    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity_in_stock=product.quantity_in_stock,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(db: Session, product_id: int, product_in: schemas.ProductUpdate):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if product_in.sku and product_in.sku != product.sku:
        existing = get_product_by_sku(db, product_in.sku)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product SKU already exists")

    if product_in.quantity_in_stock is not None and product_in.quantity_in_stock < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity cannot be negative")

    for field, value in product_in.dict(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
    return product


def get_customers(db: Session):
    return db.execute(select(models.Customer)).scalars().all()


def get_customer(db: Session, customer_id: int):
    return db.get(models.Customer, customer_id)


def get_customer_by_email(db: Session, email: str):
    return db.execute(select(models.Customer).where(models.Customer.email == email)).scalar_one_or_none()


def create_customer(db: Session, customer: schemas.CustomerCreate):
    if get_customer_by_email(db, customer.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer email already exists")

    db_customer = models.Customer(
        full_name=customer.full_name,
        email=customer.email,
        phone=customer.phone,
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def delete_customer(db: Session, customer_id: int):
    customer = get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    db.delete(customer)
    db.commit()
    return customer


def get_orders(db: Session):
    return db.execute(select(models.Order).order_by(models.Order.created_at.desc())).scalars().all()


def get_order(db: Session, order_id: int):
    return db.get(models.Order, order_id)


def create_order(db: Session, order_in: schemas.OrderCreate):
    customer = get_customer(db, order_in.customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    if not order_in.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must include at least one item")

    items = []
    total_amount = Decimal("0.00")

    for item in order_in.items:
        product = get_product(db, item.product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")
        if item.quantity > product.quantity_in_stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product.name}",
            )
        if item.quantity <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be positive")

        product.quantity_in_stock -= item.quantity
        line_total = Decimal(product.price) * item.quantity
        total_amount += line_total
        items.append((product, item.quantity, product.price))

    db_order = models.Order(customer_id=customer.id, total_amount=total_amount)
    db.add(db_order)
    db.flush()

    for product, quantity, unit_price in items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=unit_price,
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: int):
    order = get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    for item in order.items:
        product = get_product(db, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
    return order
