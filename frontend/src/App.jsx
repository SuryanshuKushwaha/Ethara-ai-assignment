import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import ProductManager from './components/ProductManager'
import CustomerManager from './components/CustomerManager'
import OrderManager from './components/OrderManager'

const sections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'Products' },
  { id: 'customers', label: 'Customers' },
  { id: 'orders', label: 'Orders' },
]

function App() {
  const [active, setActive] = useState('dashboard')
  const [apiBaseUrl, setApiBaseUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')

  useEffect(() => {
    if (!import.meta.env.VITE_API_BASE_URL) {
      setApiBaseUrl('http://localhost:8000')
    }
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Inventory Dashboard</div>
        <nav>
          {sections.map((section) => (
            <button
              key={section.id}
              className={active === section.id ? 'active' : ''}
              onClick={() => setActive(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {active === 'dashboard' && <Dashboard apiBaseUrl={apiBaseUrl} />}
        {active === 'products' && <ProductManager apiBaseUrl={apiBaseUrl} />}
        {active === 'customers' && <CustomerManager apiBaseUrl={apiBaseUrl} />}
        {active === 'orders' && <OrderManager apiBaseUrl={apiBaseUrl} />}
      </main>
    </div>
  )
}

export default App
