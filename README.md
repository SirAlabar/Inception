# 🐳 Inception

<p align="center">
  <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWZuZjM2b2ZscGl6OTN4Y3dlcmd4YndrZ2E3aHNkZDhjZWxvajBkayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0T0FUiZl51VPCLsqLR/giphy.gif" width="600" alt="Inception Project">
</p>
<p align="center">
> A containerized infrastructure project built with Docker 🚀
</p>

## 📋 Overview

This project implements a complete web infrastructure using Docker containers. It creates a small but robust setup with multiple services including NGINX, WordPress, and MariaDB, all running in separate containers with proper networking and volume management.

![Infrastructure Diagram](https://via.placeholder.com/800x400?text=Inception+Infrastructure+Diagram)

## ✨ Features

- 🔒 **NGINX** with TLSv1.3 only, serving as the entry point (port 443)
- 🌐 **WordPress** with php-fpm running separately from NGINX
- 💾 **MariaDB** for database management
- 📊 **Docker volumes** for persistent data storage
- 🔄 **Automatic container restart** in case of crashes

### 🎯 Bonus Features

- ⚡ **Redis cache** for WordPress performance optimization
- 📁 **FTP server** pointing to the WordPress volume
- 🖥️ **Static website** built with Pixi.js (check it out [here](https://github.com/SirAlabar/Alabar_Site_V2))
- 🛠️ **Adminer** for database management
- 🐙 **Portainer** for container visualization and management

## 🏗️ Architecture

All services are properly isolated, each running in its own container. The infrastructure follows best practices for Docker deployment:

- Proper use of environment variables
- No passwords in Dockerfiles
- Data persistence through mounted volumes
- Custom Docker network for inter-container communication
- Services configured to automatically restart in case of failure

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Make utility
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hluiz-ma/inception.git
   cd inception
   ```

2. Configure the environment:
   ```bash
   # Update your hosts file
   echo "127.0.0.1 hluiz-ma.42.fr" | sudo tee -a /etc/hosts
   ```

3. Build and start the containers:
   ```bash
   make
   ```

### Usage

Access the services through your browser:

- WordPress: https://hluiz-ma.42.fr
- Static Site: http://hluiz-ma.42.fr:8080
- Adminer: http://hluiz-ma.42.fr:8081
- Portainer: http://hluiz-ma.42.fr:9000

FTP access:
```bash
ftp -p hluiz-ma.42.fr
# Use the FTP credentials specified in your .env file
```

## 🛠️ Makefile Commands

- `make`: Build and start all containers
- `make down`: Stop all containers
- `make clean`: Stop containers and clean Docker resources
- `make fclean`: Complete cleanup including volumes
- `make re`: Rebuild everything from scratch

## 📂 Project Structure

```
Inception/
├── Makefile              # Build automation
├── secrets/              # Secret passwords (not in git)
└── srcs/
    ├── docker-compose.yml  # Services configuration
    ├── .env                # Environment variables
    └── requirements/
        ├── mariadb/        # MariaDB service
        ├── nginx/          # NGINX service
        ├── wordpress/      # WordPress service
        └── bonus/          # Bonus services
            ├── redis/
            ├── ftp/
            ├── static_site/
            ├── adminer/
            └── portainer/
```

## 📜 Technical Choices

### Why Alpine/Debian?

This project uses [Alpine/Debian] as the base image for containers due to [reasons for your choice - security, size, compatibility, etc.].

### Why Portainer?

Portainer was chosen as a bonus service because it provides:
- Visual management of Docker containers, networks, and volumes
- Resource usage monitoring
- Easy debugging through log access and terminal connections
- Excellent educational value for understanding Docker infrastructure

## 📚 Learning Outcomes

This project demonstrates understanding of:
- Container virtualization principles
- Docker and Docker Compose
- Nginx configuration with SSL
- WordPress and PHP-FPM setup
- Database configuration and security
- Volume management for data persistence
- Network configuration in containerized environments

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🧠 Acknowledgments

- 42 School for the project requirements
- Docker documentation and community
- All open-source projects used in this infrastructure
