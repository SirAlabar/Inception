#!/bin/sh

# Check if PHP-FPM is installed correctly
if [ ! -f "/usr/sbin/php-fpm81" ]; then
    echo "ERROR: PHP-FPM not found. Check installation."
    exit 1
fi

echo "Starting PHP-FPM for Adminer..."

# Check if configuration files exist
if [ ! -f "/etc/php81/php-fpm.conf" ]; then
    echo "WARNING: Main configuration file not found."
fi

if [ ! -f "/etc/php81/php-fpm.d/www.conf" ]; then
    echo "WARNING: www.conf configuration file not found."
fi

# Start PHP-FPM in foreground
exec /usr/sbin/php-fpm81 -F