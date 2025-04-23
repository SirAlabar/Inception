FROM alpine:3.18

# Install necessary packages
RUN apk update && apk add --no-cache \
    ca-certificates \
    curl \
    tzdata

# Create directories
RUN mkdir -p /var/lib/portainer /data

# Set environment variables
ENV PORTAINER_VERSION=2.16.2

# Download and install Portainer
RUN curl -L https://github.com/portainer/portainer/releases/download/${PORTAINER_VERSION}/portainer-${PORTAINER_VERSION}-linux-amd64.tar.gz -o portainer.tar.gz \
    && tar -xzf portainer.tar.gz \
    && mv portainer/* /usr/local/bin/ \
    && rm -rf portainer portainer.tar.gz

# Expose port
EXPOSE 9000

# Create volume
VOLUME /data

# Start Portainer
ENTRYPOINT ["/usr/local/bin/portainer"]
CMD ["--bind", "0.0.0.0:9000", "--data", "/data"]