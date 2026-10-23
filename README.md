# DECODE IT Solutions

Website for DECODE IT Solutions (DECODE Technologies, part of NT Group by Nemsey Traders Ltd), "Computing, made easy" (three-site build: www, shop and admin). Built from the JOJO Tech Solutions site; the content follows www.ntgroup.co.ke/decode. Some placeholders remain; see "Setting up for a new client" below.

## Brand theme

- Name and tagline: `SITE_NAME` and `TAGLINE` in `src/siteDefaults.js` (used by page titles, the home and About pages and the footer). `index.html` repeats them for search engines.
- Colours, sampled from the logo: `@theme` in `src/index.css` (mirrored in `tailwind.config.js`). Deep indigo `#2A336E` (`brand-charcoal`), deepest indigo `#181E45` (`brand-black`), teal `#48C0B0` (`brand-yellow`, the accent), light teal `#7DD5C8` (`brand-orange`, button hover), red `#E0242B` (`brand-ember`), indigo `#5060A8` (`brand-blue`). The colour names are kept from the template so the class names did not change. Headings use the Saira font (Google Fonts, linked in `index.html`).
- Logo files in `public/`: `logo.png` (the DECODE Technologies logo laid out side by side, for the white nav and footer), `logo-white.png` (the same with white lettering, for dark backgrounds), `favicon.png` (512px) and `favicon-48.png` (the `</>` mark). The original square logo is `decode-logo-2-2.0-2-1042x1042.png` on the old site.

Built with React, Vite, Tailwind CSS and React Router, plus a small PHP + MySQL API (XAMPP) that powers the admin page.

## Setting up for a new client

All branding from the previous client has been removed and replaced with placeholders. Search the project for these and replace them:

| Placeholder | Where | Replace with |
|---|---|---|
| `example.com` | `src/siteHosts.js` (`ROOT_DOMAIN`), `server/config.php`, `index.html`, `public/robots.txt`, `public/sitemap.xml` | the domain (the site uses www., shop. and admin. subdomains) |
| `example.com` in emails/links | — | contact details are filled in (info@decodetech.co.ke, +254 711 294124 calls and WhatsApp, Munyu Road off Accra Road, Nairobi); change them in Admin → Settings |
| `cpaneluser_database` / `cpaneluser_admin` | `deploy.local.json` (create it, see `scripts/assemble-deploy.mjs`) | the live cPanel database details |

Copy and images to provide:

- The home hero uses `public/hero-devices.png` (transparent PNG) with live catalogue figures; its category tiles are built from the catalogue.
- Brand images: logos in `public/logos/` (transparent PNG, 120px tall), lifestyle photos and coloured logo cards in `public/brands/`. They are wired up in `src/brands.js` (`BRAND_INFO`: logo, blurb, photo, card), `src/data/partnerLogos.js` (the two scrolling logo rows on the home page), `BRAND_TILES` in `src/pages/Home.jsx` (the "Shop by brand" photo grid), `heroSlides` in `src/pages/Shop.jsx` (Shop slider, auto-advances every 6 s) and `FEATURED` in `src/pages/Brands.jsx` (coloured cards).
- Home-page wording: the hero intro line in `src/pages/Home.jsx` and the "Why DECODE" points (`REASONS`); About page steps and values (`STEPS`, `VALUES` in `src/pages/About.jsx`); chat-widget questions (`TOPICS` in `src/components/WhatsAppWidget.jsx`).
- `public/social-meta.jpg`: 1200×630 image shown when the site is shared (referenced from `index.html`).
- `public/how-to-order.pdf`: print it from `docs/how-to-order.html` (see `docs/README.md`). Linked from the Shop and How to Order pages.
- Products: `src/data/newProducts.js` (one example product), or import a spreadsheet in the admin. Brand logos and blurbs go in `src/brands.js`, category copy in `src/data/categoryContent.js`.
- Wording: `src/pageMeta.js` (titles/descriptions), `src/pages/Home.jsx`, `src/pages/About.jsx`, `src/components/Footer.jsx`.
- Google Tag Manager: removed. Paste the client's snippet into `index.html` if they want tracking.
- Map: the Google Maps embed in `src/pages/Contact.jsx` points at a generic location.

