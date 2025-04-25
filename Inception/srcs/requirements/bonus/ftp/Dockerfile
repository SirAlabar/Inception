FROM alpine:3.18

# Install vsftpd

RUN apk update && apk add --no-cache vsftpd

# Copy configuration and script
COPY ./conf/vsftpd.conf /etc/vsftpd/vsftpd.conf
COPY ./tools/ftp_setup.sh /usr/local/bin/ftp_setup.sh

# Fix line endings and make script executable
RUN sed -i 's/\r$//' /etc/vsftpd/vsftpd.conf && \
    sed -i 's/\r$//' /usr/local/bin/ftp_setup.sh && \
    chmod +x /usr/local/bin/ftp_setup.sh

# Expose FTP ports
EXPOSE 21 40000-40100

# Start FTP service
ENTRYPOINT ["/usr/local/bin/ftp_setup.sh"]