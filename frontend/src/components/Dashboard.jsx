import { useEffect, useState } from 'react'
import api from '../api'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers'),
          api.get('/orders'),
        ])
        setProducts(productsRes.data)
        setCustomers(customersRes.data)
        setOrders(ordersRes.data)
      } catch (err) {
        setError('Unable to load dashboard data.')
      }
    }
    loadDashboard()
  }, [])

  const lowStock = products.filter((product) => product.quantity_in_stock <= 5)

  return (
    <section>
      <h1>Dashboard</h1>
      {error && <div className="alert error">{error}</div>}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{customers.length}</div>
          <div className="stat-label">Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Orders</div>
        </div>
      </div>
      <div className="panel">
        <h2>Low Stock Products</h2>
        {lowStock.length === 0 ? (
          <p>All products have sufficient stock.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((product) => (
                  <tr key={product.id}>
                    <td data-label="Name">{product.name}</td>
                    <td data-label="SKU">{product.sku}</td>
                    <td data-label="Stock">{product.quantity_in_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
