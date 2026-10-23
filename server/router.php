<?php
// Router for PHP's built-in server: php -S localhost:8080 -t server server/router.php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (strpos($path, '/api') === 0) {
    require __DIR__ . '/api.php';
    return true;
}
if (strpos($path, '/uploads/') === 0) {
    $file = realpath(__DIR__ . $path);
    $root = realpath(__DIR__ . '/uploads');
    if ($file && $root && strpos($file, $root) === 0 && is_file($file)) {
        $types = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'];
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (isset($types[$ext])) {
            header('Content-Type: ' . $types[$ext]);
            header('Cache-Control: public, max-age=86400');
            header('X-Content-Type-Options: nosniff');
            readfile($file);
            return true;
        }
    }
}
http_response_code(404);
echo 'Not found';
return true;
