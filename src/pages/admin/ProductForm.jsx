import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { api, assetUrl } from '../../api'
import { Notice } from './Widgets'
import { btnGhost, btnPrimary, inputClass } from './ui'

const blank = { name: '', brand: '', category: '', categoryName: '', specs: '', image: '', alternateImages: [], price: '', oldPrice: '', freeGift: '', condition: '', hotFeature: '', inShop: true, inCatalog: true, active: true, hot: false }

function Field({ label, children, hint }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-xs font-normal text-gray-500">{hint}</span>}
    </label>
  )
}

export default function ProductForm({ product, categories, onClose, onSaved }) {
  const isNew = !product.id
  const [form, setForm] = useState({ ...blank, ...product, price: product.price ?? '', oldPrice: product.oldPrice ?? '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const upload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await api('/admin/upload', { method: 'POST', form: fd })
      setForm((f) => ({ ...f, image: res.url }))
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = { ...form, price: form.price === '' ? null : form.price, oldPrice: form.oldPrice === '' ? null : form.oldPrice }
      if (isNew) await api('/admin/products', { method: 'POST', body: payload })
      else await api(`/admin/products/${encodeURIComponent(product.id)}`, { method: 'PUT', body: payload })
      onSaved(isNew ? `Added "${form.name}".` : `Saved "${form.name}".`)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={isNew ? 'Add product' : 'Edit product'}>
      <form onSubmit={submit} className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-brand-charcoal">{isNew ? 'Add product' : 'Edit product'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {error && <div className="sm:col-span-2"><Notice>{error}</Notice></div>}
          <div className="sm:col-span-2">
            <Field label="Name *"><input required className={inputClass} value={form.name} onChange={set('name')} /></Field>
          </div>
          <Field label="Brand"><input className={inputClass} value={form.brand} onChange={set('brand')} placeholder="Generic" /></Field>
          <Field label="Price (KES)" hint="Leave empty to show “Price on request”.">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={set('price')} />
          </Field>
          <Field label="Old price (KES)" hint="Optional “was” price, shown struck through. Must be higher than the price.">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.oldPrice} onChange={set('oldPrice')} />
          </Field>
          <Field label="Free gift" hint="Optional, e.g. “Wireless mouse”. Shown as a badge on the product.">
            <input maxLength={120} className={inputClass} value={form.freeGift} onChange={set('freeGift')} placeholder="Wireless mouse" />
          </Field>
          <Field label="Condition" hint="Shown next to the brand. Pick one or type your own, e.g. Ex-UK.">
            <input list="admin-conditions" maxLength={40} className={inputClass} value={form.condition} onChange={set('condition')} />
            <datalist id="admin-conditions">{['New', 'Refurbished', 'Used'].map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Hot feature" hint="Optional one-line selling point, e.g. “16GB RAM + 512GB SSD”. Shown on the card.">
            <input maxLength={120} className={inputClass} value={form.hotFeature} onChange={set('hotFeature')} />
          </Field>
          <Field label="Category" hint="Used for filters, e.g. Laptops, Desktops, Accessories.">
            <input list="admin-categories" className={inputClass} value={form.category} onChange={set('category')} />
            <datalist id="admin-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Category label" hint="Longer display name (optional).">
            <input className={inputClass} value={form.categoryName} onChange={set('categoryName')} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Specs"><textarea rows={3} className={inputClass} value={form.specs} onChange={set('specs')} /></Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Image" hint="Upload a JPG/PNG/WebP (max 5 MB) or paste a path such as /products/prod-10001.jpg.">
              <div className="flex items-start gap-3">
                {form.image ? <img src={assetUrl(form.image)} alt="" className="h-20 w-20 rounded-lg border border-gray-200 object-cover" /> : <div className="h-20 w-20 rounded-lg bg-gray-100" />}
                <div className="flex-1 space-y-2">
                  <input className={inputClass} value={form.image} onChange={set('image')} placeholder="/products/hp-pavilion-15.jpg" />
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading} className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200" />
                  {uploading && <p className="text-xs text-gray-500">Uploading…</p>}
                </div>
              </div>
            </Field>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-gray-700">Visibility</legend>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.inShop} onChange={set('inShop')} /> Show in Shop</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.inCatalog} onChange={set('inCatalog')} /> Show in Product Catalogue</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={set('active')} /> Active (untick to hide everywhere)</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.hot} onChange={set('hot')} /> Hot product (featured at the top of the Shop)</label>
            </div>
          </fieldset>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={busy || uploading}>{busy ? 'Saving…' : 'Save product'}</button>
        </div>
      </form>
    </div>
  )
}
