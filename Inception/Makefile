#==============================================================================#
#                                   COLORS                                       #
#==============================================================================#
RED			= \033[0;31m
GREEN		= \033[0;32m
YELLOW		= \033[0;33m
BLUE		= \033[0;34m
MAGENTA		= \033[0;35m
CYAN		= \033[0;36m
WHITE		= \033[0;37m
GRAY        = \033[1;30m
RESET		= \033[0m

#==============================================================================#
#                                   TARGETS                                     #
#==============================================================================#
NAME		= inception
COMPOSE		= cd srcs && docker-compose
VOLUMES_DIR	= /home/$(USER)/data

#==============================================================================#
#                                   RULES                                       #
#==============================================================================#
all:		ascii up

up:
			@echo "$(GREEN)Building and starting containers...$(RESET)"
			@$(COMPOSE) up --build -d
			@echo "$(GREEN)All containers are running!$(RESET)"

down:
			@echo "$(YELLOW)Shutting down containers...$(RESET)"
			@$(COMPOSE) down
			@echo "$(YELLOW)Containers shut down successfully!$(RESET)"

stop:
			@echo "$(YELLOW)Stopping containers...$(RESET)"
			@$(COMPOSE) stop
			@echo "$(YELLOW)Containers stopped successfully!$(RESET)"

start:
			@echo "$(GREEN)Starting existing containers...$(RESET)"
			@$(COMPOSE) start
			@echo "$(GREEN)Containers started successfully!$(RESET)"

restart:
			@echo "$(YELLOW)Restarting containers...$(RESET)"
			@$(COMPOSE) restart
			@echo "$(GREEN)Containers restarted successfully!$(RESET)"

status:
			@echo "$(BLUE)Containers status:$(RESET)"
			@docker ps -a

volumes:
			@echo "$(BLUE)Docker volumes:$(RESET)"
			@docker volume ls

networks:
			@echo "$(BLUE)Docker networks:$(RESET)"
			@docker network ls

clean:		down
			@echo "$(YELLOW)Removing unused containers, networks and images...$(RESET)"
			@docker system prune -a --force
			@echo "$(YELLOW)Cleanup completed!$(RESET)"

fclean:		clean
			@echo "$(YELLOW)Removing all volumes...$(RESET)"
			@docker volume prune --force
			@sudo rm -rf $(VOLUMES_DIR)
			@echo "$(YELLOW)Volumes removed successfully!$(RESET)"

setup:
			@echo "$(BLUE)Setting up development environment...$(RESET)"
			@mkdir -p $(VOLUMES_DIR)/wordpress
			@mkdir -p $(VOLUMES_DIR)/mariadb
			@echo "$(GREEN)Volume directories created!$(RESET)"
			@echo "$(YELLOW)Configuring /etc/hosts...$(RESET)"
			@if ! grep -q "$(USER).42.fr" /etc/hosts; then \
				echo "127.0.0.1 $(USER).42.fr" | sudo tee -a /etc/hosts > /dev/null; \
				echo "$(GREEN)Domain $(USER).42.fr added to /etc/hosts$(RESET)"; \
			else \
				echo "$(YELLOW)Domain $(USER).42.fr already configured in /etc/hosts$(RESET)"; \
			fi

ascii:
			@echo
			@echo
			@echo "             $(CYAN)_____                      _   _             $(RESET)"
			@echo "            $(CYAN)|_   _|                    | | (_)            $(RESET)"
			@echo "              $(CYAN)| |  _ __   ___ ___ _ __ | |_ _  ___  _ __  $(RESET)"
			@echo "              $(CYAN)| | | '_ \\ / __/ _ \\ '_ \\| __| |/ _ \\| '_ \\ $(RESET)"
			@echo "             $(CYAN)_| |_| | | | (_|  __/ |_) | |_| | (_) | | | |$(RESET)"
			@echo "            $(CYAN)|_____|_| |_|\\___\\___| .__/ \\__|_|\\___/|_| |_|$(RESET)"
			@echo "                                $(CYAN)| |                      $(RESET)"
			@echo "                                $(CYAN)|_|                      $(RESET)"
			@echo
			@echo "$(MAGENTA)Starting Inception project...$(RESET)"
			@sleep 1

help:
			@echo "$(CYAN)Available commands:$(RESET)"
			@echo "  $(GREEN)make$(RESET)         - Start all containers"
			@echo "  $(GREEN)make up$(RESET)      - Build and start all containers"
			@echo "  $(GREEN)make down$(RESET)    - Stop and remove all containers"
			@echo "  $(GREEN)make stop$(RESET)    - Stop all containers"
			@echo "  $(GREEN)make start$(RESET)   - Start stopped containers"
			@echo "  $(GREEN)make restart$(RESET) - Restart all containers"
			@echo "  $(GREEN)make status$(RESET)  - Show containers status"
			@echo "  $(GREEN)make volumes$(RESET) - List all Docker volumes"
			@echo "  $(GREEN)make networks$(RESET)- List all Docker networks"
			@echo "  $(GREEN)make clean$(RESET)   - Stop containers and clean unused resources"
			@echo "  $(GREEN)make fclean$(RESET)  - Clean all containers, images and volumes"
			@echo "  $(GREEN)make setup$(RESET)   - Set up environment for the project"
			@echo "  $(GREEN)make help$(RESET)    - Show this help"

re:			fclean all

.PHONY:		all up down stop start restart status volumes networks clean fclean setup ascii help re