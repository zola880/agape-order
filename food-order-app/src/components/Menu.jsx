import React from 'react'

export default function Menu({ items, onAdd }) {
  return (
    <section className="menu">
      <h2>Menu</h2>
      <ul>
        {items.map(item => (
          <li key={item.id} className="menu-item">
            <div>
              <strong>{item.name}</strong>
              <div className="price">${item.price.toFixed(2)}</div>
            </div>
            <button onClick={() => onAdd(item)}>Add</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
