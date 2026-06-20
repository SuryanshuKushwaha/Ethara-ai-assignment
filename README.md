# Inventory & Order Management System

A full-stack inventory and order management system with React frontend, FastAPI backend, PostgreSQL database, and Docker Compose orchestration.

## Local setup

1. Install Docker Desktop.
2. From the project root, run:
   ```bash
   docker compose up --build
   ```
3. Frontend: http://localhost:4173
4. Backend API (direct): http://localhost:8000
5. Docker deployment proxies API traffic through `/api`, so frontend requests are available at `http://localhost:4173/api`.

### Deployment targets

- Frontend: Netlify
- Backend: Render
- Local Docker images are unchanged and remain available for local development and testing.

### Netlify frontend setup

1. In Netlify, set the base directory to `frontend`.
2. Set build command: `npm run build`.
3. Set publish directory: `dist`.
4. Add an environment variable:
   - `VITE_API_BASE_URL=https://<your-render-backend-url>`

### Render backend setup

1. Add the root `render.yaml` file to your repository.
2. In Render, create a new Python web service using this repository.
3. Set the environment variables on Render:
   - `DATABASE_URL`
   - `FRONTEND_URL=https://<your-netlify-app-url>`
   - `BACKEND_HOST=0.0.0.0`
4. Use the start command:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Development notes

- The frontend is configured to proxy `/api` to `http://localhost:8000` during local development.
- Use `VITE_API_BASE_URL=/api` for Docker Compose deployment.
- Use `VITE_API_BASE_URL=http://localhost:8000` for direct local frontend development.
- Use `VITE_API_BASE_URL=https://<your-render-backend-url>` for Netlify production.

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
