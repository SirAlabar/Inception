#!/bin/sh
# Get credentials from secrets
FTP_USER=$(cat /run/secrets/ftp_user)
FTP_PASS=$(cat /run/secrets/ftp_password)

# Replace domain name
sed -i "s/\${DOMAIN_NAME}/${DOMAIN_NAME:-localhost}/g" /etc/vsftpd/vsftpd.conf

# Ensure directory exists and has correct permissions
mkdir -p /var/www/html
chmod 777 /var/www/html

# Create user if it doesn't exist
if ! id -u $FTP_USER > /dev/null 2>&1; then
    adduser -D $FTP_USER
fi

# Set password
echo "$FTP_USER:$FTP_PASS" | chpasswd

# Clear credentials from environment
unset FTP_USER FTP_PASS

# Start vsftpd in foreground
exec vsftpd /etc/vsftpd/vsftpd.conf