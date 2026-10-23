<?php
function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $c = require __DIR__ . '/config.php';
    $name = preg_replace('/[^A-Za-z0-9_]/', '', $c['db_name']);
    // Locally the database is created for you. On web hosting you create it in the control panel and the
    // account is not allowed to create one, so a refusal here is fine: we simply connect to the existing one.
    try {
        $server = new PDO("mysql:host={$c['db_host']};charset=utf8mb4", $c['db_user'], $c['db_pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $server->exec("CREATE DATABASE IF NOT EXISTS `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    } catch (PDOException $e) {
        // carry on: the connection below reports any real problem
    }
    $pdo = new PDO("mysql:host={$c['db_host']};dbname=$name;charset=utf8mb4", $c['db_user'], $c['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    ensure_schema($pdo);
    return $pdo;
}

// Adds the columns a table is missing. ("ADD COLUMN IF NOT EXISTS" only exists in MariaDB; most hosts run MySQL.)
function add_columns(PDO $pdo, string $table, array $columns): void {
    $have = array_map('strtolower', array_column($pdo->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_ASSOC), 'Field'));
    foreach ($columns as $name => $definition) {
        if (!in_array(strtolower($name), $have, true)) $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$name` $definition");
    }
}

function ensure_schema(PDO $pdo): void {
    $marker = __DIR__ . '/.schema_v11';
    if (is_file($marker)) return;
    @unlink(__DIR__ . '/.schema_v10');
    @unlink(__DIR__ . '/.schema_v9');
    @unlink(__DIR__ . '/.schema_v8');
    @unlink(__DIR__ . '/.schema_v7');
    @unlink(__DIR__ . '/.schema_v6');
    @unlink(__DIR__ . '/.schema_v5');
    @unlink(__DIR__ . '/.schema_v1');
    @unlink(__DIR__ . '/.schema_v2');
    @unlink(__DIR__ . '/.schema_v3');
    @unlink(__DIR__ . '/.schema_v4');
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(120) NOT NULL DEFAULT 'Generic',
        category VARCHAR(120) NOT NULL DEFAULT '',
        category_name VARCHAR(160) NOT NULL DEFAULT '',
        specs TEXT NULL,
        image VARCHAR(500) NOT NULL DEFAULT '',
        alternate_images TEXT NULL,
        price DECIMAL(12,2) NULL,
        in_shop TINYINT(1) NOT NULL DEFAULT 1,
        in_catalog TINYINT(1) NOT NULL DEFAULT 1,
        active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(160) NOT NULL DEFAULT '',
        phone VARCHAR(60) NOT NULL DEFAULT '',
        product VARCHAR(255) NOT NULL DEFAULT '',
        budget VARCHAR(120) NOT NULL DEFAULT '',
        message TEXT NULL,
        handled TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    $pdo->exec("CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(40) NOT NULL,
        product_id VARCHAR(64) NULL,
        label VARCHAR(255) NOT NULL DEFAULT '',
        page VARCHAR(255) NOT NULL DEFAULT '',
        message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_product (product_id)
    ) ENGINE=InnoDB");
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(64) NULL,
        product_name VARCHAR(255) NOT NULL DEFAULT '',
        customer_name VARCHAR(160) NOT NULL DEFAULT '',
        customer_phone VARCHAR(60) NOT NULL DEFAULT '',
        message TEXT NULL,
        status ENUM('pending','dispatched','not_dispatched','cancelled') NOT NULL DEFAULT 'pending',
        note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
    ) ENGINE=InnoDB");
    add_columns($pdo, 'orders', [
        'user_id' => 'INT NULL',
        'offers_applied' => 'TEXT NULL',
        'final_price' => 'DECIMAL(12,2) NULL',
    ]);
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(40) NOT NULL,
        name VARCHAR(160) NOT NULL DEFAULT '',
        phone VARCHAR(60) NOT NULL DEFAULT '',
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
        must_change TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_username (username)
    ) ENGINE=InnoDB COLLATE utf8mb4_unicode_ci");
    $pdo->exec("CREATE TABLE IF NOT EXISTS offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('discount','coupon','delivery') NOT NULL,
        title VARCHAR(160) NOT NULL,
        description TEXT NULL,
        code VARCHAR(40) NULL,
        percent_off DECIMAL(5,2) NULL,
        amount_off DECIMAL(12,2) NULL,
        min_price DECIMAL(12,2) NULL,
        category VARCHAR(120) NOT NULL DEFAULT '',
        starts_on DATE NULL,
        ends_on DATE NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    add_columns($pdo, 'products', ['hot' => 'TINYINT(1) NOT NULL DEFAULT 0', 'old_price' => 'DECIMAL(12,2) NULL', 'free_gift' => "VARCHAR(120) NOT NULL DEFAULT ''", 'item_condition' => "VARCHAR(40) NOT NULL DEFAULT ''", 'hot_feature' => "VARCHAR(120) NOT NULL DEFAULT ''"]);
    add_columns($pdo, 'orders', [
        'quantity' => 'INT NOT NULL DEFAULT 1',
        'delivery_address' => "VARCHAR(500) NOT NULL DEFAULT ''",
        'cart_ref' => 'VARCHAR(20) NULL',
    ]);
    // Owner-editable website details (one JSON document per key) and the news / blog posts.
    $pdo->exec("CREATE TABLE IF NOT EXISTS site_settings (
        k VARCHAR(64) PRIMARY KEY,
        v MEDIUMTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        summary VARCHAR(400) NOT NULL DEFAULT '',
        body MEDIUMTEXT NULL,
        image VARCHAR(500) NOT NULL DEFAULT '',
        published TINYINT(1) NOT NULL DEFAULT 0,
        published_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_published (published, published_at)
    ) ENGINE=InnoDB");
    // Recent sign-in failures and form submissions, for the rate limits in api.php. The visitor's address is
    // stored only as a hash, and rows older than a day are deleted.
    $pdo->exec("CREATE TABLE IF NOT EXISTS attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(40) NOT NULL,
        ip_hash CHAR(64) NOT NULL,
        subject VARCHAR(64) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ip (action, ip_hash, created_at),
        INDEX idx_subject (action, subject, created_at)
    ) ENGINE=InnoDB");
    // First-run admin account. The admin is forced to change these credentials on first sign-in.
    $hasAdmin = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn();
    if ($hasAdmin === 0) {
        $pdo->prepare("INSERT INTO users (username,name,password_hash,role,must_change) VALUES (?,?,?,'admin',1)")
            ->execute(['Admin', 'Administrator', password_hash('Admin123', PASSWORD_DEFAULT)]);
    }
    @file_put_contents($marker, date('c'));
}
