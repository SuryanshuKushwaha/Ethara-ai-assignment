from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import engine, get_db, SessionLocal
from app.config import FRONTEND_URLS
from app.seed import seed_initial_data

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API")


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Inventory API is running",
        "endpoints": ["/products", "/customers", "/orders"],
        "docs": "/docs",
    }


app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/products", response_model=schemas.ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)


@app.get("/products", response_model=list[schemas.ProductRead])
def list_products(db: Session = Depends(get_db)):
    return crud.get_products(db)


@app.get("/products/{product_id}", response_model=schemas.ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=schemas.ProductRead)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    return crud.update_product(db, product_id, product)


@app.delete("/products/{product_id}", response_model=schemas.ProductRead)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return crud.delete_product(db, product_id)


@app.post("/customers", response_model=schemas.CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db, customer)


@app.get("/customers", response_model=list[schemas.CustomerRead])
def list_customers(db: Session = Depends(get_db)):
    return crud.get_customers(db)


@app.get("/customers/{customer_id}", response_model=schemas.CustomerRead)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = crud.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@app.delete("/customers/{customer_id}", response_model=schemas.CustomerRead)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    return crud.delete_customer(db, customer_id)


@app.post("/orders", response_model=schemas.OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = crud.create_order(db, order)
    return schemas.OrderRead(
        id=db_order.id,
        customer_id=db_order.customer_id,
        total_amount=float(db_order.total_amount),
        created_at=db_order.created_at,
        items=[
            schemas.OrderItemRead(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                product_name=item.product.name,
            )
            for item in db_order.items
        ],
        customer_name=db_order.customer.full_name,
    )


@app.get("/orders", response_model=list[schemas.OrderRead])
def list_orders(db: Session = Depends(get_db)):
    orders = crud.get_orders(db)
    return [
        schemas.OrderRead(
            id=o.id,
            customer_id=o.customer_id,
            total_amount=float(o.total_amount),
            created_at=o.created_at,
            items=[
                schemas.OrderItemRead(
                    product_id=item.product_id,
                    quantity=item.quantity,
                    unit_price=float(item.unit_price),
                    product_name=item.product.name,
                )
                for item in o.items
            ],
            customer_name=o.customer.full_name,
        )
        for o in orders
    ]


@app.get("/orders/{order_id}", response_model=schemas.OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return schemas.OrderRead(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=float(order.total_amount),
        created_at=order.created_at,
        items=[
            schemas.OrderItemRead(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                product_name=item.product.name,
            )
            for item in order.items
        ],
        customer_name=order.customer.full_name,
    )


@app.delete("/orders/{order_id}", response_model=schemas.OrderRead)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order_response = schemas.OrderRead(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=float(order.total_amount),
        created_at=order.created_at,
        items=[
            schemas.OrderItemRead(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                product_name=item.product.name,
            )
            for item in order.items
        ],
        customer_name=order.customer.full_name,
    )

    crud.delete_order(db, order_id)
    return order_response
