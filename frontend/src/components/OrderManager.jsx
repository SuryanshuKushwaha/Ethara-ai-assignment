import { useEffect, useState } from 'react'
import api from '../api'

const defaultOrder = { customer_id: '', items: [{ product_id: '', quantity: '' }] }

export default function OrderManager() {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [form, setForm] = useState(defaultOrder)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [customerRes, productRes, orderRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
        api.get('/orders'),
      ])
      setCustomers(customerRes.data)
      setProducts(
        productRes.data.map((product) => ({
          ...product,
          price: Number(product.price),
          quantity_in_stock: Number(product.quantity_in_stock),
        }))
      )
      setOrders(
        orderRes.data.map((order) => ({
          ...order,
          total_amount: Number(order.total_amount),
        }))
      )
    } catch {
      setError('Unable to load orders or references.')
    }
  }

  function formatCurrency(value) {
    const amount = Number(value)
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleItemChange(index, field, value) {
    setForm((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, items }
    })
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { product_id: '', quantity: '' }] }))
  }

  function removeItem(index) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  async function submitOrder(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const payload = {
      customer_id: Number(form.customer_id),
      items: form.items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    }

    if (!payload.customer_id || payload.items.length === 0) {
      setError('Please select a customer and at least one product.')
      return
    }

    try {
      await api.post('/orders', payload)
      setMessage('Order created successfully.')
      setForm(defaultOrder)
      setSelectedOrder(null)
      loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create order.')
    }
  }

  async function loadOrderDetails(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`)
      setSelectedOrder({
        ...response.data,
        total_amount: Number(response.data.total_amount),
        items: response.data.items.map((item) => ({
          ...item,
          unit_price: Number(item.unit_price),
        })),
      })
    } catch {
      setError('Unable to load order details.')
    }
  }

  async function deleteOrder(orderId) {
    if (!window.confirm('Cancel this order?')) return
    try {
      await api.delete(`/orders/${orderId}`)
      setMessage('Order canceled successfully.')
      setSelectedOrder(null)
      loadData()
    } catch {
      setError('Unable to cancel order.')
    }
  }

  return (
    <section>
      <h1>Orders</h1>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <div className="panel two-column">
        <form className="form-card" onSubmit={submitOrder}>
          <h2>Create Order</h2>
          <label>
            Customer
            <select name="customer_id" value={form.customer_id} onChange={handleChange}>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
          </label>
          <div className="order-items">
            <h3>Order Items</h3>
            {form.items.map((item, index) => (
              <div key={index} className="order-item-row">
                <select value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}>
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  placeholder="Qty"
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                />
                <button type="button" className="secondary" onClick={() => removeItem(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="secondary small">
              Add item
            </button>
          </div>
          <button type="submit">Place Order</button>
        </form>
        <div className="panel">
          <h2>Order History</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="ID">{order.id}</td>
                    <td data-label="Customer">{order.customer_name}</td>
                    <td data-label="Total">${formatCurrency(order.total_amount)}</td>
                    <td data-label="Date">{new Date(order.created_at).toLocaleString()}</td>
                    <td data-label="Actions" className="actions-cell">
                      <button onClick={() => loadOrderDetails(order.id)}>Details</button>
                      <button className="secondary" onClick={() => deleteOrder(order.id)}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedOrder && (
            <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="modal" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                  <h3>Order #{selectedOrder.id}</h3>
                  <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                    Close
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Customer:</strong> {selectedOrder.customer_name}
                  </p>
                  <p>
                    <strong>Total:</strong> ${formatCurrency(selectedOrder.total_amount)}
                  </p>
                  <p>
                    <strong>Placed:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                  <h4>Items</h4>
                  <ul>
                    {selectedOrder.items.map((item) => (
                      <li key={`${item.product_id}-${item.quantity}`}>
                        {item.product_name} × {item.quantity} @ ${formatCurrency(item.unit_price)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
