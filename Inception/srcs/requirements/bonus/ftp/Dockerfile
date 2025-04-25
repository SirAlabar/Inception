FROM alpine:3.18

# Install vsftpd and dependencies
RUN apk update && apk add --no-cache \
    vsftpd \
    bash \
    shadow \
    netcat-openbsd \
    openssl \
    && mkdir -p /var/run/vsftpd/empty \
    && mkdir -p /var/log/vsftpd \
    && mkdir -p /etc/vsftpd \
    && mkdir -p /var/www/html \
    && rm -fr /var/cache/apk/*

# Copy configuration files and setup scripts
COPY conf/vsftpd.conf /etc/vsftpd/vsftpd.conf
COPY tools/ftp_setup.sh /usr/local/bin/ftp_setup.sh

# Make scripts executable
RUN chmod +x /usr/local/bin/ftp_setup.sh

# Expose FTP ports (control and passive data ports)
EXPOSE 20 21 40000-40100

# Mount WordPress volume
VOLUME /var/www/html

# Set the command to run
CMD ["/usr/local/bin/ftp_setup.sh"]