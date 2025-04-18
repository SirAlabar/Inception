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

# Working Directory for WordPress
WORKDIR /var/www/html

# Container startup command
CMD ["/usr/local/bin/setup_wordpress.sh"]