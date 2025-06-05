# Use Alpine Linux as base image
FROM alpine:3.18

# Install nginx only 
RUN apk update && \
    apk add --no-cache nginx \
    && rm -rf /var/cache/apk/*

# Create nginx user and group
RUN adduser -D -s /bin/sh nginx

# Create necessary directories
RUN mkdir -p /var/www/html \
    && mkdir -p /var/log/nginx \
    && mkdir -p /var/lib/nginx/tmp \
    && mkdir -p /run/nginx

# Copy nginx configuration
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Copy website files directly
COPY website/ /var/www/html/

# Set permissions
RUN chown -R nginx:nginx /var/www/html \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /var/lib/nginx \
    && chown -R nginx:nginx /run/nginx

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]