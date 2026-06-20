import { useEffect, useState } from 'react'
import api from '../api'

const defaultCustomer = { full_name: '', email: '', phone: '' }

export default function CustomerManager() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState(defaultCustomer)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    try {
      const response = await api.get('/customers')
      setCustomers(response.data)
    } catch {
      setError('Unable to load customers.')
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.full_name || !form.email || !form.phone) {
      setError('Please complete all fields.')
      return
    }

    try {
      await api.post('/customers', form)
      setMessage('Customer added successfully.')
      setForm(defaultCustomer)
      loadCustomers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create customer.')
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.full_name}?`)) {
      return
    }
    try {
      await api.delete(`/customers/${customer.id}`)
      setMessage('Customer deleted successfully.')
      loadCustomers()
    } catch {
      setError('Unable to delete customer.')
    }
  }

  return (
    <section>
      <h1>Customers</h1>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <div className="panel two-column">
        <form className="form-card" onSubmit={handleSave}>
          <h2>Add Customer</h2>
          <label>
            Full Name
            <input type="text" name="full_name" value={form.full_name} onChange={handleChange} />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Phone
            <input type="text" name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <button type="submit">Create Customer</button>
        </form>
        <div className="panel">
          <h2>Customer List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td data-label="Name">{customer.full_name}</td>
                    <td data-label="Email">{customer.email}</td>
                    <td data-label="Phone">{customer.phone}</td>
                    <td data-label="Action">
                      <button className="secondary" onClick={() => handleDelete(customer)}>
                        Delete
                      </button>
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
