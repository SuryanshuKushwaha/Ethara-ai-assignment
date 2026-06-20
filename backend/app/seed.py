from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app import crud, models, schemas


def seed_initial_data(db: Session):
    has_products = db.execute(select(models.Product)).scalars().first() is not None
    if has_products:
        return

    products = [
        {
            "name": "Wireless Mouse",
            "sku": "WM-1001",
            "price": Decimal("25.99"),
            "quantity_in_stock": 120,
        },
        {
            "name": "Mechanical Keyboard",
            "sku": "MK-2002",
            "price": Decimal("79.99"),
            "quantity_in_stock": 75,
        },
        {
            "name": "USB-C Charger",
            "sku": "UC-3003",
            "price": Decimal("19.50"),
            "quantity_in_stock": 200,
        },
        {
            "name": "Noise Cancelling Headphones",
            "sku": "NC-4004",
            "price": Decimal("129.99"),
            "quantity_in_stock": 40,
        },
        {
            "name": "4K Monitor",
            "sku": "4K-5005",
            "price": Decimal("349.00"),
            "quantity_in_stock": 25,
        },
    ]

    customers = [
        {
            "full_name": "Emma Jones",
            "email": "emma.jones@example.com",
            "phone": "555-0101",
        },
        {
            "full_name": "Liam Patel",
            "email": "liam.patel@example.com",
            "phone": "555-0202",
        },
        {
            "full_name": "Sophia Chen",
            "email": "sophia.chen@example.com",
            "phone": "555-0303",
        },
        {
            "full_name": "Noah Kim",
            "email": "noah.kim@example.com",
            "phone": "555-0404",
        },
        {
            "full_name": "Ava Smith",
            "email": "ava.smith@example.com",
            "phone": "555-0505",
        },
    ]

    for product in products:
        db.add(models.Product(**product))

    for customer in customers:
        db.add(models.Customer(**customer))

    db.commit()

    product_map = {
        product.sku: product
        for product in db.execute(select(models.Product)).scalars().all()
    }
    customer_map = {
        customer.email: customer
        for customer in db.execute(select(models.Customer)).scalars().all()
    }

    orders = [
        {
            "customer_email": "emma.jones@example.com",
            "items": [
                {"sku": "WM-1001", "quantity": 2},
                {"sku": "UC-3003", "quantity": 1},
            ],
        },
        {
            "customer_email": "liam.patel@example.com",
            "items": [
                {"sku": "MK-2002", "quantity": 1},
            ],
        },
        {
            "customer_email": "sophia.chen@example.com",
            "items": [
                {"sku": "UC-3003", "quantity": 3},
                {"sku": "4K-5005", "quantity": 1},
            ],
        },
        {
            "customer_email": "noah.kim@example.com",
            "items": [
                {"sku": "NC-4004", "quantity": 2},
            ],
        },
        {
            "customer_email": "ava.smith@example.com",
            "items": [
                {"sku": "MK-2002", "quantity": 1},
                {"sku": "WM-1001", "quantity": 2},
            ],
        },
    ]

    for order in orders:
        customer = customer_map[order["customer_email"]]
        order_items = [
            schemas.OrderItemCreate(product_id=product_map[item["sku"]].id, quantity=item["quantity"])
            for item in order["items"]
        ]
        order_payload = schemas.OrderCreate(customer_id=customer.id, items=order_items)
        crud.create_order(db, order_payload)
