import Papa from 'papaparse'

// Spreadsheet header -> product field. Headers are compared lowercased with non-alphanumerics removed.
const ALIASES = {
  id: 'id', sku: 'id', productid: 'id', code: 'id',
  name: 'name', productname: 'name', title: 'name', product: 'name', item: 'name',
  brand: 'brand', make: 'brand', manufacturer: 'brand',
  category: 'category', type: 'category',
  categoryname: 'categoryName', categorylabel: 'categoryName', department: 'categoryName',
  specs: 'specs', specifications: 'specs', description: 'specs', details: 'specs', spec: 'specs',
  image: 'image', imageurl: 'image', photo: 'image', picture: 'image', img: 'image',
  alternateimages: 'alternateImages', altimages: 'alternateImages', images: 'alternateImages', extraimages: 'alternateImages',
  price: 'price', priceksh: 'price', pricekes: 'price', cost: 'price', amount: 'price',
  hotfeature: 'hotFeature', feature: 'hotFeature', highlight: 'hotFeature', keyfeature: 'hotFeature', sellingpoint: 'hotFeature',
  condition: 'condition', state: 'condition', grade: 'condition', itemcondition: 'condition',
  freegift: 'freeGift', gift: 'freeGift', bonus: 'freeGift', freebie: 'freeGift',
  oldprice: 'oldPrice', wasprice: 'oldPrice', was: 'oldPrice', originalprice: 'oldPrice', compareatprice: 'oldPrice', rrp: 'oldPrice',
  inshop: 'inShop', shop: 'inShop', showinshop: 'inShop', onshop: 'inShop',
  incatalog: 'inCatalog', catalog: 'inCatalog', catalogue: 'inCatalog', showincatalog: 'inCatalog', showincatalogue: 'inCatalog',
  hot: 'hot', hotproduct: 'hot', featured: 'hot',
  active: 'active', visible: 'active', enabled: 'active', published: 'active',
}

export const TEMPLATE_HEADERS = ['id', 'name', 'brand', 'category', 'categoryName', 'specs', 'image', 'alternateImages', 'price', 'oldPrice', 'freeGift', 'condition', 'hotFeature', 'inShop', 'inCatalog', 'active', 'hot']

const normalizeHeader = (h) => String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

function rowsFromMatrix(matrix) {
  const filtered = matrix.filter((row) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''))
  if (filtered.length < 2) throw new Error('The file needs a header row and at least one product row.')
  const headers = filtered[0].map((h) => ALIASES[normalizeHeader(h)] || null)
  if (!headers.includes('name')) throw new Error('No "name" column found. Add a column headed "name" (see the template).')
  const unknown = filtered[0].filter((h, i) => !headers[i] && String(h ?? '').trim() !== '').map(String)
  const rows = filtered.slice(1).map((cells) => {
    const obj = {}
    headers.forEach((field, i) => {
      if (!field) return
      const v = cells[i]
      if (v === null || v === undefined || String(v).trim() === '') return
      obj[field] = typeof v === 'string' ? v.trim() : v
    })
    return obj
  })
  return { rows, ignoredColumns: unknown }
}

export async function parseProductFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'csv' || ext === 'txt') {
    const text = await file.text()
    const result = Papa.parse(text.replace(/^﻿/, ''), { skipEmptyLines: true })
    return rowsFromMatrix(result.data)
  }
  if (ext === 'xlsx') {
    const { readSheet } = await import('read-excel-file/browser')
    return rowsFromMatrix(await readSheet(file))
  }
  throw new Error('Unsupported file type. Upload a .xlsx or .csv file. (Old .xls files: re-save as .xlsx or .csv.)')
}

export function downloadTemplate(sampleRows = []) {
  const data = [TEMPLATE_HEADERS, ...sampleRows.map((p) => TEMPLATE_HEADERS.map((h) => {
    const v = h === 'alternateImages' ? (p.alternateImages || []).join('|') : p[h]
    return v === undefined || v === null ? '' : v
  }))]
  const csv = '﻿' + Papa.unparse(data)
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'products-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}
