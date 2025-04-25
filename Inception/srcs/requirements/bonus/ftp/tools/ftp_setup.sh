#!/bin/bash

# Load FTP user credentials from secrets or environment
if [ -f "/run/secrets/ftp_user" ] && [ -f "/run/secrets/ftp_password" ]; then
    FTP_USER=$(cat /run/secrets/ftp_user)
    FTP_PASS=$(cat /run/secrets/ftp_password)
    echo "Using Docker secrets for FTP credentials"
else
    # Fall back to environment variables
    FTP_USER=${FTP_USER:-wpftp}
    FTP_PASS=${FTP_PASSWORD:-ftppassword}
    echo "Using environment variables for FTP credentials"
fi

# Set passive mode address if provided
if [ -n "$FTP_PASV_ADDRESS" ]; then
    echo "Using provided passive mode address: $FTP_PASV_ADDRESS"
    sed -i "s/\${FTP_PASV_ADDRESS}/$FTP_PASV_ADDRESS/g" /etc/vsftpd/vsftpd.conf
else
    # Use container IP as fallback
    CONTAINER_IP=$(hostname -i)
    echo "Using container IP as passive mode address: $CONTAINER_IP"
    sed -i "s/\${FTP_PASV_ADDRESS}/$CONTAINER_IP/g" /etc/vsftpd/vsftpd.conf
fi

# Debug: Show network configuration
echo "Network configuration:"
echo "---------------------"
ip addr show
echo "---------------------"
echo "Hostname: $(hostname)"
echo "IP Address: $(hostname -i)"
echo "---------------------"

# Create FTP user if it doesn't exist
if ! id "$FTP_USER" &>/dev/null; then
    adduser -D -h /var/www/html $FTP_USER
    echo "FTP user $FTP_USER created"
else
    echo "FTP user $FTP_USER already exists"
fi

# Update password
echo "$FTP_USER:$FTP_PASS" | chpasswd
echo "Password updated for $FTP_USER"

# Add user to vsftpd user list
touch /etc/vsftpd/vsftpd.userlist
echo "$FTP_USER" > /etc/vsftpd/vsftpd.userlist

# Fix permissions - make sure www-data group has access
if getent group www-data > /dev/null; then
    # Add FTP user to www-data group
    adduser $FTP_USER www-data
    # Set proper permissions
    chown -R www-data:www-data /var/www/html
    chmod -R 775 /var/www/html
else
    # If www-data group doesn't exist, set ownership to FTP user
    chown -R $FTP_USER:$FTP_USER /var/www/html
    chmod -R 755 /var/www/html
fi

# Debug: Show directory listing and permissions
echo "Directory listing of /var/www/html:"
ls -la /var/www/html

# Clear sensitive variables
unset FTP_PASS

# Start vsftpd
echo "Starting FTP server..."
exec /usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf