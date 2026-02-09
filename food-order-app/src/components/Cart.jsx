import React from 'react'

export default function Cart({ items, onUpdate, onClear }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  function checkout() {
    if (items.length === 0) return alert('Cart is empty')
    const phone = prompt('Enter customer phone number (digits only, e.g. 15551234567):')
    if (!phone) return
    const summary = items.map(i => `${i.qty} x ${i.name}`).join('\n')

    const order = {
      id: Date.now(),
      phone: phone.trim(),
      items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      time: new Date().toISOString(),
      total: parseFloat(total.toFixed(2)),
      paid: false
    }

    // assign sequential order number persisted in localStorage
    try {
      const nextRaw = localStorage.getItem('food_next_order_number')
      let next = 1
      if (nextRaw) next = parseInt(nextRaw, 10) || 1
      order.orderNumber = next
      localStorage.setItem('food_next_order_number', String(next + 1))
    } catch (e) {
      console.warn('Could not read/write next order number', e)
    }

    try {
      const raw = localStorage.getItem('food_orders') || '[]'
      const arr = JSON.parse(raw)
      arr.push(order)
      localStorage.setItem('food_orders', JSON.stringify(arr))
    } catch (e) {
      console.error('Failed to save order', e)
      alert('Could not save order to localStorage')
    }

    alert(`Order placed:\n${summary}\n\nTotal: $${total.toFixed(2)}`)
    onClear()
  }

  return (
    <aside className="cart">
      <h2>Cart</h2>
      {items.length === 0 ? (
        <div className="empty">No items yet</div>
      ) : (
        <ul>
          {items.map(i => (
            <li key={i.id} className="cart-item">
              <div className="cart-left">
                <div className="name">{i.name}</div>
                <div className="price-small">${(i.price * i.qty).toFixed(2)}</div>
              </div>
              <div className="cart-right">
                <input type="number" min="0" value={i.qty} onChange={e => onUpdate(i.id, parseInt(e.target.value || '0', 10))} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="cart-footer">
        <div className="total">Total: ${total.toFixed(2)}</div>
        <div className="actions">
          <button onClick={checkout} className="primary">Checkout</button>
          <button onClick={onClear}>Clear</button>
        </div>
      </div>
    </aside>
  )
}
