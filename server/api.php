<?php
declare(strict_types=1);

// A crash before the handlers below would otherwise be an empty "HTTP 500" with no clue. Answer with JSON
// that says what to look at (the details go to the host's error_log, not to visitors).
register_shutdown_function(function () {
    $e = error_get_last();
    if (!$e || !in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true) || headers_sent()) return;
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Server error (PHP ' . PHP_VERSION . '). The details are in the error_log file next to api.php.']);
});
if (PHP_VERSION_ID < 70400 || !extension_loaded('pdo_mysql') || !extension_loaded('mbstring')) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'This server runs PHP ' . PHP_VERSION . (extension_loaded('pdo_mysql') ? '' : ' without pdo_mysql') . (extension_loaded('mbstring') ? '' : ' without mbstring')
        . '. Choose PHP 8.1 or newer (with pdo_mysql and mbstring) in cPanel > MultiPHP Manager / Select PHP Version.']);
    exit;
}

require __DIR__ . '/db.php';

$config = require __DIR__ . '/config.php';

// ---------- helpers ----------
function respond($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(string $message, int $status = 400): void { respond(['error' => $message], $status); }
function body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) fail('Invalid JSON body');
    return $data;
}
function str($v, int $max = 255): string {
    return mb_substr(trim((string)($v ?? '')), 0, $max);
}
function flag($v, int $default = 1): int {
    if ($v === null || $v === '') return $default;
    if (is_string($v)) return in_array(strtolower(trim($v)), ['0', 'false', 'no', 'n', 'off', 'hidden'], true) ? 0 : 1;
    return $v ? 1 : 0;
}
function product_out(array $r): array {
    $alt = $r['alternate_images'] ? json_decode($r['alternate_images'], true) : [];
    return [
        'id' => $r['id'],
        'name' => $r['name'],
        'brand' => $r['brand'],
        'category' => $r['category'],
        'categoryName' => $r['category_name'],
        'specs' => $r['specs'] ?? '',
        'image' => $r['image'],
        'alternateImages' => is_array($alt) ? $alt : [],
        'price' => $r['price'] === null ? null : (float)$r['price'],
        'oldPrice' => ($r['old_price'] ?? null) === null ? null : (float)$r['old_price'],
        'freeGift' => $r['free_gift'] ?? '',
        'condition' => $r['item_condition'] ?? '',
        'hotFeature' => $r['hot_feature'] ?? '',
        'inShop' => (bool)$r['in_shop'],
        'inCatalog' => (bool)$r['in_catalog'],
        'active' => (bool)$r['active'],
        'hot' => (bool)$r['hot'],
        'updatedAt' => $r['updated_at'] ?? null,
    ];
}
// URL-friendly name, kept identical to slugify() in src/productSlug.js.
function slugify(string $name): string {
    $s = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $name), '-'));
    return trim(substr($s, 0, 60), '-');
}
function money($v): ?float {
    if ($v === '' || $v === null) return null;
    $v = (float)preg_replace('/[^0-9.]/', '', (string)$v);
    return $v < 0 || $v > 99999999 ? null : $v;
}
function product_params(array $d, string $id): array {
    $alt = $d['alternateImages'] ?? [];
    if (is_string($alt)) $alt = array_values(array_filter(array_map('trim', preg_split('/[|,;\n]/', $alt))));
    if (!is_array($alt)) $alt = [];
    $price = money($d['price'] ?? null);
    // The "was" price is only kept when it is above the current price; otherwise there is nothing to strike through.
    $oldPrice = money($d['oldPrice'] ?? null);
    if ($oldPrice !== null && ($price === null || $oldPrice <= $price)) $oldPrice = null;
    $category = str($d['category'] ?? '', 120);
    return [
        ':id' => $id,
        ':name' => str($d['name'] ?? '', 255),
        ':brand' => str($d['brand'] ?? '', 120) ?: 'Generic',
        ':category' => $category,
        ':category_name' => str($d['categoryName'] ?? '', 160) ?: $category,
        ':specs' => str($d['specs'] ?? '', 2000),
        ':image' => str($d['image'] ?? '', 500),
        ':alt' => json_encode(array_map(fn($a) => str($a, 500), array_slice($alt, 0, 10))),
        ':price' => $price,
        ':old_price' => $oldPrice,
        ':free_gift' => str($d['freeGift'] ?? '', 120),
        ':item_condition' => str($d['condition'] ?? '', 40),
        ':hot_feature' => str($d['hotFeature'] ?? '', 120),
        ':in_shop' => flag($d['inShop'] ?? null),
        ':in_catalog' => flag($d['inCatalog'] ?? null),
        ':active' => flag($d['active'] ?? null),
        ':hot' => flag($d['hot'] ?? null, 0),
    ];
}
const PRODUCT_UPSERT = "INSERT INTO products (id,name,brand,category,category_name,specs,image,alternate_images,price,old_price,free_gift,item_condition,hot_feature,in_shop,in_catalog,active,hot)
    VALUES (:id,:name,:brand,:category,:category_name,:specs,:image,:alt,:price,:old_price,:free_gift,:item_condition,:hot_feature,:in_shop,:in_catalog,:active,:hot)
    ON DUPLICATE KEY UPDATE name=VALUES(name),brand=VALUES(brand),category=VALUES(category),category_name=VALUES(category_name),
    specs=VALUES(specs),image=VALUES(image),alternate_images=VALUES(alternate_images),price=VALUES(price),old_price=VALUES(old_price),free_gift=VALUES(free_gift),item_condition=VALUES(item_condition),hot_feature=VALUES(hot_feature),
    in_shop=VALUES(in_shop),in_catalog=VALUES(in_catalog),active=VALUES(active),hot=VALUES(hot)";

