import { useRef, useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { api } from '../../api'
import { downloadTemplate, parseProductFile } from './importParser'
import { Notice } from './Widgets'
import { btnGhost, btnPrimary } from './ui'

export default function ImportPanel({ currentProducts, onDone }) {
  const inputRef = useRef(null)
  const [parsed, setParsed] = useState(null) // { fileName, rows, ignoredColumns }
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const choose = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setResult(null)
    setParsed(null)
    try {
      const { rows, ignoredColumns } = await parseProductFile(file)
      setParsed({ fileName: file.name, rows, ignoredColumns })
    } catch (e) {
      setError(e.message)
    }
  }

  const confirm = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await api('/admin/products/import', { method: 'POST', body: { rows: parsed.rows } })
      setResult(res)
      setParsed(null)
      onDone(`Import finished: ${res.added} added, ${res.updated} updated${res.skipped.length ? `, ${res.skipped.length} skipped` : ''}.`)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3 rounded-md border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-charcoal">Import products from a spreadsheet</h2>
          <p className="text-sm text-gray-600">
            Upload a <strong>.xlsx</strong> or <strong>.csv</strong> with a header row. Only <code>name</code> is required. Rows whose <code>id</code> already exists are updated; the rest are added.
          </p>
        </div>
        <button type="button" className={btnGhost} onClick={() => downloadTemplate(currentProducts.slice(0, 3))}>
          <Download size={16} /> Download template
        </button>
      </div>

      <input ref={inputRef} type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={choose} className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-teal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-charcoal hover:file:bg-brand-teal-light" />

      {error && <Notice>{error}</Notice>}

      {parsed && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <FileSpreadsheet size={16} /> {parsed.fileName}: {parsed.rows.length} rows ready to import
          </p>
          {parsed.ignoredColumns.length > 0 && <Notice tone="info">Ignored columns: {parsed.ignoredColumns.join(', ')}</Notice>}
          <div className="max-h-64 overflow-auto rounded-md border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-gray-50 text-gray-500">
                <tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Brand</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">ID</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsed.rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className={r.name ? '' : 'bg-red-50'}>
                    <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-1.5">{r.name || <em className="text-red-700">missing name (will be skipped)</em>}</td>
                    <td className="px-3 py-1.5">{r.brand}</td>
                    <td className="px-3 py-1.5">{r.category}</td>
                    <td className="px-3 py-1.5">{r.price}</td>
                    <td className="px-3 py-1.5 text-gray-500">{r.id || 'new'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.rows.length > 50 && <p className="text-xs text-gray-500">Showing the first 50 of {parsed.rows.length} rows.</p>}
          <div className="flex gap-3">
            <button type="button" className={btnPrimary} onClick={confirm} disabled={busy}>{busy ? 'Importing…' : `Import ${parsed.rows.length} rows`}</button>
            <button type="button" className={btnGhost} onClick={() => setParsed(null)} disabled={busy}>Cancel</button>
          </div>
        </div>
      )}

      {result && result.skipped.length > 0 && (
        <Notice tone="info">Skipped rows: {result.skipped.map((s) => `#${s.row} (${s.reason})`).join(', ')}</Notice>
      )}
    </section>
  )
}
