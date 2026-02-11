import React, { useState, useEffect } from 'react'

const PASSWORD = '1234'

function getLastNDates(n = 30) {
  const dates = []
  const today = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d)
  }
  return dates
}

function formatDateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Truck() {
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [dates] = useState(getLastNDates(30))
  const [selected, setSelected] = useState(formatDateKey(new Date()))
  const [orders, setOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])

  // Load all orders once authenticated
  useEffect(() => {
    if (!auth) return
    loadAllOrders()
  }, [auth])

  // Filter orders when date or allOrders change
  useEffect(() => {
    if (!auth) return
    const filtered = allOrders
      .filter(o => formatDateKey(new Date(o.time)) === selected)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
    setOrders(filtered)
  }, [selected, allOrders, auth])

  function handleLogin(e) {
    e.preventDefault()
    if (password !== PASSWORD) {
      alert('Wrong password')
      return
    }
    setAuth(true)
    setPassword('')
  }

  function loadAllOrders() {
    try {
      const raw = localStorage.getItem('food_orders')
      const arr = raw ? JSON.parse(raw) : []
      setAllOrders(Array.isArray(arr) ? arr : [])
    } catch {
      setAllOrders([])
    }
  }

  function aggregate(list) {
    const map = {}
    let total = 0

    list.forEach(o => {
      total += Number(o.total) || 0
      ;(o.items || []).forEach(it => {
        const name = it.name || 'Unknown'
        map[name] = (map[name] || 0) + (Number(it.qty) || 0)
      })
    })

    return { map, total }
  }

  if (!auth) {
    return (
      <section className="staff-login">
        <h2>Truck — Manager Login</h2>
        <form onSubmit={handleLogin}>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <div style={{ marginTop: 8 }}>
            <button type="submit" className="primary">Login</button>
          </div>
        </form>
      </section>
    )
  }

  const { map, total } = aggregate(orders)
  const selectedDateLabel = new Date(selected + 'T00:00:00').toLocaleDateString()

  return (
    <section className="truck">
      <h2>Truck — Daily Reports</h2>

      <h3>Dates (last 30 days)</h3>
      <div className="table-wrap">
        <table className="date-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dates.map(d => {
              const key = formatDateKey(d)
              const ordersFor = allOrders.filter(
                o => formatDateKey(new Date(o.time)) === key
              )
              const count = ordersFor.length
              const tot = ordersFor.reduce(
                (s, x) => s + (Number(x.total) || 0),
                0
              )

              return (
                <tr
                  key={key}
                  className={key === selected ? 'selected-date' : ''}
                  onClick={() => setSelected(key)}
                >
                  <td>{d.toLocaleDateString()}</td>
                  <td>{count}</td>
                  <td>${tot.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setSelected(key)
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: 16 }}>Orders for {selectedDateLabel}</h3>

      {orders.length === 0 ? (
        <div>No orders for this date</div>
      ) : (
        <div className="table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>#</th>
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
                      {(o.items || []).map((it, i) => (
                        <li key={i}>{it.qty} x {it.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{new Date(o.time).toLocaleTimeString()}</td>
                  <td>${Number(o.total).toFixed(2)}</td>
                  <td>{o.paid ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="daily-report">
        <h4>Daily Summary</h4>
        {Object.keys(map).length === 0 ? (
          <div>No items sold</div>
        ) : (
          <ul>
            {Object.entries(map).map(([name, qty]) => (
              <li key={name}>{qty} x {name}</li>
            ))}
          </ul>
        )}
        <div className="daily-total">
          Total revenue: ${total.toFixed(2)}
        </div>
      </div>
    </section>
  )
}
