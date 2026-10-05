<?php

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

define('LARAVEL_START', microtime(true));

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

if ($isFirstInit && $dbConnection === 'sqlite') {
    try {
        Artisan::call('migrate', ['--force' => true]);
        (new DatabaseSeeder)->run();
    } catch (Throwable $e) {
        error_log('Database initialization note: '.$e->getMessage());
    }
}

$app->handleRequest(Request::capture());
