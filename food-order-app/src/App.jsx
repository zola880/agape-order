import React, { useState } from 'react'
import Menu from './components/Menu'
import Cart from './components/Cart'
import Staff from './Staff'
import Truck from './Truck'

const initialMenu = [
  { id: 1, name: 'ተፈርሾ', price: 8.99 },
  { id: 2, name: 'ሽሮ ላላ', price: 7.49 },
  { id: 3, name: 'ቴስቲ', price: 6.5 },
  { id: 4, name: 'ፓስታ በአትክልት', price: 7.49 },
  { id: 5, name: 'ቴስቲ', price: 6.5 },
  { id: 6, name: 'ሩዝ', price: 2.99 }
]

export default function App() {
  const [menu] = useState(initialMenu)
  const [cart, setCart] = useState([])
  const [view, setView] = useState('order') // 'order' or 'staff'

  function addToCart(item) {
    setCart(prev => {
      const found = prev.find(i => i.id === item.id)
      if (found) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function updateQty(id, qty) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i).filter(i => i.qty > 0))
  }

  function clearCart() {
    setCart([])
  }

  return (
    <div className="app">
      <header>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1>አጋፔ መአድ</h1>
          <nav>
            <button onClick={() => setView('order')} style={{marginRight:8}}>Order Page</button>
            <button onClick={() => setView('staff')} style={{marginRight:8}}>Staff Login</button>
            <button onClick={() => setView('truck')}>Truck Report</button>
          </nav>
        </div>
      </header>
      <main>
        {view === 'order' ? (
          <>
            <Menu items={menu} onAdd={addToCart} />
            <Cart items={cart} onUpdate={updateQty} onClear={clearCart} />
          </>
        ) : view === 'staff' ? (
          <Staff />
        ) : view === 'truck' ? (
          <Truck />
        ) : null}
      </main>
    </div>
  )
}
