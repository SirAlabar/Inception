#!/bin/sh

# Ensure DOMAIN_NAME is set
if [ -z "${DOMAIN_NAME}" ]; then
    echo "WARNING: DOMAIN_NAME is not set, using 'localhost'"
    DOMAIN_NAME="localhost"
fi

# Create SSL directory if it doesn't exist
mkdir -p /etc/nginx/ssl

# Generate self-signed SSL certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=BR/ST=State/L=City/O=42School/OU=Inception/CN=${DOMAIN_NAME}"

# Set correct permissions
chmod 600 /etc/nginx/ssl/nginx.key
chmod 644 /etc/nginx/ssl/nginx.crt

echo "SSL certificate generated successfully for ${DOMAIN_NAME}"
