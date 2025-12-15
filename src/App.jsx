import { useState } from 'react'
import './App.css'

const defaultItem = { name: '', qty: '1', harga: '0' }

function App() {
  const [userId, setUserId] = useState('UMKM001')
  const [customer, setCustomer] = useState('')
  const [items, setItems] = useState([{ ...defaultItem }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const apiUrl = import.meta.env.VITE_API_URL

  const updateItem = (index, field, rawValue) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: rawValue,
            }
          : item,
      ),
    )
  }

  const addNewItem = () => {
    setItems((prev) => [...prev, { ...defaultItem }])
  }

  const removeItem = (index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!apiUrl) {
      setErrorMessage('VITE_API_URL belum dikonfigurasi.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setResponse(null)

    const payload = {
      action: 'createInvoice',
      user_id: userId.trim(),
      customer: customer.trim(),
      items: items.map((item) => ({
        name: item.name.trim(),
        qty: Number(item.qty),
        harga: Number(item.harga),
      })),
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Server mengembalikan status ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat memproses permintaan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidForm =
    userId.trim() &&
    customer.trim() &&
    items.every(
      (item) => item.name.trim() && Number(item.qty) > 0 && Number(item.harga) >= 0,
    )

  return (
    <main className="app">
      <header>
        <h1>Invoice Generator</h1>
        <p>Masukkan detail invoice dan klik submit untuk mengirim data ke server.</p>
      </header>

      <section className="card">
        <form className="invoice-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="user-id">User ID</label>
            <input
              id="user-id"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="UMKM001"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="customer">Customer</label>
            <input
              id="customer"
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              placeholder="Nama Customer"
              required
            />
          </div>

          <div className="items">
            <div className="items-header">
              <h2>Items</h2>
              <button type="button" className="secondary" onClick={addNewItem}>
                + Tambah Item
              </button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="field">
                  <label htmlFor={`name-${index}`}>Nama Barang</label>
                  <input
                    id={`name-${index}`}
                    value={item.name}
                    onChange={(event) => updateItem(index, 'name', event.target.value)}
                    placeholder="Kaos"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor={`qty-${index}`}>Qty</label>
                  <input
                    id={`qty-${index}`}
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(event) => updateItem(index, 'qty', event.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor={`harga-${index}`}>Harga</label>
                  <input
                    id={`harga-${index}`}
                    type="number"
                    min="0"
                    step="1000"
                    value={item.harga}
                    onChange={(event) => updateItem(index, 'harga', event.target.value)}
                    required
                  />
                </div>
                <div className="item-actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="primary" type="submit" disabled={!isValidForm || isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Submit Invoice'}
          </button>
        </form>
      </section>

      <section className="response-panel">
        <h2>Response</h2>
        {!apiUrl && <p className="error">VITE_API_URL belum diset di berkas .env.</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}
        {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
        {!errorMessage && !response && (
          <p className="muted">Response dari server akan muncul di sini setelah submit.</p>
        )}
      </section>
    </main>
  )
}

export default App
