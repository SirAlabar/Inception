FROM alpine:3.18

# Install requered packages
RUN apk update && apk add --no-cache \
    php81 \
    php81-session \
    php81-mysql \
    php81-pdo \
    php81-pdo_mysql \
    php81-pdo_pgsql \
    php81-pdo_sqlite \
    php81-json \
    curl \
    wget

# Create directory for Adminer
WORKDIR /var/www/html

# Download Adminer
RUN wget -O index.php https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1-mysql.php

# Set Permissions
RUN chmod 755 index.php

# Create a user ofr PHP
RUN adduser -D -H -s /sbin/nologin adminer

# Use a custom PHP configuration for better security
COPY ./conf/php-fpm.conf /etc/php81/php-fpm.conf
COPY ./conf/www.conf /etc/php81/php-fpm.d/www.conf

# Expose port for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm81", "-F"]