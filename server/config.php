<?php
$defaults = [
    'db_host' => '127.0.0.1',
    'db_name' => 'decode',
    'db_user' => 'root',
    'db_pass' => '',
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],
    // Public address of the website, used for links in the sitemap.
    'site_url' => 'https://www.example.com',
    // Only needed if the login must be shared with other subdomains, e.g. '.example.com'.
    // The site runs on one address, so leave it empty.
    'cookie_domain' => '',
    'max_upload_bytes' => 5 * 1024 * 1024,
];

$local = __DIR__ . '/config.local.php';
$overrides = is_file($local) ? require $local : [];
$config = array_merge($defaults, $overrides);

foreach (['db_host' => 'SITE_DB_HOST', 'db_name' => 'SITE_DB_NAME', 'db_user' => 'SITE_DB_USER', 'db_pass' => 'SITE_DB_PASS'] as $key => $env) {
    $value = getenv($env);
    if ($value !== false && $value !== '') $config[$key] = $value;
}

return $config;
