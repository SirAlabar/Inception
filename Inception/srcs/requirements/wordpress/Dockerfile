FROM debian:bullseye

# Update and install dependencies in a single layer
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    php7.4-fpm \
    php-mysqli \
    curl \
    mariadb-client \
    redis-tools && \
    rm -rf /var/lib/apt/lists/*

# Creating the directory for the PHP-FPM socket
RUN mkdir -p /run/php

# Working Directory for WordPress
WORKDIR /var/www/html

# Copy script
COPY /conf/www.conf /etc/php/7.4/fpm/pool.d/
COPY /tools/setup_wordpress.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/setup_wordpress.sh

# Container startup command
CMD ["/usr/local/bin/setup_wordpress.sh"]