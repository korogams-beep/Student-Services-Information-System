<?php

// Ensure cache and view directories exist in /tmp for Vercel's read-only filesystem
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

// Forward Vercel requests to Laravel's public entry point
require __DIR__.'/../public/index.php';
