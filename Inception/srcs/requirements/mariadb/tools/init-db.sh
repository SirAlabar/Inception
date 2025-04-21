#!/bin/bash
# Check for Docker secrets first
if [ -f "/run/secrets/db_user" ]; then
    SQL_USER=$(cat /run/secrets/db_user)
    SQL_PASS=$(cat /run/secrets/db_password)
    SQL_ROOT_PASS=$(cat /run/secrets/db_root_password)
    echo "Using Docker secrets for database configuration"
else
    # Fall back to environment variables if secrets are not available
    SQL_USER=${MYSQL_USER}
    SQL_PASS=${MYSQL_PASSWORD}
    SQL_ROOT_PASS=${MYSQL_ROOT_PASSWORD}
    echo "Using environment variables for database configuration"
fi

# Display debug info
echo "Database setup with:"
echo "User: $SQL_USER"
echo "Database: ${MYSQL_DATABASE:-wordpress}"

# Check if a MariaDB process is already running
if pgrep mysqld > /dev/null; then
    echo "MariaDB process already running, stopping it..."
    pkill -9 mysqld
    sleep 3
fi

echo "Status of /var/lib/mysql directory:"
ls -la /var/lib/mysql

# Check if the database was previously initialized
DB_INITIALIZED=0
if [ -d "/var/lib/mysql/mysql" ]; then
    echo "MariaDB data directory appears to be already initialized"
    DB_INITIALIZED=1
fi

# If reinitialization is needed, do it
if [ $DB_INITIALIZED -eq 0 ]; then
    echo "Initializing fresh MariaDB data directory..."
    # Clean directory only if reinitialization is needed
    rm -rf /var/lib/mysql/*
    
    # Initialize MariaDB data directory
    mysql_install_db --user=mysql --datadir=/var/lib/mysql
    
    # Start MariaDB temporarily for setup
    mysqld --user=mysql &
    PID=$!
    
    # Wait for MariaDB to start
    until mysqladmin ping >/dev/null 2>&1; do
        echo "Waiting for MariaDB to be available..."
        sleep 3
    done
    
    # Create database and user - NOTE THE % CHARACTER FOR ALLOWING ALL HOSTS
    mysql -u root <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE:-wordpress};
CREATE USER IF NOT EXISTS '$SQL_USER'@'%' IDENTIFIED BY '$SQL_PASS';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE:-wordpress}.* TO '$SQL_USER'@'%';
ALTER USER 'root'@'localhost' IDENTIFIED BY '$SQL_ROOT_PASS';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
    
    # Verify the user created in the database
    echo "Checking user created in the database:"
    mysql -u root -p$SQL_ROOT_PASS -e "SELECT User, Host FROM mysql.user;"
    
    # Shutdown the temporary instance
    mysqladmin -u root -p$SQL_ROOT_PASS shutdown
    echo "MariaDB initialization completed"
else
    # If database is already initialized, we need to update user permissions
    # Start MariaDB temporarily
    mysqld --user=mysql &
    PID=$!
    
    # Wait for MariaDB to start
    until mysqladmin ping >/dev/null 2>&1; do
        echo "Waiting for MariaDB to be available..."
        sleep 3
    done
    
    # Update user permissions
echo "Updating user permissions..."
mysql -u root -p$SQL_ROOT_PASS <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE:-wordpress};
DROP USER IF EXISTS '$SQL_USER'@'localhost';
CREATE USER IF NOT EXISTS '$SQL_USER'@'%' IDENTIFIED BY '$SQL_PASS';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE:-wordpress}.* TO '$SQL_USER'@'%';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
    
    # Verify the user permissions
    echo "Checking updated user permissions:"
    mysql -u root -p$SQL_ROOT_PASS -e "SELECT User, Host FROM mysql.user;"
    
    # Shutdown the temporary instance
    mysqladmin -u root -p$SQL_ROOT_PASS shutdown
    echo "MariaDB permissions updated"
fi

# Clear sensitive environment variables
unset SQL_USER SQL_PASS SQL_ROOT_PASS

# Start MariaDB in the foreground
echo "Starting MariaDB server..."
exec mysqld --user=mysql