// Packages the built site as one upload for the web host.
//   npm run package        (builds, pre-renders, then runs this)
//
// Produces:
//   deploy/site/ + decode-site.zip   www.<domain>: the Shop, product pages, login/sign-up, the admin (/admin),
//                                    the PHP API, config.local.php, uploads/ and an optional database export
// The database details for config.local.php come from deploy.local.json (not committed).
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { ROOT_DOMAIN, SITE_HOST, SITE_URL } from '../src/siteHosts.js'

const root = process.cwd()
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
const distDir = path.resolve(arg('dist', 'dist-build'))
const deployDir = path.resolve(arg('out', 'deploy'))
const makeZips = !process.argv.includes('--no-zip')
const templates = path.join(root, 'deploy-templates')

if (!fs.existsSync(path.join(distDir, 'app-shell.html')) || !fs.readFileSync(path.join(distDir, 'index.html'), 'utf8').includes('data-route="/"')) {
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
    .replaceAll('{{SITE_HOST}}', SITE_HOST)
    .replaceAll('{{SITE_URL}}', SITE_URL)
    .replaceAll('{{DB_NAME}}', phpString(db.db_name || 'CHANGE_ME_database_name'))
    .replaceAll('{{DB_USER}}', phpString(db.db_user || 'CHANGE_ME_database_user'))
    .replaceAll('{{DB_PASS}}', phpString(db.db_pass || 'CHANGE_ME_database_password'))
const template = (name) => fill(fs.readFileSync(path.join(templates, name), 'utf8'))

fs.rmSync(deployDir, { recursive: true, force: true })
const siteDir = path.join(deployDir, 'site')
fs.mkdirSync(siteDir, { recursive: true })

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

// ---- the site + the PHP backend ----
copyTree(distDir, siteDir)
for (const file of ['api.php', 'db.php', 'config.php']) fs.copyFileSync(path.join(root, 'server', file), path.join(siteDir, file))
const uploadsSrc = path.join(root, 'server', 'uploads')
const uploadsDst = path.join(siteDir, 'uploads')
fs.mkdirSync(uploadsDst, { recursive: true })
if (fs.existsSync(uploadsSrc)) {
  for (const file of fs.readdirSync(uploadsSrc)) {
    if (fs.statSync(path.join(uploadsSrc, file)).isFile()) fs.copyFileSync(path.join(uploadsSrc, file), path.join(uploadsDst, file))
  }
}
fs.writeFileSync(path.join(siteDir, '.htaccess'), template('htaccess'))
fs.writeFileSync(path.join(siteDir, '.user.ini'), fs.readFileSync(path.join(templates, 'user.ini'), 'utf8'))
fs.writeFileSync(path.join(siteDir, 'config.local.php'), template('config.local.php.template'))

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
    fs.mkdirSync(path.join(siteDir, 'database'), { recursive: true })
    fs.writeFileSync(path.join(siteDir, 'database', 'products-and-offers.sql'), result.stdout)
    dumped = true
    break
  }
}

// The instructions go next to the zip (and in the upload, where the web server refuses to serve them).
const readme = template('README-DEPLOY.txt')
fs.writeFileSync(path.join(deployDir, 'README-DEPLOY.txt'), readme)
fs.writeFileSync(path.join(siteDir, 'README-DEPLOY.txt'), readme)

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
const zipName = 'decode-site.zip'
const zipped = makeZips && zip(zipName, siteDir)
console.log(`deploy/ ready (skipped ${skipped} unused PNG originals):`)
console.log(`  ${zipName}  ${count(siteDir)} files  ${zipped ? `${mb(path.join(root, zipName))} MB` : '(not zipped)'}  -> ${SITE_HOST}`)
console.log(dumped ? '  database/products-and-offers.sql included in the upload.' : '  ! No database export (mysqldump not found); use "Load the starter products" in the admin instead.')
if (!db.db_name) console.log('  ! deploy.local.json not found: fill in the database details in config.local.php after uploading.')
