DECODE IT Solutions: HOW TO PUT THE THREE SITES ON THE WEB HOST
=============================================================

There are three zip files, one per address. Each one is extracted into that address's own folder:

  decode-www.zip     ->  {{MAIN_URL}}     Home, About, Brands, Products, Contact, product/category pages, news
                                          + the PHP API, the database settings and uploaded photos
  decode-shop.zip    ->  {{SHOP_URL}}    the Shop (login and sign-up work here too)
  decode-admin.zip   ->  {{ADMIN_URL}}   the admin

The shop and the admin have no PHP, database or images of their own: they use the API in the www folder,
and every image (product photos, banners, logos, uploads) is stored once, in the www folder.
So the www site must be uploaded and working for the shop and admin to show products and pictures.
One login works on all three addresses.

You need hosting with PHP 8.1 or newer and MySQL (any cPanel host).


STEP 1  The database (already decided)
  cPanel > MySQL Databases:
    1. create the database   {{DB_NAME}}
    2. create the user       {{DB_USER}}   with the password you chose
    3. "Add User To Database": {{DB_USER}} -> {{DB_NAME}}, tick ALL PRIVILEGES
  These details are ALREADY written into config.local.php inside decode-www.zip. If you change the password
  in cPanel, change it in that file too.

STEP 2  Create the two subdomains
  cPanel > Domains (or Subdomains) > Create:
      shop.{{ROOT_DOMAIN}}     document root e.g.  shop.{{ROOT_DOMAIN}}
      admin.{{ROOT_DOMAIN}}    document root e.g.  admin.{{ROOT_DOMAIN}}
  Each gets its OWN folder (cPanel suggests one; accept it). Note the folder names.
  The main domain ({{ROOT_DOMAIN}} and www.{{ROOT_DOMAIN}}) uses "public_html".

STEP 3  Upload and extract
  cPanel > File Manager. Turn on Settings > "Show Hidden Files" so you can see .htaccess.
    decode-www.zip    into  public_html                  then right-click > Extract
    decode-shop.zip   into  the shop subdomain's folder  then Extract
    decode-admin.zip  into  the admin subdomain's folder then Extract
  public_html: index.html, assets/, products/, logos/, api.php, .htaccess ...
  shop folder:  index.html, app-shell.html, assets/, .htaccess (small: no images)
  admin folder: app-shell.html, assets/, .htaccess (small: no images)
  public_html also has config.local.php and uploads/. Delete the zip files afterwards.

STEP 4  Turn on HTTPS for all addresses
  cPanel > SSL/TLS Status > Run AutoSSL. {{ROOT_DOMAIN}}, www.{{ROOT_DOMAIN}}, shop.{{ROOT_DOMAIN}}
  and admin.{{ROOT_DOMAIN}} must all have a certificate. The logins need HTTPS.

STEP 5  Check it works
  - {{MAIN_URL}}/                  the home page
  - {{MAIN_URL}}/api/products      shows {"products":[...]}: the database works (this also creates the tables)
  - {{SHOP_URL}}/                 the Shop, with products
  - {{ADMIN_URL}}/                the admin sign-in
  - https://{{ROOT_DOMAIN}}/        jumps to www
  - {{MAIN_URL}}/shop              jumps to the shop address
  - {{MAIN_URL}}/admin             jumps to the admin address

STEP 6  First admin sign-in
  Go to {{ADMIN_URL}} and sign in with   Admin   /   Admin123
  You are made to choose your own username and password straight away. Do this immediately.

STEP 7  Your products
  Option A: if public_html/database/products-and-offers.sql exists: phpMyAdmin > {{DB_NAME}} > Import that file
            (AFTER step 5, which creates the tables). It carries your products and offers, never passwords.
            Then delete the "database" folder from public_html.
  Option B: in the admin, Products & Shop > "Load the starter products".
  Product photos you add in the admin are saved in public_html/uploads (it must stay writable).

STEP 8  Search engines
  Google Search Console / Bing Webmaster Tools: add
      {{MAIN_URL}}    and submit  {{MAIN_URL}}/sitemap.xml
      {{SHOP_URL}}   and submit  {{SHOP_URL}}/sitemap.xml
  (The admin is hidden from search engines.)

LATER: updating the site
  Run   npm run package   on your computer (with MySQL and `npm run api` running) and upload the new zips.
  For the www folder, do NOT overwrite config.local.php or the uploads folder: before extracting, delete
  config.local.php and uploads/ from the NEW zip (or extract it elsewhere and copy the rest over).

Problems?
  - "Database error": the details in public_html/config.local.php are wrong, or the user was not added to the
    database with ALL PRIVILEGES.
  - Shop shows no products / admin cannot sign in: HTTPS must work on all addresses, and config.local.php must have
    cookie_domain ".{{ROOT_DOMAIN}}" and allowed_origins with the shop and admin addresses.
  - Uploading a photo fails: ask the host to allow uploads of at least 6 MB (.user.ini asks for it).
  - A white page or "404" on a link like /about: the .htaccess file is missing (it starts with a dot).
