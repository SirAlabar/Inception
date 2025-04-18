FROM alpine:3.18

# Install Redis and required packages
RUN apk update && apk add --no-cache \
    redis \
    && rm -rf /var/cache/apk/*

# Copy configuration files
COPY ./conf/redis.conf /etc/redis.conf

# Copy initialization scripts
COPY ./tools/redis-init.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/redis-init.sh

# Expose Redis port
EXPOSE 6379

# Set the entrypoint script
ENTRYPOINT ["/usr/local/bin/redis-init.sh"]