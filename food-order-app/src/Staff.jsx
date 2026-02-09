import React, { useState, useEffect } from 'react'

const PASSWORD = '1234'

export default function Staff() {
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (auth) loadOrders()
  }, [auth])

  function loadOrders() {
    try {
      const raw = localStorage.getItem('food_orders') || '[]'
      const arr = JSON.parse(raw)
      setOrders(arr.reverse())
    } catch (e) {
      setOrders([])
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === PASSWORD) {
      setAuth(true)
      setPassword('')
    } else {
      alert('Wrong password')
    }
  }

  function togglePaid(identifier) {
    // identifier can be orderNumber or id
    const target = orders.find(o => o.orderNumber === identifier || o.id === identifier)
    if (!target) return
    const display = target.orderNumber ?? target.id
    if (!confirm(`Mark order #${display} as paid?`)) return

    const updated = orders.map(o => (o.orderNumber === identifier || o.id === identifier ? { ...o, paid: !o.paid } : o))
    setOrders(updated)
    // persist change back to stored array
    try {
      const raw = localStorage.getItem('food_orders') || '[]'
      const arr = JSON.parse(raw)
      const merged = arr.map(a => {
        const u = updated.find(u => u.orderNumber === a.orderNumber || u.id === a.id)
        return u ? u : a
      })
      localStorage.setItem('food_orders', JSON.stringify(merged))
    } catch (e) {
      console.error(e)
    }
  }

  if (!auth) {
    return (
      <section className="staff-login">
        <h2>Staff Login</h2>
        <form onSubmit={handleLogin}>
          <label>
            Password:
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <div style={{marginTop:8}}>
            <button type="submit" className="primary">Login</button>
          </div>
        </form>
      </section>
    )
  }

  return (
    <section className="staff">
      <h2>Orders</h2>
      <div style={{marginBottom:8}}>
        <button onClick={loadOrders}>Refresh</button>
      </div>
      {orders.length === 0 ? (
        <div>No orders yet</div>
      ) : (
        <div className="table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Time</th>
                <th>Total</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                  <tr key={o.id} className={o.paid ? 'paid' : ''}>
                    <td>{o.orderNumber ?? '—'}</td>
                    <td><a href={`tel:${o.phone}`}>{o.phone}</a></td>
                  <td>
                    <ul className="mini-list">
                      {o.items.map((it, idx) => (
                        <li key={idx}>{it.qty} x {it.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{new Date(o.time).toLocaleString()}</td>
                  <td>${(o.total || 0).toFixed(2)}</td>
                  <td>
                    <button onClick={() => togglePaid(o.orderNumber ?? o.id)} className={o.paid ? 'primary' : ''}>
                      {o.paid ? 'Paid' : 'Mark Paid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
