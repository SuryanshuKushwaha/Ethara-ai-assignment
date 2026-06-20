from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, condecimal, PositiveInt


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: condecimal(gt=0, max_digits=12, decimal_places=2)
    quantity_in_stock: int = Field(..., ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    sku: Optional[str] = Field(None, min_length=1)
    price: Optional[condecimal(gt=0, max_digits=12, decimal_places=2)]
    quantity_in_stock: Optional[int] = Field(None, ge=0)


class ProductRead(ProductBase):
    id: int

    class Config:
        orm_mode = True


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str = Field(..., min_length=1)


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id: int

    class Config:
        orm_mode = True


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: PositiveInt


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]


class OrderItemRead(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    product_name: str

    class Config:
        orm_mode = True


class OrderRead(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItemRead]
    customer_name: str

    class Config:
        orm_mode = True
