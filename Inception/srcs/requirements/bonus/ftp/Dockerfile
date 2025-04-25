FROM alpine:3.18

# Install vsftpd and dependencies
RUN apk update && \
    apk add --no-cache vsftpd openssl bash shadow && \
    mkdir -p /var/log/vsftpd && \
    mkdir -p /var/run/vsftpd/empty && \
    mkdir -p /etc/vsftpd && \
    mkdir -p /var/ftp && \
    mkdir -p /var/www/html

# Copy configuration files and setup scripts
COPY conf/vsftpd.conf /etc/vsftpd/vsftpd.conf
COPY tools/ftp_setup.sh /usr/local/bin/ftp_setup.sh

# Make the scripts executable
RUN chmod +x /usr/local/bin/ftp_setup.sh

# Expose FTP ports
EXPOSE 20 21 40000-40100

# Mount WordPress volume
VOLUME /var/www/html

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/ftp_setup.sh"]