import { useEffect, useState } from 'react'
import api from '../api'

const defaultProduct = { name: '', sku: '', price: '', quantity_in_stock: '' }

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(defaultProduct)
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const response = await api.get('/products')
      setProducts(
        response.data.map((product) => ({
          ...product,
          price: Number(product.price),
          quantity_in_stock: Number(product.quantity_in_stock),
        }))
      )
    } catch {
      setError('Unable to load products.')
    }
  }

  function formatCurrency(value) {
    const price = Number(value)
    return Number.isFinite(price) ? price.toFixed(2) : '0.00'
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.name || !form.sku || !form.price || form.quantity_in_stock === '') {
      setError('Please complete all fields.')
      return
    }

    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        quantity_in_stock: parseInt(form.quantity_in_stock, 10),
      }

      if (editing) {
        await api.put(`/products/${editing.id}`, payload)
        setMessage('Product updated successfully.')
      } else {
        await api.post('/products', payload)
        setMessage('Product created successfully.')
      }
      setForm(defaultProduct)
      setEditing(null)
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product.')
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return
    }
    try {
      await api.delete(`/products/${product.id}`)
      setMessage('Product removed successfully.')
      loadProducts()
    } catch {
      setError('Unable to delete product.')
    }
  }

  function handleEdit(product) {
    setEditing(product)
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    })
    setMessage('')
    setError('')
  }

  return (
    <section>
      <h1>Products</h1>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <div className="panel two-column">
        <form className="form-card" onSubmit={handleSave}>
          <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            SKU
            <input name="sku" value={form.sku} onChange={handleChange} />
          </label>
          <label>
            Price
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
          </label>
          <label>
            Quantity in Stock
            <input name="quantity_in_stock" type="number" min="0" value={form.quantity_in_stock} onChange={handleChange} />
          </label>
          <div className="form-actions">
            <button type="submit">{editing ? 'Update' : 'Create'}</button>
            {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(defaultProduct); setError(''); setMessage(''); }}>Cancel</button>}
          </div>
        </form>
        <div className="panel">
          <h2>Product List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td data-label="Name">{product.name}</td>
                    <td data-label="SKU">{product.sku}</td>
                    <td data-label="Price">${formatCurrency(product.price)}</td>
                    <td data-label="Stock">{product.quantity_in_stock}</td>
                    <td data-label="Actions" className="actions-cell">
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      <button className="secondary" onClick={() => handleDelete(product)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
