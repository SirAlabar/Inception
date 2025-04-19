FROM debian:bullseye

# Installing essential packages
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    php7.4-fpm \
    php-mysqli \
    php-curl \
    php-gd \
    php-mbstring \
    php-xml \
    php-zip \
    curl \
    mariadb-client \
    redis-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Creating the directory for the PHP-FPM socket
RUN mkdir -p /run/php

# Copy configuration file
COPY /conf/www.conf /etc/php/7.4/fpm/pool.d/

# Copy script
COPY /tools/setup_wordpress.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/setup_wordpress.sh

# Configure PHP-FPM to pass environment variables to PHP
RUN echo "env[MYSQL_DATABASE] = \$MYSQL_DATABASE" >> /etc/php/7.4/fpm/pool.d/www.conf && \
    echo "env[MYSQL_USER] = \$MYSQL_USER" >> /etc/php/7.4/fpm/pool.d/www.conf && \
    echo "env[MYSQL_PASSWORD] = \$MYSQL_PASSWORD" >> /etc/php/7.4/fpm/pool.d/www.conf && \
    echo "env[SQL_DB] = \$SQL_DB" >> /etc/php/7.4/fpm/pool.d/www.conf && \
    echo "env[SQL_USER] = \$SQL_USER" >> /etc/php/7.4/fpm/pool.d/www.conf && \
    echo "env[SQL_PASS] = \$SQL_PASS" >> /etc/php/7.4/fpm/pool.d/www.conf

# Working Directory for WordPress
WORKDIR /var/www/html

# Container startup command
CMD ["/usr/local/bin/setup_wordpress.sh"]