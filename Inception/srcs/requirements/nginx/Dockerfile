FROM alpine:3.18

# Install nginx and necessaru packages
RUN apk update && apk add --no-cache \
    nginx \
    openssl \
    gettext

# Create directories for certificates and nginx pid
RUN mkdir -p /run/nginx /etc/nginx/ssl

# Copy nginx configuration as template
COPY ./conf/nginx.conf /etc/nginx/http.d/default.conf.template

# Copy script
COPY ./tools/entrypoint.sh /usr/local/bin/
COPY ./tools/ssl_setup.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/ssl_setup.sh

# Expose port 443
EXPOSE 443

# Use the entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]