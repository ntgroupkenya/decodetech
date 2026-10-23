// A product added without a photo shows a drawing of its type with the brand name (components/ProductPlaceholder.jsx)
// instead of an empty box. Search engines and link previews only ever get real product photos.
// The type comes from the product's name first (the first rule that matches wins), then from its category.
const NAME_KINDS = [
  ['laptop', /laptop|notebook|macbook|chromebook/i, /bag|sleeve|stand|power bank|ram\b|screen|privacy|charger|lock|backpack|cooling/i],
  ['recorder', /\b(xvr|nvr|nvs|dvr)\b|video recorder/i],
  ['switch', /\bswitch\b(?!er)|\bpoe\b/i],
  ['router', /router|access point|repeater|mi-?fi|wifi dongle|wireless n nano/i],
  ['cable', /305m|cable box/i],
  ['intercom', /intercom|doorbell|alarm kit/i],
  ['headset', /headset|headphone|zone vibe/i],
  ['earbuds', /earbuds|earphones|\bbuds\b/i],
  ['speaker', /speaker/i],
  ['mousepad', /mouse ?pad/i],
  ['combo', /combo|keyboard/i],
  ['mouse', /\bmouse\b/i],
  ['webcam', /webcam|web camera/i],
  ['pan', /pan ?& ?tilt|\bptz?\b|solar camera/i],
  ['cube', /\bcube\b/i],
  ['bullet', /bullet/i],
  ['dome', /dome|eyeball|turret/i],
  ['card', /micro ?sd|\bsd card|sdxc|sdhc|\btf\b/i],
  ['flash', /flash drive|usb flash/i],
  ['ram', /\bram\b|\bddr\d\b|pc[345]\s*\d{4}/i],
  ['nas', /\bnas\b/i],
  ['drive', /\bssd\b|\bhdd\b|hard drive|enclosure/i],
  ['powerbank', /power ?bank/i],
  ['ups', /\bups\b|battery/i],
  ['charger', /charger|travel adapter/i],
  ['dock', /dock|\bhub\b/i],
  ['phone', /ip phone|dect|\bpbx\b/i],
  ['printer', /printer|scanner|laserjet|ecotank/i],
  ['projector', /projector/i],
  ['monitor', /monitor|display|whiteboard|signage|screen|privacy/i],
  ['cord', /cable|adapter|converter|hdmi|\busb\b|extension|splitter|rj45|connector|plug/i],
  ['camera', /camera|cctv/i],
]

const CATEGORY_KINDS = {
  Laptops: 'laptop', Desktops: 'tower', 'All-in-One PCs': 'aio', Monitors: 'monitor', 'Interactive Displays': 'monitor',
  'Replacement Screens': 'monitor', 'Privacy Filters': 'monitor', 'Printers & Scanners': 'printer', 'Projectors & Screens': 'projector',
  'Memory (RAM)': 'ram', Storage: 'drive', 'Memory Cards & Flash Drives': 'card', 'Laptop Bags & Sleeves': 'bag',
  'Laptop & Phone Stands': 'stand', 'Power Banks': 'powerbank', Chargers: 'charger', 'Car Accessories': 'charger',
  'Docks & Hubs': 'dock', 'Cables & Adapters': 'cord', 'Network Storage (NAS)': 'nas', 'UPS & Power': 'ups',
  'IP Phones & PBX': 'phone', 'CCTV Recorders': 'recorder', 'CCTV Cameras': 'bullet', 'Intercoms & Alarms': 'intercom',
  'Keyboards & Mice': 'mouse', Audio: 'headset', 'Webcams & Presenters': 'webcam', Networking: 'switch',
}

export function placeholderKind(product) {
  const name = String(product.name || '')
  const category = product.categoryName || product.category || ''
  // Computers are recognised by their category, so a laptop that "comes with a mouse" is still drawn as a laptop.
  if (['laptop', 'tower', 'aio'].includes(CATEGORY_KINDS[category])) return CATEGORY_KINDS[category]
  const rule = NAME_KINDS.find(([, match, unless]) => match.test(name) && !(unless && unless.test(name)))
  if (rule) return rule[0] === 'camera' ? 'bullet' : rule[0]
  return CATEGORY_KINDS[category] || (/laptop/i.test(category) ? 'laptop' : 'box')
}

// { images, placeholder }: the product's own photos, or what to draw ({ kind, brand }) when it has none.
export function productPhotos(product) {
  const own = [product.image, ...(product.alternateImages || [])].filter(Boolean)
  return { images: own, placeholder: own.length > 0 ? null : { kind: placeholderKind(product), brand: product.brand || '' } }
}