// ---------- site settings & news ----------
const SOCIAL_PLATFORMS = ['facebook', 'x', 'linkedin', 'tiktok', 'instagram', 'youtube', 'whatsapp', 'link'];
function default_settings(): array {
    return [
        'contact' => [
            'email' => 'info@decodetech.co.ke',
            'email2' => 'decod3.it@gmail.com',
            'address' => "Ridge House, 1st Floor, Stall 4\nMunyu Road off Accra Road, Nairobi",
            'whatsapp' => '254711294124',
            'mobilePhone' => '',
            'officePhone' => '+254 711 294124',
        ],
        'hours' => [
            ['days' => 'Monday - Saturday', 'time' => '8:00 AM - 6:00 PM'],
            ['days' => 'Sunday', 'time' => 'Closed'],
        ],
        'announcement' => ['enabled' => false, 'text' => '', 'link' => ''],
        'social' => [
            ['id' => 'facebook', 'label' => 'Facebook', 'url' => 'https://www.facebook.com/decodeitsolutions.ke'],
            ['id' => 'x', 'label' => 'X', 'url' => 'https://twitter.com/decode_it_kenya'],
            ['id' => 'instagram', 'label' => 'Instagram', 'url' => 'https://www.instagram.com/decode_technologies/'],
            ['id' => 'linkedin', 'label' => 'LinkedIn', 'url' => 'https://www.linkedin.com/company/decode-technologies-ke'],
        ],
    ];
}
// Stored values replace the defaults section by section, so a missing section always has a sensible value.
function site_settings(): array {
    $out = default_settings();
    $row = db()->query("SELECT v FROM site_settings WHERE k='site'")->fetchColumn();
    $saved = $row ? json_decode((string)$row, true) : null;
    if (is_array($saved)) {
        foreach (['contact', 'announcement'] as $k) if (isset($saved[$k]) && is_array($saved[$k])) $out[$k] = array_merge($out[$k], $saved[$k]);
        foreach (['hours', 'social'] as $k) if (isset($saved[$k]) && is_array($saved[$k])) $out[$k] = $saved[$k];
    }
    return $out;
}
function settings_clean(array $d): array {
    $c = is_array($d['contact'] ?? null) ? $d['contact'] : [];
    $email = str($c['email'] ?? '', 160);
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Enter a valid email address');
    $email2 = str($c['email2'] ?? '', 160);
    if ($email2 !== '' && !filter_var($email2, FILTER_VALIDATE_EMAIL)) fail('The second email address is not valid');
    // WhatsApp is stored as digits with the country code (a leading 0 means Kenya).
    $wa = preg_replace('/\D+/', '', (string)($c['whatsapp'] ?? ''));
    if (strlen($wa) === 10 && $wa[0] === '0') $wa = '254' . substr($wa, 1);
    if (strlen($wa) < 9 || strlen($wa) > 15) fail('Enter the WhatsApp number with its country code, e.g. 254711294124');
    $phone = function ($v, string $label) {
        $v = str($v, 30);
        if ($v !== '' && !preg_match('/^\+?[0-9 ()-]{6,25}$/', $v)) fail("$label can only contain digits, spaces, + ( ) and -");
        return $v;
    };
    $hours = [];
    foreach (array_slice(is_array($d['hours'] ?? null) ? $d['hours'] : [], 0, 8) as $h) {
        $days = str($h['days'] ?? '', 60);
        if ($days !== '') $hours[] = ['days' => $days, 'time' => str($h['time'] ?? '', 60)];
    }
    $a = is_array($d['announcement'] ?? null) ? $d['announcement'] : [];
    $link = str($a['link'] ?? '', 300);
    if ($link !== '' && !preg_match('#^(/|https?://)#i', $link)) fail('The announcement link must start with / or https://');
    $social = [];
    foreach (array_slice(is_array($d['social'] ?? null) ? $d['social'] : [], 0, 12) as $s) {
        $url = str($s['url'] ?? '', 500);
        if ($url === '') continue;
        if (!preg_match('#^https?://#i', $url)) fail('Social links must start with https://');
        $id = in_array($s['id'] ?? '', SOCIAL_PLATFORMS, true) ? $s['id'] : 'link';
        $social[] = ['id' => $id, 'label' => str($s['label'] ?? '', 40) ?: ucfirst($id), 'url' => $url];
    }
    return [
        'contact' => [
            'email' => $email, 'email2' => $email2, 'address' => str($c['address'] ?? '', 300), 'whatsapp' => $wa,
            'mobilePhone' => $phone($c['mobilePhone'] ?? '', 'The mobile number'), 'officePhone' => $phone($c['officePhone'] ?? '', 'The office number'),
        ],
        'hours' => $hours,
        'announcement' => ['enabled' => flag($a['enabled'] ?? null, 0) === 1, 'text' => str($a['text'] ?? '', 200), 'link' => $link],
        'social' => $social,
    ];
}
function post_out(array $r): array {
    return [
        'id' => (int)$r['id'],
        'title' => $r['title'],
        'summary' => $r['summary'],
        'body' => $r['body'] ?? '',
        'image' => $r['image'],
        'published' => (bool)$r['published'],
        'publishedAt' => $r['published_at'],
        'updatedAt' => $r['updated_at'] ?? null,
    ];
}
function post_params(array $d): array {
    $title = str($d['title'] ?? '', 200);
    if ($title === '') fail('A title is required');
    return [$title, str($d['summary'] ?? '', 400), str($d['body'] ?? '', 60000), str($d['image'] ?? '', 500), flag($d['published'] ?? null, 0)];
}

