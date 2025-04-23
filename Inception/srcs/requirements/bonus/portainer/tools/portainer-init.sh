#!/bin/sh

# Set up initial admin user if this is the first run
if [ ! -f "/data/portainer.db" ]; then
    echo "First time running Portainer, setting up initial admin user..."
    # The password will be configured later via the web interface
fi

# Start Portainer
echo "Starting Portainer..."
exec /usr/local/bin/portainer --bind 0.0.0.0:9000 --data /data --no-analytics