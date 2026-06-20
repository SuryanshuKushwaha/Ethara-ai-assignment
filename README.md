# Inventory & Order Management System

A full-stack inventory and order management system with React frontend, FastAPI backend, PostgreSQL database, and Docker Compose orchestration.

## Local setup

1. Install Docker Desktop.
2. From the project root, run:
   ```bash
   docker compose up --build
   ```
3. Frontend: http://localhost:4173
4. Backend API: http://localhost:8000

## API Endpoints

- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `DELETE /customers/{id}`
- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `DELETE /orders/{id}`

## Notes

- Product SKUs and customer emails are unique.
- Orders validate stock availability and decrement inventory automatically.
- Deleting an order restores stock.
- The frontend uses `VITE_API_BASE_URL` to connect to the backend.
