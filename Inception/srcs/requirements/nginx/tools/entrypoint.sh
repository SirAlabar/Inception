#!/bin/sh

# if no provided Set default domain name

if [-z "$DOMAIN_NAME"]; then
    echo "WARNING: DOMAIN_NAME environment variable not set, using default"
    export DOMAIN_NAME="localhost"
fi

# Run SSL setup script
/usr/local/bin/ssl_setup.sh

# Replace environment variavles in the nginx configuraton
envsubst '${DOMAIN_NAME}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

# Start nginx
exec nginx -g "daemon off;"