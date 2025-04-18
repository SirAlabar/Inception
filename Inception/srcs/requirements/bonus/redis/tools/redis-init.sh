#!/bin/sh

# Replace environment variables in the configuration file
sed -i "s|\${REDIS_PASSWORD}|${REDIS_PASSWORD}|g" /etc/redis.conf

# Start Redis server with the configuration file
exec redis-server /etc/redis.conf