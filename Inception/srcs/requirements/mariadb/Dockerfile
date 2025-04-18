FROM debian:bullseye

# Install MariaDB
RUN apt-get update && apt-get install -y \
    mariadb-server \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create directory for the data valume
RUN mkdir -p /var/lib/mysql

# Copy configuration file
COPY ./conf/my.cnf /etc/mysql/my.cnf

# Copy the initialization script
COPY ./tools/init-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-db.sh

# Expose MariaDB port
EXPOSE 3306

# Set the data directory as a volume
VOLUME ["/var/lib/mysql"]

# Set entrypoint to initialize the database and start MariaDB
ENTRYPOINT [ "init-db.sh" ]