// ---------- accounts & offers ----------
function current_user(): ?array {
    static $user = false;
    if ($user !== false) return $user;
    $user = null;
    if (!empty($_SESSION['uid'])) {
        $stmt = db()->prepare("SELECT * FROM users WHERE id=?");
        $stmt->execute([(int)$_SESSION['uid']]);
        $user = $stmt->fetch() ?: null;
    }
    return $user;
}
function user_out(array $u): array {
    return [
        'id' => (int)$u['id'],
        'username' => $u['username'],
        'name' => $u['name'],
        'phone' => $u['phone'],
        'role' => $u['role'],
        'mustChange' => (bool)$u['must_change'],
    ];
}
function offer_out(array $o): array {
    return [
        'id' => (int)$o['id'],
        'type' => $o['type'],
        'title' => $o['title'],
        'description' => $o['description'] ?? '',
        'code' => $o['code'] ?? '',
        'percentOff' => $o['percent_off'] === null ? null : (float)$o['percent_off'],
        'amountOff' => $o['amount_off'] === null ? null : (float)$o['amount_off'],
        'minPrice' => $o['min_price'] === null ? null : (float)$o['min_price'],
        'category' => $o['category'],
        'startsOn' => $o['starts_on'],
        'endsOn' => $o['ends_on'],
        'active' => (bool)$o['active'],
    ];
}
// Is the offer live today and valid for this product (null product = just check dates/active)?
function offer_applies(array $o, ?array $product): bool {
    if (!(int)$o['active']) return false;
    $today = date('Y-m-d');
    if ($o['starts_on'] && $today < $o['starts_on']) return false;
    if ($o['ends_on'] && $today > $o['ends_on']) return false;
    if ($product) {
        if ($o['category'] !== '' && strcasecmp($o['category'], (string)$product['category']) !== 0) return false;
        if ($o['min_price'] !== null && ($product['price'] === null || (float)$product['price'] < (float)$o['min_price'])) return false;
    }
    return true;
}
function offer_price(array $o, float $price): float {
    $off = 0.0;
    if ($o['percent_off'] !== null) $off = $price * (float)$o['percent_off'] / 100;
    if ($o['amount_off'] !== null) $off = max($off, (float)$o['amount_off']);
    return max(0.0, round($price - $off, 2));
}
function offer_params(array $d): array {
    $type = (string)($d['type'] ?? '');
    if (!in_array($type, ['discount', 'coupon', 'delivery'], true)) fail('Invalid offer type');
    $title = str($d['title'] ?? '', 160);
    if ($title === '') fail('Title is required');
    $num = function ($v, float $max) {
        if ($v === null || $v === '') return null;
        $n = (float)$v;
        return ($n < 0 || $n > $max) ? null : $n;
    };
    $percent = $num($d['percentOff'] ?? null, 100);
    $amount = $num($d['amountOff'] ?? null, 99999999);
    $code = strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', str($d['code'] ?? '', 40)));
    if ($type === 'coupon' && $code === '') fail('Coupons need a code');
    if ($type !== 'delivery' && $percent === null && $amount === null) fail('Set a percentage or an amount off');
    $date = fn($v) => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$v) ? (string)$v : null;
    return [
        $type, $title, str($d['description'] ?? '', 2000), $type === 'coupon' ? $code : null,
        $type === 'delivery' ? null : $percent, $type === 'delivery' ? null : $amount,
        $num($d['minPrice'] ?? null, 99999999), str($d['category'] ?? '', 120),
        $date($d['startsOn'] ?? null), $date($d['endsOn'] ?? null), flag($d['active'] ?? null),
    ];
}
function valid_password(string $p): void {
    if (strlen($p) < 8) fail('Password must be at least 8 characters');
    if (strlen($p) > 200) fail('Password is too long');
}
function login_user(array $u): void {
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id'];
}

// ---------- rate limits ----------
// Hash of the visitor's address (REMOTE_ADDR: forwarded headers are not trusted, anyone can fake them).
function client_ip_hash(): string {
    return hash('sha256', 'decode|' . ($_SERVER['REMOTE_ADDR'] ?? ''));
}
// How many times this action was recorded in the last $minutes, from this address or for this subject.
function attempts_since(string $action, int $minutes, ?string $subject = null): int {
    $sql = $subject === null
        ? "SELECT COUNT(*) FROM attempts WHERE action=? AND ip_hash=? AND created_at >= NOW() - INTERVAL ? MINUTE"
        : "SELECT COUNT(*) FROM attempts WHERE action=? AND subject=? AND created_at >= NOW() - INTERVAL ? MINUTE";
    $stmt = db()->prepare($sql);
    $stmt->execute([$action, $subject === null ? client_ip_hash() : $subject, $minutes]);
    return (int)$stmt->fetchColumn();
}
function record_attempt(string $action, ?string $subject = null): void {
    db()->prepare("INSERT INTO attempts (action, ip_hash, subject) VALUES (?,?,?)")
        ->execute([$action, client_ip_hash(), $subject === null ? null : mb_substr(strtolower($subject), 0, 64)]);
    if (random_int(1, 100) === 1) db()->exec("DELETE FROM attempts WHERE created_at < NOW() - INTERVAL 1 DAY");
}
// Refuses the request once this address has done $action $limit times in $minutes; otherwise counts it.
function limit_rate(string $action, int $limit, int $minutes, string $message): void {
    if (attempts_since($action, $minutes) >= $limit) fail($message, 429);
    record_attempt($action);
}
// Sign-in lockout: 5 wrong passwords for one username, or 10 from one address, in 15 minutes.
const LOGIN_WINDOW_MINUTES = 15;
function login_locked(string $username): bool {
    return attempts_since('login_fail', LOGIN_WINDOW_MINUTES, strtolower($username)) >= 5
        || attempts_since('login_fail', LOGIN_WINDOW_MINUTES) >= 10;
}
function login_failed(string $username): void {
    record_attempt('login_fail', $username);
    usleep(700000);
    fail(login_locked($username)
        ? 'Too many wrong passwords. For your security, sign-in is paused for 15 minutes.'
        : 'Incorrect username or password', 401);
}

