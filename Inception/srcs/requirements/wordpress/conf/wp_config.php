<?php
/**
 * WordPress configuration file
 */

// ** Database settings - Get from environment variables ** //
define( 'DB_NAME', getenv('SQL_DB') );
define( 'DB_USER', getenv('SQL_USER') );
define( 'DB_PASSWORD', getenv('SQL_PASS') );
define( 'DB_HOST', getenv('WORDPRESS_DB_HOST') ?: 'mariadb' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

// ** Authentication unique keys and salts ** //
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');

// ** Table prefix ** //
$table_prefix = 'wp_';

// ** Redis settings (if enabled) ** //
if (getenv('REDIS_ENABLED') === 'true') {
    define('WP_REDIS_HOST', 'redis');
    define('WP_REDIS_PORT', 6379);
    define('WP_CACHE', true);
}

// ** WordPress debugging mode ** //
define( 'WP_DEBUG', false );

// ** Absolute path to the WordPress directory ** //
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

// ** Sets up WordPress vars and included files ** //
require_once ABSPATH . 'wp-settings.php';