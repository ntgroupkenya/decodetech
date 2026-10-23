// Packages the built site as three uploads, one per address.
//   npm run package        (builds, pre-renders, then runs this)
//
// Produces:
//   deploy/www/    + decode-www.zip     www.<domain>: the main site, the PHP API, config.local.php, uploads/, database export
//   deploy/shop/   + decode-shop.zip    shop.<domain>: the Shop page, login and sign-up
//   deploy/admin/  + decode-admin.zip   admin.<domain>: the admin
// The database details for config.local.php come from deploy.local.json (not committed).
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { ADMIN_HOST, ADMIN_URL, MAIN_HOST, MAIN_URL, ROOT_DOMAIN, SHOP_HOST, SHOP_URL } from '../src/siteHosts.js'

const root = process.cwd()
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
const distDir = path.resolve(arg('dist', 'dist-build'))
const deployDir = path.resolve(arg('out', 'deploy'))
const makeZips = !process.argv.includes('--no-zip')
const templates = path.join(root, 'deploy-templates')

if (!fs.existsSync(path.join(distDir, 'app-shell.html')) || !fs.existsSync(path.join(distDir, 'shop', 'index.html'))) {
  throw new Error('dist-build/ is missing or not pre-rendered. Run `npm run package`, which builds it first.')
}

const secretsFile = path.join(root, 'deploy.local.json')
const db = fs.existsSync(secretsFile) ? JSON.parse(fs.readFileSync(secretsFile, 'utf8')) : {}
const phpString = (v) => String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const rx = (host) => host.replace(/\./g, '\\.')
const fill = (text) =>
  text
    .replaceAll('{{ROOT_DOMAIN_RX}}', rx(ROOT_DOMAIN))
    .replaceAll('{{ROOT_DOMAIN}}', ROOT_DOMAIN)
    .replaceAll('{{MAIN_HOST}}', MAIN_HOST)
    .replaceAll('{{SHOP_HOST}}', SHOP_HOST)
    .replaceAll('{{ADMIN_HOST}}', ADMIN_HOST)
    .replaceAll('{{MAIN_URL}}', MAIN_URL)
    .replaceAll('{{SHOP_URL}}', SHOP_URL)
    .replaceAll('{{ADMIN_URL}}', ADMIN_URL)
    .replaceAll('{{COOKIE_DOMAIN}}', `.${ROOT_DOMAIN}`)
    .replaceAll('{{DB_NAME}}', phpString(db.db_name || 'CHANGE_ME_database_name'))
    .replaceAll('{{DB_USER}}', phpString(db.db_user || 'CHANGE_ME_database_user'))
    .replaceAll('{{DB_PASS}}', phpString(db.db_pass || 'CHANGE_ME_database_password'))
const template = (name) => fill(fs.readFileSync(path.join(templates, name), 'utf8'))

fs.rmSync(deployDir, { recursive: true, force: true })
const dirs = { www: path.join(deployDir, 'www'), shop: path.join(deployDir, 'shop'), admin: path.join(deployDir, 'admin') }
for (const dir of Object.values(dirs)) fs.mkdirSync(dir, { recursive: true })

// Copies the built site, skipping Netlify's redirects file and PNG originals that a .webp replaced.
// `keep(relativePath)` decides which files go in.
let skipped = 0
function copyTree(from, to, keep = () => true, base = from) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name)
    const rel = path.relative(base, src).replace(/\\/g, '/')
    if (entry.isDirectory()) {
      copyTree(src, path.join(to, entry.name), keep, base)
      continue
    }
    if (entry.name === '_redirects' || !keep(rel)) continue
    if (entry.name.endsWith('.png') && fs.existsSync(src.replace(/\.png$/, '.webp'))) {
      skipped++
      continue
    }
    fs.mkdirSync(to, { recursive: true })
    fs.copyFileSync(src, path.join(to, entry.name))
  }
}

// The shop and admin folders only carry the site's code and icons. Images, PDFs and every other file are kept once,
// in the www folder: their .htaccess sends any file they don't have to the same path on www (browsers cache that).
const codeOnly = (rel) => rel.startsWith('assets/') || /^favicon(-48)?\.(svg|jpg|png)$/.test(rel)

// ---- www: the main site + the PHP backend ----
copyTree(distDir, dirs.www, (rel) => rel !== 'sitemap-shop.xml')
for (const file of ['api.php', 'db.php', 'config.php']) fs.copyFileSync(path.join(root, 'server', file), path.join(dirs.www, file))
const uploadsSrc = path.join(root, 'server', 'uploads')
const uploadsDst = path.join(dirs.www, 'uploads')
fs.mkdirSync(uploadsDst, { recursive: true })
if (fs.existsSync(uploadsSrc)) {
  for (const file of fs.readdirSync(uploadsSrc)) {
    if (fs.statSync(path.join(uploadsSrc, file)).isFile()) fs.copyFileSync(path.join(uploadsSrc, file), path.join(uploadsDst, file))
  }
}
fs.writeFileSync(path.join(dirs.www, '.htaccess'), template('htaccess'))
fs.writeFileSync(path.join(dirs.www, '.user.ini'), fs.readFileSync(path.join(templates, 'user.ini'), 'utf8'))
fs.writeFileSync(path.join(dirs.www, 'config.local.php'), template('config.local.php.template'))