// ---------- CORS / session ----------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $config['allowed_origins'], true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Vary: Origin');
}
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') { http_response_code(204); exit; }
header_remove('X-Powered-By'); // don't advertise the PHP version
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
header('Referrer-Policy: strict-origin-when-cross-origin');
// Account and admin answers carry personal data: never keep them in a browser or proxy cache.
if (preg_match('#/api/(auth|admin|offers)(/|$)#', (string)parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH))) {
    header('Cache-Control: no-store');
}

session_name('decode_admin');
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
$host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
$cookieDomain = ltrim((string)$config['cookie_domain'], '.');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'httponly' => true,
    'secure' => $https,
    'samesite' => 'Lax',
    // Only applied on the real site's addresses, so local testing keeps working.
    'domain' => ($cookieDomain !== '' && ($host === $cookieDomain || substr($host, -strlen('.' . $cookieDomain)) === '.' . $cookieDomain)) ? '.' . $cookieDomain : '',
]);
session_start();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = trim((string)preg_replace('#^.*?/api#', '', $uri), '/');
$parts = $route === '' ? [] : explode('/', $route);

try {
    // State-changing requests must be JSON (or carry a custom header), which a cross-site HTML form cannot send.
    $isUpload = $method === 'POST' && ($parts[0] ?? '') === 'admin' && ($parts[1] ?? '') === 'upload';
    $viaFetch = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch';
    if (in_array($method, ['POST', 'PUT', 'PATCH'], true) && !$isUpload) {
        if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) fail('Content-Type must be application/json', 415);
    }
    if (($isUpload || $method === 'DELETE') && !$viaFetch) fail('Bad request', 400);

    // ---------- public routes ----------
    if ($parts === ['products'] && $method === 'GET') {
        $rows = db()->query("SELECT * FROM products WHERE active=1 ORDER BY sort_order, created_at DESC, name")->fetchAll();
        respond(['products' => array_map('product_out', $rows)]);
    }

    // One product, for its own page.
    if (count($parts) === 2 && $parts[0] === 'products' && $parts[1] !== 'highlights' && $method === 'GET') {
        $stmt = db()->prepare("SELECT * FROM products WHERE id=? AND active=1");
        $stmt->execute([$parts[1]]);
        $row = $stmt->fetch();
        if (!$row) fail('Product not found', 404);
        respond(['product' => product_out($row)]);
    }

    // Owner-editable contact details, opening hours, announcement banner and social links.
    if ($parts === ['settings'] && $method === 'GET') respond(site_settings());

    // News / blog posts: only published ones, newest first.
    if ($parts === ['posts'] && $method === 'GET') {
        $rows = db()->query("SELECT * FROM posts WHERE published=1 AND published_at <= NOW() ORDER BY published_at DESC, id DESC LIMIT 200")->fetchAll();
        respond(['posts' => array_map('post_out', $rows)]);
    }
    if (count($parts) === 2 && $parts[0] === 'posts' && $method === 'GET') {
        $stmt = db()->prepare("SELECT * FROM posts WHERE id=? AND published=1 AND published_at <= NOW()");
        $stmt->execute([(int)$parts[1]]);
        $row = $stmt->fetch();
        if (!$row) fail('Post not found', 404);
        respond(['post' => post_out($row)]);
    }

    // Sitemap built live from the database: the Shop plus one entry per active product.
    if (($parts === ['sitemap'] || $parts === ['sitemap.xml']) && $method === 'GET') {
        $base = rtrim((string)$config['site_url'], '/');
        $esc = fn(string $v) => htmlspecialchars($v, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $entry = fn(string $path, ?string $mod, string $freq, string $prio) => "  <url>
    <loc>" . $esc($base . $path) . "</loc>
" . ($mod ? "    <lastmod>" . substr($mod, 0, 10) . "</lastmod>
" : '') . "    <changefreq>$freq</changefreq>
    <priority>$prio</priority>
  </url>
";
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
";
        $today = date('Y-m-d');
        $xml .= $entry('/', $today, 'daily', '1.0');
        foreach (db()->query("SELECT id, name, updated_at FROM products WHERE active=1 AND in_shop=1 ORDER BY name")->fetchAll() as $p) {
            $xml .= $entry('/product/' . rawurlencode($p['id']) . '/' . slugify($p['name']), $p['updated_at'], 'weekly', '0.8');
        }
        $xml .= "</urlset>
";
        http_response_code(200);
        header('Content-Type: application/xml; charset=utf-8');
        echo $xml;
        exit;
    }

    // Shop highlights: admin-picked hot products, best sellers (dispatched orders) and most clicked products.
    if ($parts === ['products', 'highlights'] && $method === 'GET') {
        $pdo = db();
        $ids = fn(string $sql) => array_column($pdo->query($sql)->fetchAll(), 'id');
        respond([
            'hot' => $ids("SELECT id FROM products WHERE active=1 AND in_shop=1 AND hot=1 ORDER BY updated_at DESC LIMIT 8"),
            'bestSellers' => $ids("SELECT p.id FROM orders o JOIN products p ON p.id=o.product_id WHERE o.status='dispatched' AND p.active=1 AND p.in_shop=1 GROUP BY p.id ORDER BY COUNT(*) DESC, MAX(o.updated_at) DESC LIMIT 8"),
            'mostClicked' => $ids("SELECT p.id FROM events e JOIN products p ON p.id=e.product_id WHERE p.active=1 AND p.in_shop=1 AND e.created_at >= NOW() - INTERVAL 30 DAY GROUP BY p.id ORDER BY COUNT(*) DESC, MAX(e.id) DESC LIMIT 8"),
        ]);
    }

    if ($parts === ['track'] && $method === 'POST') {
        // Click tracking is silent: over the limit, the click just isn't recorded.
        if (attempts_since('track', 60) >= 300) respond(['ok' => true]);
        record_attempt('track');
        $d = body();
        $type = str($d['type'] ?? 'whatsapp_click', 40);
        if (!in_array($type, ['whatsapp_click', 'product_click'], true)) fail('Unknown event');
        $pid = str($d['productId'] ?? '', 64) ?: null;
        db()->prepare("INSERT INTO events (type,product_id,label,page,message) VALUES (?,?,?,?,?)")
            ->execute([$type, $pid, str($d['label'] ?? ''), str($d['page'] ?? ''), str($d['message'] ?? '', 4000)]);
        respond(['ok' => true]);
    }

    if ($parts === ['messages'] && $method === 'POST') {
        limit_rate('message', 10, 60, 'You have sent a lot of messages. Please try again later or reach us on WhatsApp.');
        $d = body();
        $name = str($d['name'] ?? '', 160);
        $phone = str($d['phone'] ?? '', 60);
        if ($name === '' || $phone === '') fail('Name and phone are required');
        db()->prepare("INSERT INTO messages (name,phone,product,budget,message) VALUES (?,?,?,?,?)")
            ->execute([$name, $phone, str($d['product'] ?? ''), str($d['budget'] ?? '', 120), str($d['message'] ?? '', 4000)]);
        respond(['ok' => true], 201);
    }

    // A WhatsApp checkout: the visitor pressed "Order via WhatsApp". Admin later records whether it dispatched.
    // Signed-in members may attach offers; the server re-checks them and records the price they get.
    if ($parts === ['orders'] && $method === 'POST') {
        // A cart sends one request per product line, so this allows several full carts an hour.
        limit_rate('order', 100, 60, 'Too many orders from this connection. Please try again later or reach us on WhatsApp.');
        $d = body();
        $name = str($d['productName'] ?? '');
        if ($name === '') fail('productName is required');
        $pdo = db();
        $pid = str($d['productId'] ?? '', 64) ?: null;
        $user = current_user();
        $applied = null;
        $final = null;
        $ids = array_values(array_unique(array_filter(array_map('intval', is_array($d['offerIds'] ?? null) ? $d['offerIds'] : []))));
        if ($user && $ids && $pid) {
            $ps = $pdo->prepare("SELECT * FROM products WHERE id=?");
            $ps->execute([$pid]);
            $product = $ps->fetch();
            if ($product) {
                $lines = [];
                $best = null;
                $delivery = false;
                $os = $pdo->prepare("SELECT * FROM offers WHERE id=?");
                foreach (array_slice($ids, 0, 5) as $oid) {
                    $os->execute([$oid]);
                    $o = $os->fetch();
                    if (!$o || !offer_applies($o, $product)) continue;
                    if ($o['type'] === 'delivery') {
                        if (!$delivery) { $lines[] = 'Delivery: ' . $o['title']; $delivery = true; }
                    } elseif ($product['price'] !== null) {
                        $p = offer_price($o, (float)$product['price']);
                        if ($best === null || $p < $best['price']) $best = ['price' => $p, 'offer' => $o];
                    } elseif ($best === null) {
                        $best = ['price' => null, 'offer' => $o];
                    }
                }
                if ($best) {
                    $lines[] = ($best['offer']['type'] === 'coupon' ? 'Coupon ' . $best['offer']['code'] . ': ' : 'Discount: ') . $best['offer']['title'];
                    $final = $best['price'];
                }
                $applied = $lines ? implode("\n", $lines) : null;
            }
        }
        $quantity = max(1, min(9999, (int)($d['quantity'] ?? 1)));
        $address = str($d['deliveryAddress'] ?? '', 500);
        // Lines sent together from one cart share a short reference.
        $cartRef = strtoupper(str($d['cartRef'] ?? '', 20));
        $cartRef = preg_match('/^[A-Z0-9]{4,20}$/', $cartRef) ? $cartRef : null;
        $pdo->prepare("INSERT INTO orders (product_id,product_name,message,user_id,customer_name,customer_phone,offers_applied,final_price,quantity,delivery_address,cart_ref) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([$pid, $name, str($d['message'] ?? '', 4000), $user['id'] ?? null, $user['name'] ?? '', $user['phone'] ?? '', $applied, $final, $quantity, $address, $cartRef]);
        respond(['ok' => true], 201);
    }

    // ---------- accounts ----------
    if (($parts[0] ?? '') === 'auth') {
        $sub = $parts[1] ?? '';
        if ($sub === 'me' && $method === 'GET') {
            $u = current_user();
            respond(['user' => $u ? user_out($u) : null]);
        }
        if ($sub === 'signup' && $method === 'POST') {
            limit_rate('signup', 5, 60, 'Too many new accounts from this connection. Please try again in an hour.');
            $d = body();
            $username = str($d['username'] ?? '', 40);
            $name = str($d['name'] ?? '', 160);
            $phone = str($d['phone'] ?? '', 60);
            $password = (string)($d['password'] ?? '');
            if (!preg_match('/^[A-Za-z0-9_.-]{3,32}$/', $username)) fail('Username must be 3-32 letters, numbers, dots, dashes or underscores');
            if ($name === '') fail('Please enter your name');
            if (!preg_match('/^\+?[0-9 ()-]{7,20}$/', $phone)) fail('Please enter a valid phone number');
            valid_password($password);
            $pdo = db();
            $exists = $pdo->prepare("SELECT 1 FROM users WHERE username=?");
            $exists->execute([$username]);
            if ($exists->fetchColumn()) fail('That username is taken', 409);
            $pdo->prepare("INSERT INTO users (username,name,phone,password_hash,role) VALUES (?,?,?,?,'customer')")
                ->execute([$username, $name, $phone, password_hash($password, PASSWORD_DEFAULT)]);
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id=?");
            $stmt->execute([(int)$pdo->lastInsertId()]);
            $u = $stmt->fetch();
            login_user($u);
            respond(['user' => user_out($u)], 201);
        }
        if ($sub === 'login' && $method === 'POST') {
            $d = body();
            $username = str($d['username'] ?? '', 40);
            if (login_locked($username)) fail('Too many wrong passwords. For your security, sign-in is paused for 15 minutes.', 429);
            $stmt = db()->prepare("SELECT * FROM users WHERE username=?");
            $stmt->execute([$username]);
            $u = $stmt->fetch();
            // Compare against a dummy hash when the user does not exist so timing does not reveal valid usernames.
            $hash = $u['password_hash'] ?? password_hash('no-such-user', PASSWORD_DEFAULT);
            if (!password_verify((string)($d['password'] ?? ''), $hash) || !$u) login_failed($username);
            db()->prepare("DELETE FROM attempts WHERE action='login_fail' AND subject=?")->execute([strtolower($username)]);
            login_user($u);
            respond(['user' => user_out($u)]);
        }
        if ($sub === 'logout' && $method === 'POST') {
            $_SESSION = [];
            session_destroy();
            respond(['ok' => true]);
        }
        fail('Not found', 404);
    }

    // Offers are a members-only perk: discounts, coupon codes and delivery deals.
    if ($parts === ['offers'] && $method === 'GET') {
        if (!current_user()) fail('Sign in to see member offers', 401);
        $rows = db()->query("SELECT * FROM offers ORDER BY type, id DESC")->fetchAll();
        respond(['offers' => array_map('offer_out', array_values(array_filter($rows, fn($o) => offer_applies($o, null))))]);
    }

    // ---------- admin ----------
    if (($parts[0] ?? '') === 'admin') {
        $sub = $parts[1] ?? '';
        $admin = current_user();
        if (!$admin || $admin['role'] !== 'admin') fail('Not authorised', 401);

        if ($sub === 'credentials' && $method === 'POST') {
            $d = body();
            // Wrong current passwords count towards the same lockout as sign-in.
            if (login_locked($admin['username'])) fail('Too many wrong passwords. For your security, this is paused for 15 minutes.', 429);
            if (!password_verify((string)($d['currentPassword'] ?? ''), $admin['password_hash'])) {
                record_attempt('login_fail', $admin['username']);
                usleep(700000);
                fail('Current password is incorrect', 403);
            }
            $username = str($d['username'] ?? '', 40);
            $new = (string)($d['newPassword'] ?? '');
            if (!preg_match('/^[A-Za-z0-9_.-]{3,32}$/', $username)) fail('Username must be 3-32 letters, numbers, dots, dashes or underscores');
            valid_password($new);
            if (strcasecmp($new, 'Admin123') === 0) fail('Choose a password different from the default');
            $pdo = db();
            $dup = $pdo->prepare("SELECT 1 FROM users WHERE username=? AND id<>?");
            $dup->execute([$username, $admin['id']]);
            if ($dup->fetchColumn()) fail('That username is taken', 409);
            $pdo->prepare("UPDATE users SET username=?, password_hash=?, must_change=0 WHERE id=?")
                ->execute([$username, password_hash($new, PASSWORD_DEFAULT), $admin['id']]);
            session_regenerate_id(true);
            respond(['ok' => true, 'username' => $username]);
        }
        if ($sub === 'me') respond(['ok' => true, 'user' => user_out($admin)]);
        if ($admin['must_change']) fail('Change the default admin username and password first', 403);

        $pdo = db();

        // ----- products -----
        if ($sub === 'products') {
            $id = $parts[2] ?? null;
            if ($id === null && $method === 'GET') {
                $rows = $pdo->query("SELECT * FROM products ORDER BY sort_order, created_at DESC, name")->fetchAll();
                respond(['products' => array_map('product_out', $rows)]);
            }
            if ($id === 'import' && $method === 'POST') {
                $d = body();
                $rows = $d['rows'] ?? null;
                if (!is_array($rows) || count($rows) === 0) fail('No rows to import');
                if (count($rows) > 5000) fail('Too many rows (max 5000 per import)');
                $added = 0;
                $updated = 0;
                $skipped = [];
                $stmt = $pdo->prepare(PRODUCT_UPSERT);
                $exists = $pdo->prepare("SELECT * FROM products WHERE id=?");
                $pdo->beginTransaction();
                foreach ($rows as $i => $row) {
                    if (!is_array($row)) {
                        $skipped[] = ['row' => $i + 1, 'reason' => 'Invalid row'];
                        continue;
                    }
                    $pid = str($row['id'] ?? '', 64) ?: 'prod-' . bin2hex(random_bytes(5));
                    $exists->execute([$pid]);
                    $current = $exists->fetch();
                    if ($current) {
                        // Only the columns present in the file change; everything else keeps its value.
                        $row = array_merge(product_out($current), $row);
                        $updated++;
                    } else {
                        $added++;
                    }
                    if (str($row['name'] ?? '') === '') {
                        $current ? $updated-- : $added--;
                        $skipped[] = ['row' => $i + 1, 'reason' => 'Missing name'];
                        continue;
                    }
                    $stmt->execute(product_params($row, $pid));
                }
                $pdo->commit();
                respond(['added' => $added, 'updated' => $updated, 'skipped' => $skipped]);
            }
            if ($id === null && $method === 'POST') {
                $d = body();
                if (str($d['name'] ?? '') === '') fail('Name is required');
                $pid = 'prod-' . bin2hex(random_bytes(5));
                $pdo->prepare(PRODUCT_UPSERT)->execute(product_params($d, $pid));
                respond(['id' => $pid], 201);
            }
            if ($id !== null && $method === 'PUT') {
                $d = body();
                if (str($d['name'] ?? '') === '') fail('Name is required');
                $chk = $pdo->prepare("SELECT 1 FROM products WHERE id=?");
                $chk->execute([$id]);
                if (!$chk->fetchColumn()) fail('Product not found', 404);
                $pdo->prepare(PRODUCT_UPSERT)->execute(product_params($d, $id));
                respond(['ok' => true]);
            }
            if ($id !== null && $method === 'DELETE') {
                $pdo->prepare("DELETE FROM products WHERE id=?")->execute([$id]);
                respond(['ok' => true]);
            }
        }

        // ----- image upload -----
        if ($sub === 'upload' && $method === 'POST') {
            $f = $_FILES['image'] ?? null;
            if (!$f || $f['error'] !== UPLOAD_ERR_OK) fail('No file uploaded');
            if ($f['size'] > $config['max_upload_bytes']) fail('Image is larger than 5 MB');
            $info = @getimagesize($f['tmp_name']);
            $map = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
            if (!$info || !isset($map[$info[2]])) fail('Only JPG, PNG, WebP or GIF images are allowed');
            $name = date('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . $map[$info[2]];
            if (!is_dir(__DIR__ . '/uploads')) mkdir(__DIR__ . '/uploads', 0755, true);
            if (!move_uploaded_file($f['tmp_name'], __DIR__ . '/uploads/' . $name)) fail('Could not save image', 500);
            respond(['url' => '/uploads/' . $name], 201);
        }

        // ----- messages -----
        if ($sub === 'messages') {
            $id = $parts[2] ?? null;
            if ($id === null && $method === 'GET') {
                respond(['messages' => $pdo->query("SELECT * FROM messages ORDER BY id DESC LIMIT 1000")->fetchAll()]);
            }
            if ($id !== null && $method === 'PATCH') {
                $d = body();
                $pdo->prepare("UPDATE messages SET handled=? WHERE id=?")->execute([flag($d['handled'] ?? 1), (int)$id]);
                respond(['ok' => true]);
            }
            if ($id !== null && $method === 'DELETE') {
                $pdo->prepare("DELETE FROM messages WHERE id=?")->execute([(int)$id]);
                respond(['ok' => true]);
            }
        }

        // ----- clicks -----
        if ($sub === 'clicks' && $method === 'GET') {
            $recent = $pdo->query("SELECT e.*, p.name AS product_name FROM events e LEFT JOIN products p ON p.id=e.product_id ORDER BY e.id DESC LIMIT 500")->fetchAll();
            $top = $pdo->query("SELECT e.product_id, COALESCE(MAX(p.name), MAX(e.label)) AS name, COUNT(*) AS clicks, MAX(e.created_at) AS last_click
                FROM events e LEFT JOIN products p ON p.id=e.product_id
                WHERE e.product_id IS NOT NULL GROUP BY e.product_id ORDER BY clicks DESC LIMIT 50")->fetchAll();
            $totals = $pdo->query("SELECT COUNT(*) AS total, COALESCE(SUM(created_at >= NOW() - INTERVAL 7 DAY), 0) AS last7 FROM events")->fetch();
            respond(['recent' => $recent, 'top' => $top, 'totals' => $totals]);
        }

        // ----- orders -----
        if ($sub === 'orders') {
            $id = $parts[2] ?? null;
            if ($id === null && $method === 'GET') {
                respond(['orders' => $pdo->query("SELECT * FROM orders ORDER BY id DESC LIMIT 1000")->fetchAll()]);
            }
            if ($id !== null && $method === 'PATCH') {
                $d = body();
                $status = (string)($d['status'] ?? '');
                if (!in_array($status, ['pending', 'dispatched', 'not_dispatched', 'cancelled'], true)) fail('Invalid status');
                $pdo->prepare("UPDATE orders SET status=?, note=?, customer_name=?, customer_phone=? WHERE id=?")
                    ->execute([$status, str($d['note'] ?? '', 2000), str($d['customerName'] ?? '', 160), str($d['customerPhone'] ?? '', 60), (int)$id]);
                respond(['ok' => true]);
            }
            if ($id !== null && $method === 'DELETE') {
                $pdo->prepare("DELETE FROM orders WHERE id=?")->execute([(int)$id]);
                respond(['ok' => true]);
            }
        }

        // ----- offers -----
        if ($sub === 'offers') {
            $id = $parts[2] ?? null;
            if ($id === null && $method === 'GET') {
                $rows = $pdo->query("SELECT * FROM offers ORDER BY active DESC, type, id DESC")->fetchAll();
                respond(['offers' => array_map('offer_out', $rows)]);
            }
            if ($id === null && $method === 'POST') {
                $pdo->prepare("INSERT INTO offers (type,title,description,code,percent_off,amount_off,min_price,category,starts_on,ends_on,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
                    ->execute(offer_params(body()));
                respond(['id' => (int)$pdo->lastInsertId()], 201);
            }
            if ($id !== null && $method === 'PUT') {
                $pdo->prepare("UPDATE offers SET type=?,title=?,description=?,code=?,percent_off=?,amount_off=?,min_price=?,category=?,starts_on=?,ends_on=?,active=? WHERE id=?")
                    ->execute([...offer_params(body()), (int)$id]);
                respond(['ok' => true]);
            }
            if ($id !== null && $method === 'DELETE') {
                $pdo->prepare("DELETE FROM offers WHERE id=?")->execute([(int)$id]);
                respond(['ok' => true]);
            }
        }

        // ----- website details -----
        if ($sub === 'settings') {
            if ($method === 'GET') respond(site_settings());
            if ($method === 'PUT') {
                $clean = settings_clean(body());
                $pdo->prepare("INSERT INTO site_settings (k,v) VALUES ('site',?) ON DUPLICATE KEY UPDATE v=VALUES(v)")
                    ->execute([json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
                respond(site_settings());
            }
        }

        // ----- news / blog -----
        if ($sub === 'posts') {
            $id = $parts[2] ?? null;
            if ($id === null && $method === 'GET') {
                $rows = $pdo->query("SELECT * FROM posts ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT 500")->fetchAll();
                respond(['posts' => array_map('post_out', $rows)]);
            }
            if ($id === null && $method === 'POST') {
                $p = post_params(body());
                $pdo->prepare("INSERT INTO posts (title,summary,body,image,published,published_at) VALUES (?,?,?,?,?,?)")
                    ->execute([...$p, $p[4] ? date('Y-m-d H:i:s') : null]);
                respond(['id' => (int)$pdo->lastInsertId()], 201);
            }
            if ($id !== null && $method === 'PUT') {
                $p = post_params(body());
                // The publish date is set the first time a post goes live and kept after that.
                $pdo->prepare("UPDATE posts SET title=?,summary=?,body=?,image=?,published=?, published_at=IF(?=1, COALESCE(published_at, NOW()), published_at) WHERE id=?")
                    ->execute([...$p, $p[4], (int)$id]);
                respond(['ok' => true]);
            }
            if ($id !== null && $method === 'DELETE') {
                $pdo->prepare("DELETE FROM posts WHERE id=?")->execute([(int)$id]);
                respond(['ok' => true]);
            }
        }

        // ----- customers -----
        if ($sub === 'customers' && $method === 'GET') {
            $rows = $pdo->query("SELECT u.id, u.username, u.name, u.phone, u.created_at, COUNT(o.id) AS orders
                FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE u.role='customer' GROUP BY u.id ORDER BY u.id DESC LIMIT 1000")->fetchAll();
            respond(['customers' => $rows]);
        }

        // ----- dashboard summary -----
        if ($sub === 'stats' && $method === 'GET') {
            $one = fn(string $sql) => (int)$pdo->query($sql)->fetchColumn();
            respond([
                'products' => $one("SELECT COUNT(*) FROM products"),
                'customers' => $one("SELECT COUNT(*) FROM users WHERE role='customer'"),
                'unreadMessages' => $one("SELECT COUNT(*) FROM messages WHERE handled=0"),
                'clicks7' => $one("SELECT COUNT(*) FROM events WHERE created_at >= NOW() - INTERVAL 7 DAY"),
                'pendingOrders' => $one("SELECT COUNT(*) FROM orders WHERE status='pending'"),
                'dispatchedOrders' => $one("SELECT COUNT(*) FROM orders WHERE status='dispatched'"),
            ]);
        }
    }

    fail('Not found', 404);
} catch (Throwable $e) {
    error_log('[decode-api] ' . $e->getMessage());
    $msg = 'Server error';
    if ($e instanceof PDOException) {
        // Say which kind of database problem it is (MySQL error numbers only, never the details or passwords).
        $code = preg_match('/\[(\d{4})\]/', $e->getMessage(), $m) ? (int)$m[1] : 0;
        if ($code === 1045) $msg = 'Database error 1045: the database user or password in config.local.php was refused.';
        elseif ($code === 1044 || $code === 1049) $msg = "Database error $code: the database name in config.local.php is wrong, or the user has not been added to that database with ALL PRIVILEGES.";
        elseif ($code === 2002 || $code === 2005) $msg = "Database error $code: cannot reach the database server (db_host in config.local.php).";
        elseif ($code === 1142) $msg = 'Database error 1142: the database user lacks a privilege. Give it ALL PRIVILEGES on the database.';
        else $msg = 'Database error' . ($code ? " $code" : ' (' . $e->getCode() . ')') . '. Check that the database is running and that config.local.php has the right database details.';
    }
    respond(['error' => $msg], 500);
}
