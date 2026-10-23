# DECODE IT Solutions Shop

Online shop and admin for DECODE IT Solutions (DECODE Technologies, part of NT Group by Nemsey Traders Ltd), "Computing, made easy". The site is just two things on one address:

- **The Shop** at `/`, with a page per product (`/product/<id>/<name>`) and customer accounts (`/login`, `/signup`).
- **The admin** at `/admin`.

Built with React, Vite, Tailwind CSS and React Router, plus a small PHP + MySQL API (XAMPP) served from the same address (`/api`, `/uploads`).

## Look and brand

- Name and tagline: `SITE_NAME` and `TAGLINE` in `src/siteDefaults.js`. `index.html` repeats them for search engines.
- Colours: the five colours of the logo, set in `@theme` in `src/index.css` (mirrored in `tailwind.config.js`):
  charcoal `#383938` (`brand-charcoal`: header, footer, admin sidebar, headings), indigo `#5163AD` (`brand-indigo`: buttons, links, the category bar),
  teal `#4BC1B4` (`brand-teal`: the accent), grey `#BFC0C3` (`brand-grey`: the `/` of the labels) and red `#ED1F24` (`brand-red`: hot products, sale prices, gift ribbons).
  Three shades of them are only for hover states and overlays: `brand-ink`, `brand-indigo-dark`, `brand-teal-light`. The `</>` mark is drawn in its logo colours by `src/components/CodeMark.jsx`.
- Fonts (Google Fonts, linked in `index.html`): Space Grotesk for headings, Inter for text and JetBrains Mono for prices and small labels (the `.code-label` "// label" style echoes the `</>` logo).
- Layout: a charcoal header with the search box, account and cart, and a category bar; the Shop has a charcoal intro panel, the highlights rail, a filter column (a drawer on phones) and the product grid. Cards are flat with square-ish corners.
- Logo files in `public/`: `logo.png`, `logo-white.png` (used on the dark header, footer and admin), `favicon.png` and `favicon-48.png`.

## Setting up

| Placeholder | Where | Replace with |
|---|---|---|
| `example.com` | `src/siteHosts.js` (`ROOT_DOMAIN`, or `VITE_ROOT_DOMAIN`), `server/config.php`, `index.html`, `public/robots.txt`, `public/sitemap.xml` | the domain (the site runs on `www.`) |
| `cpaneluser_database` / `cpaneluser_admin` | `deploy.local.json` (create it, see `scripts/assemble-deploy.mjs`) | the live cPanel database details |

Still to provide:

- `public/social-meta.jpg`: 1200×630 image shown when the site is shared (referenced from `index.html`).
- Products and their photos: add them in the admin, or import a spreadsheet (`docs/decode-products.csv` is an example).
- Contact details, opening hours, announcement bar and social links: Admin → Settings.
- Chat-widget questions: `TOPICS` in `src/components/WhatsAppWidget.jsx`.
- Google Tag Manager: not included. If added to `index.html`, the admin's strict Content-Security-Policy (in the `.htaccess`) blocks it there, which is intended.

## Running locally

1. Start **MySQL** from the XAMPP Control Panel (the database `decode` and its tables are created automatically on first use).
2. In one terminal: `npm run api` starts the PHP API on http://localhost:8080 using XAMPP's PHP.
3. In another: `npm run dev` starts the site on http://localhost:5173 and proxies `/api` and `/uploads` to the API.
4. Open http://localhost:5173/login and sign in as `Admin` / `Admin123`. You go straight to `/admin`, which makes you choose your own username and password before anything else.
5. In **Products & Shop**, add products one at a time or import a spreadsheet. Until then every page shows "No products added yet" / "No categories added yet".

Using Apache instead of `npm run api`: copy `server/` to `C:\xampp\htdocs\decode-api` and set `VITE_DEV_API_TARGET=http://localhost/decode-api` in `.env.local`.

## Admin page (`/admin`)

- **Products & Shop**: add, edit, delete, hide products; choose whether each shows in the Shop; upload images; import from `.xlsx` / `.csv` (download the template from the import panel; only `name` is required, rows with an existing `id` are updated, only the columns present change). Each product row has a **View** link to its own page.
- **Offers**: create member discounts, coupon codes and delivery offers (optionally limited by category, minimum price and dates).
- **Customers**: accounts created through Sign up.
- **Settings**: change the admin username and password.
- **Clicks**: every WhatsApp button or link click, and the most clicked products.
- **Orders**: each "Order via WhatsApp" press is logged as an order; mark it dispatched, not dispatched, cancelled or pending, with notes.

## The Shop