## Running locally

1. Start **MySQL** from the XAMPP Control Panel (the database `decode` and its tables are created automatically on first use).
2. In one terminal: `npm run api` starts the PHP API on http://localhost:8080 using XAMPP's PHP.
3. In another: `npm run dev` starts the site on http://localhost:5173 and proxies `/api` and `/uploads` to the API.
4. Open http://localhost:5173/login and sign in as `Admin` / `Admin123`. You go straight to `/admin`, which makes you choose your own username and password before anything else.
5. In **Products & Shop**, add products one at a time or import a spreadsheet. Until then every page shows "No products added yet" / "No categories added yet".

Using Apache instead of `npm run api`: copy `server/` to `C:\xampp\htdocs\decode-api` and set `VITE_DEV_API_TARGET=http://localhost/decode-api` in `.env.local`.

## Admin page (`/admin`)

- **Products & Shop**: add, edit, delete, hide products; choose whether each shows in the Shop and/or the Catalogue; upload images; import from `.xlsx` / `.csv` (download the template from the import panel; only `name` is required, rows with an existing `id` are updated, only the columns present change). Each product row has a **View** link to its own page.
- **Offers**: create member discounts, coupon codes and delivery offers (optionally limited by category, minimum price and dates).
- **Customers**: accounts created through Sign up.
- **Settings**: change the admin username and password.
- **Messages**: contact-form submissions, with handled / new status.
- **Clicks**: every WhatsApp button or link click, and the most clicked products.
- **Orders**: each "Order via WhatsApp" press is logged as an order; mark it dispatched, not dispatched, cancelled or pending, with notes.

## Shop highlights

The top of the Shop shows tabs for whichever of these have products (empty lists are hidden):

- **Hot products**: tick "Hot product" on a product in the admin (or add a `hot` column to an import).
- **Best sellers**: products with the most orders you marked **Dispatched** in the Orders tab.
- **Most clicked**: products shoppers opened or ordered most in the last 30 days (opening a product photo or pressing a WhatsApp button counts).

Hot products are shown with larger cards than the other two tabs. Below the highlights, shoppers can switch the product list between **Grid** and **List**
and choose how many products sit in each grid row (1-6 on large screens; phones and tablets automatically show fewer). The choice is remembered on their device.

Images: product photos are 1200px JPEGs; the hero and category backgrounds are WebP. The untouched originals are in `product-originals/` and `image-originals/` (not committed).

Log in / Sign up links appear in the navigation on the Shop pages only.

## Shopping cart

Shoppers can add several products and send them to WhatsApp as one order. Each product photo has a small cart icon, product pages have an **Add to cart** button, and the menu has a cart icon with a count. The cart opens as a side panel with quantities, a delivery address box, member discounts, coupons and delivery offers, and **Send order on WhatsApp**. The single-product **Order** and **Get Quote** buttons still work as before.

- The cart is stored in a cookie (`decode_cart`: product ids and quantities only, for 30 days), shared between the main site and the shop address so items added on one are in the cart on the other. It holds up to 12 different items.
- One WhatsApp message lists every item with its quantity, price and product page link (WhatsApp shows a photo card for the first link), plus the address, any member offers and an `Order ref`.
- The admin gets one order per item; items sent together share a cart reference (shown on each order in the Orders tab), together with the quantity and delivery address.
- The cart panel is in `src/components/CartDrawer.jsx`; the cart state is in `src/cart/`.

## Ordering guide

How to order is explained in two forms, both linked from the Shop's "How to Order" section, the footer and the cart panel:

- a web page, `/how-to-order` (`src/pages/HowToOrder.jsx`), which is pre-rendered, listed in the sitemap and has its own search title and description;
- a one-page printable sheet, `public/how-to-order.pdf`, served on both addresses. Its editable source and how to rebuild the PDF are in `docs/`.

If the steps change, update both.

## Customer accounts and offers

