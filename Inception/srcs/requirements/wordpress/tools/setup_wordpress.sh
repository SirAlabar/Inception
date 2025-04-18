#!/bin/bash
# Loading credentials from secrets
if [ -d "/run/secrets" ]; then
    # Using Docker Secrets if available
    SQL_USER=$(cat /run/secrets/sql_user)
    SQL_PASS=$(cat /run/secrets/sql_pass)
    WP_ADMIN_USER=$(cat /run/secrets/wp_admin_user)
    WP_ADMIN_PASS=$(cat /run/secrets/wp_admin_pass)
    WP_ADMIN_EMAIL=$(cat /run/secrets/wp_admin_email)
else
    # Fallback to environment variables
    echo "Docker Secrets not found, using environment variables"
fi

# Database connection check
echo "Checking database connection..."
max_retries=30
counter=0
while ! mysql -h mariadb -u $SQL_USER -p$SQL_PASS -e "SELECT 1" >/dev/null 2>&1; do
    counter=$((counter+1))
    if [ $counter -gt $max_retries ]; then
        echo "Database connection failed after $max_retries attempts. Exiting."
        exit 1
    fi
    echo "Database not ready yet. Waiting 5 seconds... (Attempt $counter/$max_retries)"
    sleep 5
done
echo "Database connection successful! Continuing with WordPress setup..."

# Redis connection check
echo "Checking Redis connection..."
max_retries=10
counter=0
while ! redis-cli -h redis ping >/dev/null 2>&1; do
    counter=$((counter+1))
    if [ $counter -gt $max_retries ]; then
        echo "Warning: Redis not available after $max_retries attempts. Continuing without Redis."
        export REDIS_ENABLED="false"
        break
    fi
    echo "Redis not ready yet. Waiting 5 seconds... (Attempt $counter/$max_retries)"
    sleep 5
done
if redis-cli -h redis ping >/dev/null 2>&1; then
    echo "Redis connection established!"
    export REDIS_ENABLED="true"
fi

# WordPress directory
cd /var/www/html

# WordPress installation and configuration
if [ ! -f "wp-config.php" ]; then
    echo "Installing WordPress..."
   
    # Download WP-CLI
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod +x wp-cli.phar
   
    # Download WordPress
    ./wp-cli.phar core download --allow-root
   
    # Create configuration file
    ./wp-cli.phar config create \
        --dbname=$SQL_DB \
        --dbuser=$SQL_USER \
        --dbpass=$SQL_PASS \
        --dbhost=mariadb \
        --allow-root
    
    # Add Redis configuration to wp-config.php if Redis is available
    if [ "$REDIS_ENABLED" = "true" ]; then
        echo "Adding Redis configuration to wp-config.php..."
        # Add Redis configuration before the "That's all" line
        sed -i "/That's all/i \
/* Redis Settings */ \\n\
define('WP_REDIS_HOST', 'redis'); \\n\
define('WP_REDIS_PORT', 6379); \\n\
define('WP_REDIS_TIMEOUT', 1); \\n\
define('WP_REDIS_READ_TIMEOUT', 1); \\n\
define('WP_REDIS_DATABASE', 0); \\n\
define('WP_CACHE', true); \\n\
" wp-config.php
    fi
   
    # Install WordPress
    ./wp-cli.phar core install \
        --url=$WP_URL \
        --title=$WP_TITLE \
        --admin_user=$WP_ADMIN_USER \
        --admin_password=$WP_ADMIN_PASS \
        --admin_email=$WP_ADMIN_EMAIL \
        --allow-root
   
    # Create additional non-admin user
    ./wp-cli.phar user create \
        $WP_USER $WP_USER_EMAIL \
        --role=subscriber \
        --user_pass=$WP_USER_PASS \
        --allow-root
   
    # Additional WordPress settings
    ./wp-cli.phar option update comment_registration 1 --allow-root
   
    # Install custom theme
    ./wp-cli.phar theme install oceanwp --activate --allow-root
   
    # Configure Redis Cache
    if [ "$REDIS_ENABLED" = "true" ]; then
        echo "Installing and configuring Redis Cache plugin..."
        # Install and activate Redis Object Cache plugin
        ./wp-cli.phar plugin install redis-cache --activate --allow-root
        
        # Create the object-cache.php drop-in
        ./wp-cli.phar redis enable --allow-root
        
        echo "Redis Cache plugin installed and activated!"
        
        # Verify Redis is working
        REDIS_STATUS=$(./wp-cli.phar redis status --allow-root)
        echo "Redis Status: $REDIS_STATUS"
    fi
else
    echo "WordPress already installed, checking Redis status..."
    
    # Check if Redis plugin is installed and Redis is connected
    if [ "$REDIS_ENABLED" = "true" ] && [ -f "/var/www/html/wp-content/plugins/redis-cache/redis-cache.php" ]; then
        # Make sure Redis configuration is in wp-config.php
        if ! grep -q "WP_REDIS_HOST" /var/www/html/wp-config.php; then
            echo "Adding Redis configuration to existing wp-config.php..."
            sed -i "/That's all/i \
/* Redis Settings */ \\n\
define('WP_REDIS_HOST', 'redis'); \\n\
define('WP_REDIS_PORT', 6379); \\n\
define('WP_REDIS_TIMEOUT', 1); \\n\
define('WP_REDIS_READ_TIMEOUT', 1); \\n\
define('WP_REDIS_DATABASE', 0); \\n\
define('WP_CACHE', true); \\n\
" wp-config.php
        fi
        
        # Enable Redis if not already enabled
        if [ ! -f "/var/www/html/wp-content/object-cache.php" ]; then
            echo "Enabling Redis Object Cache..."
            ./wp-cli.phar redis enable --allow-root
        fi
        
        echo "Redis Cache configuration verified!"
    fi
fi

# Setting permissions
echo "Configuring permissions..."
chown -R www-data:www-data /var/www/html/
find /var/www/html/ -type d -exec chmod 755 {} \;
find /var/www/html/ -type f -exec chmod 644 {} \;
chmod 755 /var/www/html/wp-content

# Cleaning sensitive variables
if [ -d "/run/secrets" ]; then
    unset SQL_USER SQL_PASS WP_ADMIN_USER WP_ADMIN_PASS WP_ADMIN_EMAIL \
          WP_USER WP_USER_EMAIL WP_USER_PASS
fi

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec /usr/sbin/php-fpm7.4 -F