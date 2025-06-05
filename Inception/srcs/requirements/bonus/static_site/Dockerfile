FROM alpine:3.18

# Install simple HTTP server
RUN apk add --no-cache python3

# Copy static files
COPY site/ /var/www/html/

# Working directory
WORKDIR /var/www/html

# Expose port
EXPOSE 8080

# Serve files
CMD ["python3", "-m", "http.server", "8080"]