// Optional: products and offers from the local database, importable through phpMyAdmin.
let dumped = false
const dumpers = [process.env.MYSQLDUMP, 'mysqldump', 'C:\\xampp\\mysql\\bin\\mysqldump.exe'].filter(Boolean)
for (const exe of dumpers) {
  const result = spawnSync(
    exe,
    ['-uroot', '--no-create-info', '--replace', '--complete-insert', '--skip-comments', '--skip-add-locks', '--skip-disable-keys', '--skip-extended-insert', 'decode', 'products', 'offers'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  if (result.status === 0 && /REPLACE INTO|INSERT INTO/.test(result.stdout)) {
    fs.mkdirSync(path.join(dirs.www, 'database'), { recursive: true })
    fs.writeFileSync(path.join(dirs.www, 'database', 'products-and-offers.sql'), result.stdout)
    dumped = true
    break
  }
}

// ---- shop: the Shop page is the folder's index.html ----
copyTree(distDir, dirs.shop, codeOnly)
fs.copyFileSync(path.join(distDir, 'shop', 'index.html'), path.join(dirs.shop, 'index.html'))
fs.copyFileSync(path.join(distDir, 'app-shell.html'), path.join(dirs.shop, 'app-shell.html'))
fs.copyFileSync(path.join(distDir, 'sitemap-shop.xml'), path.join(dirs.shop, 'sitemap.xml'))
fs.writeFileSync(
  path.join(dirs.shop, 'robots.txt'),
  `# ${SHOP_HOST}\nUser-agent: *\nAllow: /\n\nSitemap: ${SHOP_URL}/sitemap.xml\n`,
)
fs.writeFileSync(path.join(dirs.shop, '.htaccess'), template('htaccess-shop'))

// ---- admin: just the app shell and its files, hidden from search engines ----
copyTree(distDir, dirs.admin, codeOnly)
// No Google Tag Manager in the admin, so the owner's own visits are not counted.
const adminShell = fs
  .readFileSync(path.join(distDir, 'app-shell.html'), 'utf8')
  .replace(/[ \t]*<!-- Google Tag Manager( \(noscript\))? -->[\s\S]*?<!-- End Google Tag Manager( \(noscript\))? -->\r?\n?/g, '')
if (adminShell.includes('googletagmanager')) throw new Error('Could not remove Google Tag Manager from the admin page.')
fs.writeFileSync(path.join(dirs.admin, 'app-shell.html'), adminShell)
fs.writeFileSync(path.join(dirs.admin, 'robots.txt'), `# ${ADMIN_HOST}\nUser-agent: *\nDisallow: /\n`)
fs.writeFileSync(path.join(dirs.admin, '.htaccess'), template('htaccess-admin'))

// The instructions go next to the zips (and in the www upload, where the web server refuses to serve them).
const readme = template('README-DEPLOY.txt')
fs.writeFileSync(path.join(deployDir, 'README-DEPLOY.txt'), readme)
fs.writeFileSync(path.join(dirs.www, 'README-DEPLOY.txt'), readme)

// ---- zips (Windows' own tar.exe writes real .zip files that every host can extract) ----
const tarExe = [path.join(process.env.SystemRoot || 'C:/Windows', 'System32', 'tar.exe')].find((p) => fs.existsSync(p)) || 'tar'
function zip(name, sourceDir) {
  const target = path.join(root, name)
  fs.rmSync(target, { force: true })
  const result = spawnSync(tarExe, ['-a', '-cf', target, '-C', sourceDir, '.'], { encoding: 'utf8' })
  if (result.status !== 0 || !fs.existsSync(target)) {
    const why = (result.stderr || result.error?.message || '').trim()
    console.warn(`! Could not create ${name}: ${why}. Zip ${path.relative(root, sourceDir)} yourself.`)
    return false
  }
  return true
}

const count = (dir) => fs.readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).length
const mb = (file) => (fs.statSync(file).size / 1048576).toFixed(1)
console.log(`deploy/ ready (skipped ${skipped} unused PNG originals):`)
for (const [key, host] of [['www', MAIN_HOST], ['shop', SHOP_HOST], ['admin', ADMIN_HOST]]) {
  const name = `decode-${key}.zip`
  const zipped = makeZips && zip(name, dirs[key])
  console.log(`  ${name.padEnd(16)} ${String(count(dirs[key])).padStart(4)} files  ${zipped ? `${mb(path.join(root, name))} MB` : '(not zipped)'}  -> ${host}`)
}
console.log(dumped ? '  database/products-and-offers.sql included in the www upload.' : '  ! No database export (mysqldump not found); use "Load the starter products" in the admin instead.')
if (!db.db_name) console.log('  ! deploy.local.json not found: fill in the database details in config.local.php after uploading.')
