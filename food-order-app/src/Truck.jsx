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
  // yyyy-mm-dd
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

  useEffect(() => {
    if (auth) {
      loadAllOrders()
      loadOrdersForSelected(selected)
    }
  }, [auth])

  useEffect(() => {
    if (auth) loadOrdersForSelected(selected)
  }, [selected])

  function handleLogin(e) {
    e.preventDefault()
    if (password === PASSWORD) {
      setAuth(true)
      setPassword('')
      // load orders immediately after login to avoid a render gap
      try {
        const raw = localStorage.getItem('food_orders') || '[]'
        const arr = JSON.parse(raw)
        setAllOrders(Array.isArray(arr) ? arr : [])
        loadOrdersForSelected(selected)
      } catch (err) {
        setAllOrders([])
        setOrders([])
      }
    } else alert('Wrong password')
  }

  function loadAllOrders() {
    try {
      const raw = localStorage.getItem('food_orders') || '[]'
      const arr = JSON.parse(raw)
      setAllOrders(Array.isArray(arr) ? arr : [])
    } catch (e) {
      setAllOrders([])
    }
  }

  function loadOrdersForSelected(key) {
    try {
      const raw = localStorage.getItem('food_orders') || '[]'
      const arr = JSON.parse(raw)
      const filtered = arr.filter(o => formatDateKey(new Date(o.time)) === key)
      setOrders(filtered.sort((a, b) => b.time.localeCompare(a.time)))
    } catch (e) {
      setOrders([])
    }
  }

  function aggregate(ordersList) {
    const map = {}
    let total = 0
    ordersList.forEach(o => {
      total += +(o.total || 0)
      (o.items || []).forEach(it => {
        const name = it.name || 'Unknown'
        map[name] = (map[name] || 0) + (it.qty || 0)
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
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <div style={{marginTop:8}}>
            <button type="submit" className="primary">Login</button>
          </div>
        </form>
      </section>
    )
  }

  const { map, total } = aggregate(orders)

  return (
    <section className="truck">
      <h2>Truck — Daily Reports</h2>
      <div className="truck-grid">
        <div className="truck-main">
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
                  const ordersFor = allOrders.filter(o => formatDateKey(new Date(o.time)) === key)
                  const count = ordersFor.length
                  const tot = ordersFor.reduce((s, x) => s + ((+(x.total)) || 0), 0)
                  return (
                    <tr key={key} className={key === selected ? 'selected-date' : ''} onClick={() => setSelected(key)}>
                      <td>{d.toLocaleDateString()}</td>
                      <td>{count}</td>
                      <td>${tot.toFixed(2)}</td>
                      <td><button onClick={(e) => { e.stopPropagation(); setSelected(key); }}>View</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <h3 style={{marginTop:16}}>Orders for {(isNaN(new Date(selected)) ? selected : new Date(selected).toLocaleDateString())}</h3>
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
                  {orders.map((o, idx) => (
                    <tr key={o.id} className={o.paid ? 'paid' : ''}>
                      <td>{o.orderNumber ?? '—'}</td>
                      <td><a href={`tel:${o.phone}`}>{o.phone}</a></td>
                      <td>
                        <ul className="mini-list">
                          {(o.items || []).map((it, i) => <li key={i}>{it.qty} x {it.name}</li>)}
                        </ul>
                      </td>
                      <td>{new Date(o.time).toLocaleTimeString()}</td>
                      <td>${(o.total || 0).toFixed(2)}</td>
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
            <div className="daily-total">Total revenue: ${total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
