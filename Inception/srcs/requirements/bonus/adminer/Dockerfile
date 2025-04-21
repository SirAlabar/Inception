FROM alpine:3.18

# Install required packages
RUN apk update && apk add --no-cache \
    php81 \
    php81-session \
    php81-mysqli \
    php81-pdo \
    php81-pdo_mysql \
    php81-pdo_pgsql \
    php81-pdo_sqlite \
    php81-json \
    php81-fpm \
    curl \
    wget

# Create directory for Adminer
WORKDIR /var/www/html

# Download Adminer
RUN wget -O index.php https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1-mysql.php

# Set Permissions
RUN chmod 755 index.php

# Create a user for PHP
RUN adduser -D -H -s /sbin/nologin adminer
RUN chown -R adminer:adminer /var/www/html

# Use a custom PHP configuration for better security
COPY ./conf/php-fpm.conf /etc/php81/php-fpm.conf
COPY ./conf/www.conf /etc/php81/php-fpm.d/www.conf

# Copy startup script
COPY ./tools/adminer.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/adminer.sh

# Expose port for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["/usr/local/bin/adminer.sh"]