- **Search** is in the header. On the Shop it filters as you type; on other pages it opens the Shop with the search.
- **Filters**: category, brand and condition (shown when products have more than one condition), in the left column on large screens and a drawer on phones. The category bar under the header does the same as the category filter. Sort by price or name.
- Filters live in the address (`/?q=dell&cat=laptops&brand=HP&cond=New&sort=price-asc`), so a filtered view can be shared or bookmarked.
- **Grid or list**, and 2–5 products per row on large screens (phones show 2, tablets up to 3). The choice is remembered on the device.
- **Highlights** above the products, in tabs that only appear when they have products: **Hot products** (tick "Hot product" in the admin, or a `hot` column in an import; shown with slightly wider cards), **Best sellers** (most orders marked **Dispatched**) and **Most clicked** (products opened or ordered most in the last 30 days).
- Each card has **Add to cart**, a green WhatsApp button that orders that one product, and **Get a quote**.
- The intro panel shows the ordering steps (cart, one WhatsApp order, M-Pesa or bank, delivery or pickup) and the members box.

## Shopping cart

Shoppers can add several products and send them to WhatsApp as one order. Each product photo has a small cart icon, product pages have an **Add to cart** button, and the menu has a cart icon with a count. The cart opens as a side panel with quantities, a delivery address box, member discounts, coupons and delivery offers, and **Send order on WhatsApp**. The single-product **Order** and **Get Quote** buttons still work as before.

- The cart is stored in a cookie (`decode_cart`: product ids and quantities only, for 30 days). It holds up to 12 different items.
- One WhatsApp message lists every item with its quantity, price and product page link (WhatsApp shows a photo card for the first link), plus the address, any member offers and an `Order ref`.
- The admin gets one order per item; items sent together share a cart reference (shown on each order in the Orders tab), together with the quantity and delivery address.
- The cart panel is in `src/components/CartDrawer.jsx`; the cart state is in `src/cart/`.

## Customer accounts and offers

Visitors can sign up or log in (`/signup`, `/login`). Offers are visible to signed-in members only. In the Shop, **Order via WhatsApp** opens a
checkout step first: members pick a discount *or* coupon (the cheapest wins; they don't stack) and optionally a delivery offer, guests are invited to
sign up or continue without offers. The chosen offers are added to the WhatsApp message, and the server re-checks them and stores them on the order
(with the price the member should pay) so the Orders tab shows what was promised.

If the API is unreachable the public site falls back to the products bundled in `src/data/newProducts.js`.

## SEO

- `npm run build` builds the site, then **pre-renders** the Shop (`/`) and **one page for every active product** into real HTML, each with its own title, description, canonical link and structured data (`Product` on product pages, `Store` in `index.html`). Login, sign-up and the admin are not pre-rendered; they load `dist/app-shell.html`.
- **Product pages and the sitemap come from the database at build time.** Start MySQL and `npm run api` first; the build reads `http://localhost:8080` (override with `--api <url>` or `PRERENDER_API`). If the API can't be reached it falls back to the bundled catalogue (`src/data/newProducts.js`, empty). It writes `dist/sitemap.xml` (the Shop plus every product).
- After adding, editing or removing products, run `npm run build` and deploy again. Until then a new product still works at its address (the page loads it from the API) but isn't in the sitemap.
- `GET /api/sitemap` returns the same sitemap live from the database. Page titles and descriptions live in `src/pageMeta.js`.

## Scripts

- `npm run dev` dev server (proxies `/api` and `/uploads` to the PHP API)
- `npm run api` PHP API (XAMPP)
- `npm run build` production build to `dist/`, including pre-rendering
- `npm run build:pages` the GitHub Pages preview (set `VITE_BASE=/decodetech/`)
- `npm run package` builds, pre-renders and assembles the web-host upload (see Deployment)
- `npm run lint` oxlint

## GitHub Pages preview

A preview of the shop is published at **https://ntgroupkenya.github.io/decodetech/** on every push to `main` (`.github/workflows/pages.yml`, which runs `npm run build:pages`). GitHub Pages has no PHP or database, so the preview shows the sample products from `docs/decode-products.csv` with the photos in `docs/sample-products/` (`scripts/pages-demo.mjs`); logins, the cart's member offers and the admin need the real API and do not work there. To switch it on once: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Deployment

The site runs on **one cPanel host with PHP 8.1+ and MySQL**, at one address, `https://www.example.com` (`public_html`); `example.com` redirects there. The Shop, product pages, login, the admin, the PHP API, `config.local.php` and `uploads/` all live in that one folder. The `.htaccess` serves `/admin` with strict security headers and sends the old addresses of the previous site (`/shop`, `/about`, `/news`, `/category/...`) to the Shop.

To deploy: start MySQL and `npm run api`, then run `npm run package`. It creates `deploy/site` and `decode-site.zip`. The live database details are read from `deploy.local.json` (not committed) into `config.local.php`. Step-by-step instructions are in `README-DEPLOY.txt` (template in `deploy-templates/`). When updating later, don't overwrite `config.local.php` or `uploads/` on the server.
