#!/bin/bash
set -e  # Exit immediately on error

# Initial debug to show environment
echo "=========== DEBUG ENVIRONMENT ============"
echo "WORDPRESS_DB_HOST: ${WORDPRESS_DB_HOST:-mariadb}"
echo "MYSQL_DATABASE: $MYSQL_DATABASE"
echo "Available Docker Secrets:"
ls -l /run/secrets/

# Load secrets with validation
if [ -f "/run/secrets/db_user" ]; then
    SQL_USER=$(cat /run/secrets/db_user)
    echo "Secret db_user loaded: $SQL_USER"
else
    echo "ERROR: Secret db_user not found!"
    exit 1
fi

if [ -f "/run/secrets/db_password" ]; then
    SQL_PASS=$(cat /run/secrets/db_password)
    echo "Secret db_password loaded"
else
    echo "ERROR: Secret db_password not found!"
    exit 1
fi

# Check if secrets contain newlines or extra spaces
echo "Checking format of secrets:"
echo "db_user: $(hexdump -C /run/secrets/db_user | head -1)"
echo "db_password: $(hexdump -C /run/secrets/db_password | head -1)"

# Define necessary variables
SQL_DB=${MYSQL_DATABASE:-wordpress}
WP_URL=${DOMAIN_NAME:-localhost}
WP_TITLE="WordPress Site"

echo "Database configuration:"
echo "Host: mariadb"
echo "Database: $SQL_DB"
echo "User: $SQL_USER"
echo "Password (first chars): ${SQL_PASS:0:3}..."

# Test name resolution
echo "Testing name resolution:"
getent hosts mariadb || echo "Failed to resolve hostname mariadb"

# Database connection check with improved logging
echo "Checking database connection..."
max_retries=30
for ((counter=1; counter<=max_retries; counter++)); do
    echo "Attempt $counter of $max_retries..."
    
    if mysql -h mariadb -u "$SQL_USER" -p"$SQL_PASS" -e "SELECT 1" 2>/tmp/mysql_error; then
        echo "✅ Database connection successful!"
        break
    else
        echo "❌ Connection failed:"
        cat /tmp/mysql_error
    fi
   
    echo "Database not ready. Waiting 5 seconds..."
    sleep 5
   
    if [ $counter -eq $max_retries ]; then
        echo "Database connection failed after $max_retries attempts."
        exit 1
    fi
done

# Ensure WordPress directory exists
mkdir -p /var/www/html
cd /var/www/html

# WordPress installation
if [ ! -f "wp-config.php" ]; then
    echo "Installing WordPress..."
   
    # Download WP-CLI
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod +x wp-cli.phar
    
    # Core WordPress setup
    ./wp-cli.phar core download --allow-root
    ./wp-cli.phar config create \
        --dbname="$SQL_DB" \
        --dbuser="$SQL_USER" \
        --dbpass="$SQL_PASS" \
        --dbhost=mariadb \
        --allow-root
        
    # Install WordPress
    ./wp-cli.phar core install \
        --url="$WP_URL" \
        --title="$WP_TITLE" \
        --admin_user="$WP_ADMIN_USER" \
        --admin_password="$WP_ADMIN_PASS" \
        --admin_email="$WP_ADMIN_EMAIL" \
        --allow-root
        
    # Create additional user
    ./wp-cli.phar user create \
        "$WP_USER" "$WP_USER_EMAIL" \
        --role=subscriber \
        --user_pass="$WP_USER_PASS" \
        --allow-root
        
    # Configure WordPress
    ./wp-cli.phar option update comment_registration 1 --allow-root
   
    # Theme and plugin setup
    ./wp-cli.phar theme install oceanwp --activate --allow-root
    ./wp-cli.phar plugin install redis-cache --activate --allow-root
   
    # Redis configuration
    ./wp-cli.phar config set WP_REDIS_HOST redis --allow-root
    ./wp-cli.phar config set WP_REDIS_PORT 6379 --allow-root
    ./wp-cli.phar config set WP_CACHE true --allow-root
    ./wp-cli.phar redis enable --allow-root
else
    echo "WordPress already installed."
fi

# Set correct permissions
chown -R www-data:www-data /var/www/html/
chmod -R 755 /var/www/html/

# Clear sensitive variables
unset SQL_USER SQL_PASS WP_ADMIN_USER WP_ADMIN_PASS WP_ADMIN_EMAIL \
      WP_USER WP_USER_EMAIL WP_USER_PASS
      
# Start PHP-FPM
exec /usr/sbin/php-fpm7.4 -F