Visitors can sign up or log in (`/signup`, `/login`). Offers are visible to signed-in members only. In the Shop, **Order via WhatsApp** opens a
checkout step first: members pick a discount *or* coupon (the cheapest wins; they don't stack) and optionally a delivery offer, guests are invited to
sign up or continue without offers. The chosen offers are added to the WhatsApp message, and the server re-checks them and stores them on the order
(with the price the member should pay) so the Orders tab shows what was promised.

If the API is unreachable the public site falls back to the products bundled in `src/data/newProducts.js`.

## SEO

- `npm run build` builds the site, then **pre-renders** Home, Shop, Products, Brands, About, Contact, **one page per category** (`/category/<name>`, e.g. `/category/water-pumps`) **and one page for every active product** (`/product/<id>/<name>`) into real HTML. Each has its own title, description, canonical link and structured data (`Product` on product pages, `LocalBusiness` everywhere), so search engines and link previews don't need JavaScript. Login, Sign up and Admin are not pre-rendered; they load `dist/app-shell.html` (see `public/_redirects`).
- **Product pages and the sitemap come from the database at build time.** Before building, start MySQL and `npm run api`; the build reads `http://localhost:8080` (override with `--api <url>` or `PRERENDER_API`). If the API can't be reached it warns and falls back to the bundled catalogue. It also writes `dist/sitemap.xml` (site pages plus every product, with last-modified dates).
- **After adding, editing or removing products, run `npm run build` and deploy again** so the product pages and sitemap match the database. Until then, a product added in the admin still works at its page address (the page loads it from the API) but isn't in the sitemap, and a deleted product's old page shows "Product not found" (marked noindex).
- **Category pages** are made automatically from the `category` of your products, so a new category in the admin gets a page on the next build. Each has a heading, intro text, brand list, the products, an FAQ and structured data (collection, breadcrumb, product list, FAQ). Hand-written copy for a category lives in `src/data/categoryContent.js` (keyed by the category's slug, e.g. `water-pumps`); categories without an entry get a generated heading and intro, so add an entry to give a new category proper wording. Products link to their category (breadcrumb) and the Shop has "Shop by category" links. The Shop and Products category filters link to these pages; category pages and the Products page also have a search box and brand filter, and the Shop has search and brand filters.
- `GET /api/sitemap` on the PHP server returns the same sitemap live from the database, and `GET /api/products/<id>` returns one product. The site address used in sitemap links is `site_url` in `server/config.php` (override it in `config.local.php`).
- Page titles and descriptions live in `src/pageMeta.js` (`productMeta()` builds the product ones). To add a site page to the pre-render, add it there and to the routes in `src/App.jsx`.
- The live address used in canonical links is `https://example.com` (change `SITE_URL` in `src/pageMeta.js`, or set `VITE_SITE_URL`). Update the same address in `public/robots.txt` and the `LocalBusiness` block in `index.html` if it differs. `public/sitemap.xml` is only a fallback; the build replaces it.

## Scripts

- `npm run dev` dev server
- `npm run api` PHP API (XAMPP)
- `npm run build` production build to `dist/`, including pre-rendering (needs `dist/` to be writable)
- `npm run package` builds, pre-renders and assembles the web-host upload package (see Deployment)
- `npm run lint` oxlint

## Deployment

The site runs on **one cPanel host with PHP 8.1+ and MySQL**, as three addresses, each with its own folder:

- `https://www.example.com` (`public_html`): Home, About, Brands, Products, Contact, product, category and news pages, **plus the PHP API, `config.local.php`, `uploads/`**. `example.com` redirects here.
- `https://shop.example.com`: the Shop page (its `/`), login and sign-up.
- `https://admin.example.com`: the admin (`/admin`).

The shop and admin are static: in the browser they call the API on www (`apiOrigin()` in `src/siteHosts.js`; CORS via `allowed_origins`), and their `.htaccess` redirects `/uploads/` to www. One login cookie (`cookie_domain` `.example.com`) works on all three.

To deploy: start MySQL and `npm run api`, then run `npm run package`. It creates `deploy/www`, `deploy/shop`, `deploy/admin` and `decode-www.zip`, `decode-shop.zip`, `decode-admin.zip`. The live database name, user and password are read from `deploy.local.json` (not committed) into `config.local.php` of the www upload. Step-by-step instructions are in `README-DEPLOY.txt` (template in `deploy-templates/`). When updating the www folder later, don't overwrite `config.local.php` or `uploads/` on the server.
