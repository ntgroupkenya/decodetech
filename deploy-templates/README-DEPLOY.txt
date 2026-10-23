DECODE IT Solutions: HOW TO PUT THE SITE ON THE WEB HOST
=======================================================

There is one zip file, decode-site.zip, for one address:

  {{SITE_URL}}/            the Shop
  {{SITE_URL}}/product/... one page per product
  {{SITE_URL}}/login       customer log in and sign up
  {{SITE_URL}}/admin       the admin
  {{SITE_URL}}/api         the PHP API, with the database settings and uploaded photos

You need hosting with PHP 8.1 or newer and MySQL (any cPanel host).


STEP 1  The database (already decided)
  cPanel > MySQL Databases:
    1. create the database   {{DB_NAME}}
    2. create the user       {{DB_USER}}   with the password you chose
    3. "Add User To Database": {{DB_USER}} -> {{DB_NAME}}, tick ALL PRIVILEGES
  These details are ALREADY written into config.local.php inside decode-site.zip. If you change the password
  in cPanel, change it in that file too.

STEP 2  Upload and extract
  cPanel > File Manager. Turn on Settings > "Show Hidden Files" so you can see .htaccess.
    decode-site.zip   into  public_html   then right-click > Extract
  public_html then holds index.html, app-shell.html, assets/, product/, api.php, config.local.php,
  uploads/ and .htaccess. Delete the zip file afterwards.

STEP 3  Turn on HTTPS
  cPanel > SSL/TLS Status > Run AutoSSL. {{ROOT_DOMAIN}} and {{SITE_HOST}} must both have a certificate.
  The logins need HTTPS.

STEP 4  Check it works
  - {{SITE_URL}}/                  the Shop
  - {{SITE_URL}}/api/products      shows {"products":[...]}: the database works (this also creates the tables)
  - {{SITE_URL}}/admin             the admin sign-in
  - https://{{ROOT_DOMAIN}}/        jumps to {{SITE_HOST}}

STEP 5  First admin sign-in
  Go to {{SITE_URL}}/admin and sign in with   Admin   /   Admin123
  You are made to choose your own username and password straight away. Do this immediately.

STEP 6  Your products
  Option A: if public_html/database/products-and-offers.sql exists: phpMyAdmin > {{DB_NAME}} > Import that file
            (AFTER step 4, which creates the tables). It carries your products and offers, never passwords.
            Then delete the "database" folder from public_html.
  Option B: in the admin, Products & Shop > "Load the starter products", or import a spreadsheet.
  Product photos you add in the admin are saved in public_html/uploads (it must stay writable).

STEP 7  Search engines
  Google Search Console / Bing Webmaster Tools: add {{SITE_URL}} and submit {{SITE_URL}}/sitemap.xml
  (The admin is hidden from search engines.)

LATER: updating the site
  Run   npm run package   on your computer (with MySQL and `npm run api` running) and upload the new zip.
  Do NOT overwrite config.local.php or the uploads folder: before extracting, delete config.local.php and
  uploads/ from the NEW zip (or extract it elsewhere and copy the rest over).

Problems?
  - "Database error": the details in public_html/config.local.php are wrong, or the user was not added to the
    database with ALL PRIVILEGES.
  - The admin cannot sign in: HTTPS must work on {{SITE_HOST}}.
  - Uploading a photo fails: ask the host to allow uploads of at least 6 MB (.user.ini asks for it).
  - A white page or "404" on a product link: the .htaccess file is missing (it starts with a dot).
