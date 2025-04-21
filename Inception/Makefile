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
USER_PATH	= /home/$(shell echo $$USER)/data
VOLUMES_DIR	= $(USER_PATH)

#==============================================================================#
#                                   RULES                                       #
#==============================================================================#
all:		ascii setup up

setup:		data
			@echo "$(BLUE)Setting up development environment...$(RESET)"
			@if ! grep -q "DATA_PATH=" ./srcs/.env; then \
				echo "DATA_PATH=$(USER_PATH)" >> ./srcs/.env; \
			fi
			@echo "$(YELLOW)Configuring /etc/hosts...$(RESET)"
			@if ! grep -q "$(USER).42.fr" /etc/hosts; then \
				echo "127.0.0.1 $(USER).42.fr" | sudo tee -a /etc/hosts > /dev/null; \
				echo "$(GREEN)Domain $(USER).42.fr added to /etc/hosts$(RESET)"; \
			else \
				echo "$(YELLOW)Domain $(USER).42.fr already configured in /etc/hosts$(RESET)"; \
			fi

data:
			@echo "$(BLUE)Creating data directories...$(RESET)"
			@mkdir -p $(USER_PATH)/wordpress
			@mkdir -p $(USER_PATH)/mariadb
			@mkdir -p $(USER_PATH)/portainer
			@mkdir -p $(USER_PATH)/redis
			@mkdir -p $(USER_PATH)/adminer
			@echo "$(GREEN)Volume directories created!$(RESET)"

up:
			@echo "$(GREEN)Building and starting containers...$(RESET)"
			@docker compose -f ./srcs/docker-compose.yml --env-file ./srcs/.env up -d --build
			@echo "$(GREEN)All containers are running!$(RESET)"

uplog:
			@echo "$(GREEN)Building and starting containers with logs...$(RESET)"
			@docker compose -f ./srcs/docker-compose.yml --env-file ./srcs/.env up --build
			@echo "$(GREEN)All containers are running!$(RESET)"

down:
			@echo "$(YELLOW)Shutting down containers...$(RESET)"
			@docker compose -f ./srcs/docker-compose.yml down
			@echo "$(YELLOW)Containers shut down successfully!$(RESET)"

stop:
			@echo "$(YELLOW)Stopping containers...$(RESET)"
			@docker compose -f ./srcs/docker-compose.yml stop
			@echo "$(YELLOW)Containers stopped successfully!$(RESET)"

start:
			@echo "$(GREEN)Starting existing containers...$(RESET)"
			@docker compose -f ./srcs/docker-compose.yml start
			@echo "$(GREEN)Containers started successfully!$(RESET)"

restart:
			@echo "$(YELLOW)Restarting containers...$(RESET)"
			@docker compose -f ./srcs/docker-compose.yml restart
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

fcleanimsure:
			@echo "$(RED)DANGER: Removing all Docker resources...$(RESET)"
			@docker stop $$(docker ps -qa) 2>/dev/null || true
			@docker rm $$(docker ps -qa) 2>/dev/null || true
			@docker rmi -f $$(docker images -qa) 2>/dev/null || true
			@docker volume rm $$(docker volume ls -q) 2>/dev/null || true
			@docker network rm $$(docker network ls -q) 2>/dev/null || true
			@echo "$(RED)All Docker resources removed!$(RESET)"

# Container access shortcuts
mariadb:
			@echo "$(BLUE)Accessing MariaDB container...$(RESET)"
			@docker exec -it mariadb sh

redis:
			@echo "$(BLUE)Accessing Redis CLI...$(RESET)"
			@docker exec -it redis redis-cli

wordpress:
			@echo "$(BLUE)Accessing WordPress container...$(RESET)"
			@docker exec -it wordpress sh

nginx:
			@echo "$(BLUE)Accessing Nginx container...$(RESET)"
			@docker exec -it nginx sh

# Output generation
out:
			@touch outfile
			@rm outfile
			@find . -type f ! -name "outfile" ! -name "*.xz" | while read file; do \
				echo "### Starting file: $$file" >> outfile; \
				echo "" >> outfile; \
				cat "$$file" >> outfile; \
				echo "\n" >> outfile; \
			done
			@echo "$(GREEN)Output file generated!$(RESET)"

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
			@echo "  $(GREEN)make$(RESET)              - Set up and start all containers"
			@echo "  $(GREEN)make setup$(RESET)        - Set up environment for the project"
			@echo "  $(GREEN)make up$(RESET)           - Build and start all containers"
			@echo "  $(GREEN)make uplog$(RESET)        - Build and start containers with logs"
			@echo "  $(GREEN)make down$(RESET)         - Stop and remove all containers"
			@echo "  $(GREEN)make stop$(RESET)         - Stop all containers"
			@echo "  $(GREEN)make start$(RESET)        - Start stopped containers"
			@echo "  $(GREEN)make restart$(RESET)      - Restart all containers"
			@echo "  $(GREEN)make status$(RESET)       - Show containers status"
			@echo "  $(GREEN)make volumes$(RESET)      - List all Docker volumes"
			@echo "  $(GREEN)make networks$(RESET)     - List all Docker networks"
			@echo "  $(GREEN)make clean$(RESET)        - Stop containers and clean unused resources"
			@echo "  $(GREEN)make fclean$(RESET)       - Clean all containers, images and volumes"
			@echo "  $(GREEN)make fcleanimsure$(RESET) - Remove ALL Docker resources (use with caution)"
			@echo "  $(GREEN)make mariadb$(RESET)      - Access MariaDB container"
			@echo "  $(GREEN)make redis$(RESET)        - Access Redis CLI"
			@echo "  $(GREEN)make wordpress$(RESET)    - Access WordPress container"
			@echo "  $(GREEN)make nginx$(RESET)        - Access Nginx container"
			@echo "  $(GREEN)make out$(RESET)          - Generate output file with all files content"
			@echo "  $(GREEN)make help$(RESET)         - Show this help"

re:			fclean all

.PHONY:		all up uplog down stop start restart status volumes networks clean fclean setup fcleanimsure mariadb redis wordpress nginx ascii help re out data