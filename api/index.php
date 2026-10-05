<?php

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\URL;

define('LARAVEL_START', microtime(true));

// Prevent Vercel's /api/ folder from altering the base URL and protocol
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/../public/index.php';
$_SERVER['HTTPS'] = 'on';
$_SERVER['SERVER_PORT'] = 443;
$_SERVER['HTTP_X_FORWARDED_PROTO'] = 'https';

// Ensure cache, view, session, and storage directories exist in /tmp
$dirs = [
    '/tmp/views',
    '/tmp/cache',
    '/tmp/sessions',
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/sessions',
];

foreach ($dirs as $dir) {
    if (! is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

$sqliteFile = '/tmp/database.sqlite';
$isFirstInit = false;
$dbConnection = getenv('DB_CONNECTION') ?: 'sqlite';

if ($dbConnection === 'sqlite') {
    if (! file_exists($sqliteFile) || filesize($sqliteFile) === 0) {
        @touch($sqliteFile);
        $isFirstInit = true;
    }
}

require __DIR__.'/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// Force HTTPS for all generated asset and route URLs
URL::forceScheme('https');

if ($isFirstInit && $dbConnection === 'sqlite') {
    try {
        Artisan::call('migrate', ['--force' => true]);
        (new DatabaseSeeder)->run();
    } catch (Throwable $e) {
        error_log('Database initialization note: '.$e->getMessage());
    }
}

$app->handleRequest(Request::capture());
