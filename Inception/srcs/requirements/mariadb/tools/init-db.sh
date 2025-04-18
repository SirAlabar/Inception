#!/bin/bash

# Check if the database directory is empty 
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MariaDB data directory..."

    #  Initialize the MySQL data directory
    mysql_install_db --user=mysql --datadir=/var/lib/mysql

    # Start MariaDB temporarily to set up the database
    /usr/bin/mysqld_safe --datadir=/var/lib/mysql &

    # Wait for MySQL to start
    until mysqladmin ping >/dev/null 2>&1; do
        echo "Waiting for MariaDB to be available..."
        sleep 1
    done

    # Create the WordPress database and user
    echo "Setting up MariaDB for WordPress..."
    mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';
ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;
EOF
    
    # Shutdown the temporary MariaDB instance
    mysqladmin -u root -p${MYSQL_ROOT_PASSWORD} shutdown

    echo "MariaDB initialization completed"
else
    echo "MariaDB data directori already initialized"
fi

#Start MariaDN normally
    echo "Starting MariaDB server..."
    exec mysql_safe --datadir=/var/lib/mysql
