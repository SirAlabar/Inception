#!/bin/bash

# Check for Docker secrets first
if [ -f "/run/secrets/sql_user" ]; then
    SQL_USER=$(cat /run/secrets/sql_user)
    SQL_PASS=$(cat /run/secrets/sql_pass)
    SQL_ROOT_PASS=$(cat /run/secrets/sql_root_pass)
    echo "Using Docker secrets for database configuration"
else
    # Fall back to environment variables if secrets are not available
    SQL_USER=${MYSQL_USER}
    SQL_PASS=${MYSQL_PASSWORD}
    SQL_ROOT_PASS=${MYSQL_ROOT_PASSWORD}
    echo "Using environment variables for database configuration"
fi

# Check if the database directory is already initialized
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MariaDB data directory..."
    mysql_install_db --user=mysql --datadir=/var/lib/mysql
    
    # Start MariaDB temporarily for setup
    mysqld --user=mysql &
    PID=$!
    
    # Wait for MySQL to start
    until mysqladmin ping >/dev/null 2>&1; do
        echo "Waiting for MariaDB to be available..."
        sleep 1
    done
    
    # Create database and user
    mysql -u root <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE:-wordpress};
CREATE USER IF NOT EXISTS '$SQL_USER'@'%' IDENTIFIED BY '$SQL_PASS';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE:-wordpress}.* TO '$SQL_USER'@'%';
ALTER USER 'root'@'localhost' IDENTIFIED BY '$SQL_ROOT_PASS';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
    
    # Shutdown the temporary instance
    mysqladmin -u root shutdown
    echo "MariaDB initialization completed"
else
    echo "MariaDB data directory already initialized"
fi

# Clear any sensitive environment variables
unset SQL_USER SQL_PASS SQL_ROOT_PASS

# Start MariaDB in the foreground
echo "Starting MariaDB server..."
exec mysqld --user=mysql