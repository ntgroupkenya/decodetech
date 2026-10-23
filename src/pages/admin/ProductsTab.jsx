import { useMemo, useState } from 'react'
import { ExternalLink, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react'
import { api, assetUrl } from '../../api'
import newProducts from '../../data/newProducts'
import { productPath } from '../../productSlug'
import { crossHref } from '../../siteHosts'
import useLoad from './useLoad'
import ProductForm from './ProductForm'
import ImportPanel from './ImportPanel'
import { Badge, Empty, Notice } from './Widgets'
import { btnGhost, btnPrimary, btnYellow, inputClass } from './ui'

export default function ProductsTab() {
  const { data, error, loading, reload } = useLoad('/admin/products')
  const [editing, setEditing] = useState(null) // product object, or {} for new
  const [showImport, setShowImport] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [actionError, setActionError] = useState('')

  const products = useMemo(() => data?.products ?? [], [data])
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => [p.name, p.brand, p.category, p.id].some((v) => (v || '').toLowerCase().includes(q)))
  }, [products, query])

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This removes it from the website.`)) return
    setActionError('')
    try {
      await api(`/admin/products/${encodeURIComponent(product.id)}`, { method: 'DELETE' })
      setStatus(`Deleted "${product.name}".`)
      reload()
    } catch (e) {
      setActionError(e.message)
    }
  }

  const loadStarter = async () => {
    if (!window.confirm(`Load the ${newProducts.length} products bundled with the site into the database? Existing items with the same id are updated.`)) return
    setActionError('')
    try {
      const res = await api('/admin/products/import', { method: 'POST', body: { rows: newProducts } })
      setStatus(`Starter catalogue loaded: ${res.added} added, ${res.updated} updated.`)
      reload()
    } catch (e) {
      setActionError(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, brand, category…"
            aria-label="Search products"
            className={`${inputClass} pl-9`}
          />
        </div>
        <button type="button" className={btnGhost} onClick={() => setShowImport((v) => !v)}>
          <Upload size={16} /> Import XLSX / CSV
        </button>
        <button type="button" className={btnYellow} onClick={() => setEditing({})}>
          <Plus size={16} /> Add product
        </button>
      </div>

      {showImport && (
        <ImportPanel
          currentProducts={products}
          onDone={(msg) => {
            setStatus(msg)
            reload()
          }}
        />
      )}
      {status && <Notice tone="ok">{status}</Notice>}
      {(error || actionError) && <Notice>{error || actionError}</Notice>}

      {!loading && products.length === 0 && !error && (
        <Empty>
          <span className="block">No products added yet.</span>
          {newProducts.length > 0 ? (
            <button type="button" className={`${btnPrimary} mt-4`} onClick={loadStarter}>
              Load the {newProducts.length} starter products
            </button>
          ) : (
            <span className="mt-2 block text-sm">Add your first product with the button above, or import a spreadsheet.</span>
          )}
        </Empty>
      )}

      {products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price (KES)</th>
                <th className="px-4 py-3">Shown on</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'bg-gray-50 text-gray-400'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={assetUrl(p.image)} alt="" className="h-12 w-12 rounded-lg border border-gray-200 object-cover" loading="lazy" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100" />
                      )}
                      <div>
                        <p className="font-semibold text-brand-charcoal">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.brand} · {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category || '—'}</td>
                  <td className="px-4 py-3">{p.price ? p.price.toLocaleString() : <span className="text-gray-400">On request</span>}{p.oldPrice ? <span className="ml-1.5 text-xs text-gray-400 line-through">{p.oldPrice.toLocaleString()}</span> : null}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {!p.active && <Badge tone="red">Hidden</Badge>}
                      {p.active && p.inShop && <Badge tone="green">Shop</Badge>}
                      {p.active && p.inCatalog && <Badge tone="purple">Catalogue</Badge>}
                      {p.active && p.hot && <Badge tone="amber">Hot</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {p.active && (
                        <a href={crossHref(productPath(p))} target="_blank" rel="noopener noreferrer" className={btnGhost} aria-label={`View page for ${p.name}`}>
                          <ExternalLink size={14} /> View
                        </a>
                      )}
                      <button type="button" className={btnGhost} onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button type="button" className={`${btnGhost} text-red-700`} onClick={() => remove(p)} aria-label={`Delete ${p.name}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No products match "{query}".</td></tr>
              )}
            </tbody>
          </table>
          <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">{shown.length} of {products.length} products</p>
        </div>
      )}

      {editing && (
        <ProductForm
          product={editing}
          categories={[...new Set(products.map((p) => p.category).filter(Boolean))]}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null)
            setStatus(msg)
            reload()
          }}
        />
      )}
    </div>
  )
}
