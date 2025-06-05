/**
 * 42 School Projects page with compact hover cards
 * Simple layout without complex responsive calculations
 */
export default function projects42(container, app) 
{
    // Enable sorting for proper z-index behavior
    container.sortableChildren = true;
    
    const getScreenSize = () => {
        const width = app.screen.width;
        if (width <= 768) 
        {
            return 'mobile';
        }
        return 'desktop';
    };
    
    const screenSize = getScreenSize();
    
    // FONT SIZES CONFIG
    const FONT_SIZES = {
        mainTitle: {
            desktop: 36,
            mobile: Math.min(36, app.screen.width * 0.05)
        },
        description: {
            desktop: 16,
            mobile: Math.min(16, app.screen.width * 0.022)
        },
        categoryTitle: {
            desktop: 28,
            mobile: Math.min(28, app.screen.width * 0.04)
        },
        cardTitle: {
            desktop: 20,
            mobile: 14
        },
        cardDescription: {
            desktop: 10,
            mobile: 10
        },
        cardSkills: {
            desktop: 9,
            mobile: 9
        },
        cardGrade: {
            desktop: 10,
            mobile: 10
        },
        statusIcon: {
            desktop: 9,
            mobile: 9
        }
    };
    
    // FONT FAMILIES CONFIG
    const FONTS = {
        heading: "Honk, Arial, sans-serif", // With Linux fallback
        body: "Arial, sans-serif"
    };
    
    // LAYOUT CONFIG
    const LAYOUT = {
        cardWidth: {
            desktop: 200,
            mobile: 160
        },
        cardHeight: {
            desktop: 90,
            mobile: 70
        },
        spacing: {
            desktop: 15,
            mobile: 12
        },
        titleSpacing: {
            desktop: 40,
            mobile: 30
        },
        categorySpacing: {
            desktop: 20,
            mobile: 15
        }
    };
    
    // Get initial theme
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    
    // Define colors based on theme
    const getColors = (theme) => 
    {
        return {
            title: theme === 'dark' ? 0xffcc33 : 0xcc0000,
            categoryTitle: theme === 'dark' ? 0xffcc33 : 0xcc0000,
            cardBg: theme === 'dark' ? 0x2a2a2a : 0x1e3a5f,
            cardBgAlpha: 0.4,
            cardBorderAlpha: 0.6,
            completedColor: 0x4CAF50,
            whiteText: 0xffffff,
            grayText: 0xcccccc
        };
    };
    
    let colors = getColors(currentTheme);
    
    // Use responsive layout constants
    const CARD_WIDTH = LAYOUT.cardWidth[screenSize];
    const CARD_HEIGHT = LAYOUT.cardHeight[screenSize];
    const SPACING = LAYOUT.spacing[screenSize];
    
    // Project data organized by categories
    const projectCategories = [
        {
            title: "📚 Foundation Projects",
            color: 0x4CAF50,
            projects: [
                {
                    name: "Libft",
                    description: "Custom C library implementation with essential functions",
                    skills: ["C", "Library Creation", "Memory Management"],
                    status: "Completed",
                    grade: "125/100"
                },
                {
                    name: "Born2beRoot", 
                    description: "System administration project with VirtualBox",
                    skills: ["System Admin", "Virtualization", "Security"],
                    status: "Completed",
                    grade: "125/100"
                },
                {
                    name: "ft_printf",
                    description: "Recoded printf function with various conversions",
                    skills: ["C", "Variadic Functions", "String Formatting"],
                    status: "Completed", 
                    grade: "125/100"
                },
                {
                    name: "get_next_line",
                    description: "Function that reads a line from file descriptor",
                    skills: ["C", "File I/O", "Static Variables"],
                    status: "Completed",
                    grade: "125/100"
                }
            ]
        },
        {
            title: "🔄 Algorithmic Projects",
            color: 0x2196F3,
            projects: [
                {
                    name: "push_swap",
                    description: "Sorting algorithm optimization project",
                    skills: ["C", "Algorithm Design", "Data Structures"],
                    status: "Completed",
                    grade: "125/100"
                },
                {
                    name: "pipex",
                    description: "Recreated shell pipe functionality",
                    skills: ["C", "Process Creation", "IPC"],
                    status: "Completed",
                    grade: "125/100"
                },
                {
                    name: "so_long",
                    description: "2D game project using MiniLibX",
                    skills: ["C", "Graphics", "Game Development"],
                    status: "Completed",
                    grade: "125/100"
                },
                {
                    name: "NetPractice",
                    description: "IP addressing and network configuration",
                    skills: ["Networking", "IP Addressing", "Subnetting"],
                    status: "Completed",
                    grade: "100/100"
                }
            ]
        },
        {
            title: "👥 Team Projects",
            color: 0x9C27B0,
            projects: [
                {
                    name: "minishell",
                    description: "Simple shell implementation in C (group project)",
                    skills: ["C", "Parsing", "Process Management"],
                    status: "Completed",
                    grade: "125/100"
                },
                {
                    name: "cub3d",
                    description: "Raycasting engine for 3D-like environment",
                    skills: ["C", "Graphics", "Mathematics"],
                    status: "Completed",
                    grade: "125/100"
                },
                {
                    name: "ft_irc",
                    description: "IRC server compliant with RFC standards",
                    skills: ["C++", "Network Programming", "Protocols"],
                    status: "Coming Soon",
                    grade: "In Progress"
                },
                {
                    name: "ft_transcendence",
                    description: "Full-stack web app with multiplayer Pong",
                    skills: ["TypeScript", "NestJS", "PostgreSQL"],
                    status: "Coming Soon",
                    grade: "In Progress"
                }
            ]
        },
        {
            title: "🧠 Advanced Concepts",
            color: 0xFF9800,
            projects: [
                {
                    name: "Philosophers",
                    description: "Dining philosophers problem with threads",
                    skills: ["C", "Multi-threading", "Mutexes"],
                    status: "Completed",
                    grade: "125/100"
                },
                {
                    name: "Inception",
                    description: "Docker infrastructure with containers",
                    skills: ["Docker", "Docker-Compose", "System Admin"],
                    status: "Coming Soon",
                    grade: "In Progress"
                },
                {
                    name: "CPP Modules",
                    description: "Object-Oriented Programming in C++",
                    skills: ["C++", "OOP", "Templates", "STL"],
                    status: "Completed",
                    grade: "100/100"
                }
            ]
        }
    ];
    
    // Store all elements for theme updates and resize
    const elements = {
        titles: [],
        cardContainers: []
    };
    
    // Main title
    const mainTitle = new PIXI.Text("42 School Projects", {
        fontFamily: FONTS.heading,
        fontSize: FONT_SIZES.mainTitle[screenSize],
        fill: colors.title
    });
    mainTitle.anchor.set(0.5, 0);
    mainTitle.position.set(app.screen.width / 2, 80);
    container.addChild(mainTitle);
    elements.titles.push(mainTitle);
    
    // Description
    const description = new PIXI.Text(
        "Here are some of the projects I've completed during my studies at 42 School:",
        {
            fontFamily: FONTS.body,
            fontSize: FONT_SIZES.description[screenSize],
            fill: colors.whiteText, // FIXED: Back to white
            wordWrap: true,
            wordWrapWidth: app.screen.width - 100,
            align: 'center'
        }
    );
    description.anchor.set(0.5, 0);
    description.position.set(app.screen.width / 2, 120);
    container.addChild(description);
    elements.titles.push(description);
    
    let currentY = 160; // Reduced starting position
    
    // Create categories and cards
    projectCategories.forEach((category, categoryIndex) => {
        // Category title
        const categoryTitle = new PIXI.Text(category.title, {
            fontFamily: FONTS.heading,
            fontSize: FONT_SIZES.categoryTitle[screenSize],
            fill: colors.categoryTitle
        });
        categoryTitle.anchor.set(0.5, 0);
        categoryTitle.position.set(app.screen.width / 2, currentY);
        container.addChild(categoryTitle);
        elements.titles.push(categoryTitle);
        
        currentY += LAYOUT.titleSpacing[screenSize];
        
        // Create cards for this category
        const cardsContainer = createCategoryCards(container, category, currentY);
        elements.cardContainers.push(cardsContainer);
        
        // Calculate next Y position - simple math
        const cardsPerRow = Math.floor((app.screen.width - 100) / (CARD_WIDTH + SPACING));
        const rows = Math.ceil(category.projects.length / cardsPerRow);
        currentY += rows * (CARD_HEIGHT + SPACING) + LAYOUT.categorySpacing[screenSize];
    });
    
    /**
     * Create cards for a category - responsive approach
     */
    function createCategoryCards(container, category, startY) {
        const cardsContainer = new PIXI.Container();
        cardsContainer.name = `category-${category.title}`;
        cardsContainer.sortableChildren = true;
        container.addChild(cardsContainer);
        
        // Use current screen size for responsive layout
        const currentScreenSize = getScreenSize();
        const cardWidth = LAYOUT.cardWidth[currentScreenSize];
        const cardHeight = LAYOUT.cardHeight[currentScreenSize];
        const spacing = LAYOUT.spacing[currentScreenSize];
        
        // Simple calculation - how many cards fit per row
        const availableWidth = app.screen.width - 100; // 50px margin each side
        const cardsPerRow = Math.floor(availableWidth / (cardWidth + spacing));
        
        category.projects.forEach((project, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            
            // Center the entire row
            const actualCardsInThisRow = Math.min(cardsPerRow, category.projects.length - row * cardsPerRow);
            const rowWidth = actualCardsInThisRow * cardWidth + (actualCardsInThisRow - 1) * spacing;
            const startX = (app.screen.width - rowWidth) / 2;
            
            const cardX = startX + col * (cardWidth + spacing);
            const cardY = startY + row * (cardHeight + spacing);
            
            createProjectCard(cardsContainer, project, cardX, cardY, category.color);
        });
        
        return cardsContainer;
    }
    
    /**
     * Create individual project card
     */
    function createProjectCard(container, project, x, y, categoryColor) {
        // Use current responsive sizes
        const currentScreenSize = getScreenSize();
        const cardWidth = LAYOUT.cardWidth[currentScreenSize];
        const cardHeight = LAYOUT.cardHeight[currentScreenSize];
        
        const cardContainer = new PIXI.Container();
        cardContainer.position.set(x, y);
        cardContainer.sortableChildren = true;
        
        cardContainer.interactive = true;
        cardContainer.cursor = 'pointer';
        cardContainer.buttonMode = true;
        
        // Card background
        const cardBg = new PIXI.Graphics();
        cardBg.beginFill(colors.cardBg, colors.cardBgAlpha);
        cardBg.lineStyle(2, categoryColor, colors.cardBorderAlpha);
        cardBg.drawRoundedRect(0, 0, cardWidth, cardHeight, 8);
        cardBg.endFill();
        cardBg.zIndex = 0;
        
        // Project name
        const projectName = new PIXI.Text(project.name, {
            fontFamily: FONTS.heading,
            fontSize: FONT_SIZES.cardTitle[currentScreenSize],
            fill: categoryColor,
            fontWeight: "bold"
        });
        projectName.anchor.set(0.5, 0.5);
        projectName.position.set(cardWidth / 2, cardHeight / 2 - 8);
        projectName.zIndex = 1;
        
        // Status badge (always visible)
        const statusColor = project.status === "Completed" ? colors.completedColor : 0x757575;
        const statusBg = new PIXI.Graphics();
        statusBg.beginFill(statusColor, 0.8);
        statusBg.drawRoundedRect(5, cardHeight - 22, 30, 15, 6);
        statusBg.endFill();
        statusBg.zIndex = 1;
        
        const statusText = new PIXI.Text(project.status === "Completed" ? "✓" : "⏳", {
            fontFamily: FONTS.body,
            fontSize: FONT_SIZES.statusIcon[currentScreenSize],
            fill: 0xffffff,
            fontWeight: "bold"
        });
        statusText.anchor.set(0.5, 0.5);
        statusText.position.set(20, cardHeight - 14.5);
        statusText.zIndex = 2;
        
        // Add basic elements
        cardContainer.addChild(cardBg);
        cardContainer.addChild(projectName);
        cardContainer.addChild(statusBg);
        cardContainer.addChild(statusText);
        
        // Hover expansion background (initially hidden)
        const hoverBg = new PIXI.Graphics();
        hoverBg.beginFill(colors.cardBg, colors.cardBgAlpha * 1.3);
        hoverBg.lineStyle(3, categoryColor, 1);
        hoverBg.drawRoundedRect(-8, -8, cardWidth + 16, cardHeight + 90, 12);
        hoverBg.endFill();
        hoverBg.alpha = 0;
        hoverBg.zIndex = -1;
        cardContainer.addChild(hoverBg);
        
        // Description
        const description = new PIXI.Text(project.description, {
            fontFamily: FONTS.body,
            fontSize: FONT_SIZES.cardDescription[screenSize],
            fill: colors.grayText,
            wordWrap: true,
            wordWrapWidth: cardWidth - 8,
            lineHeight: 12
        });
        description.position.set(4, cardHeight + 2);
        description.alpha = 0;
        description.zIndex = 3;
        cardContainer.addChild(description);
        
        // Skills
        const skillsText = new PIXI.Text(`Skills: ${project.skills.join(', ')}`, {
            fontFamily: FONTS.body,
            fontSize: FONT_SIZES.cardSkills[screenSize],
            fill: colors.whiteText,
            wordWrap: true,
            wordWrapWidth: cardWidth - 8
        });
        skillsText.position.set(4, cardHeight + 30);
        skillsText.alpha = 0;
        skillsText.zIndex = 3;
        cardContainer.addChild(skillsText);
        
        // Grade
        let gradeElement = null;
        if (project.grade !== "In Progress") 
        {
            gradeElement = new PIXI.Text(`Grade: ${project.grade}`, {
                fontFamily: FONTS.body,
                fontSize: FONT_SIZES.cardGrade[screenSize],
                fill: colors.completedColor,
                fontWeight: "bold"
            });
            gradeElement.position.set(4, cardHeight + 50);
            gradeElement.alpha = 0;
            gradeElement.zIndex = 3;
            cardContainer.addChild(gradeElement);
        }
        
        // Store hover elements
        const hoverElements = [description, skillsText];
        if (gradeElement) 
        {
            hoverElements.push(gradeElement);
        }
        
        let isHovered = false;
        
        cardContainer.on('pointerover', () => {
            if (isHovered)
            {
                return;
            }
            isHovered = true;
            
            hoverBg.alpha = 1;
            hoverElements.forEach(element => element.alpha = 1);
            cardContainer.zIndex = 1000;
            container.sortChildren();
        });
        
        cardContainer.on('pointerout', () => {
            if (!isHovered)
            {
                return;
            }
            isHovered = false;
            
            hoverBg.alpha = 0;
            hoverElements.forEach(element => element.alpha = 0);
            cardContainer.zIndex = 0;
        });
        
        // Mobile/Touch support
        cardContainer.on('pointertap', (event) => {
            event.stopPropagation();
            if (isHovered) 
            {
                // Hide
                isHovered = false;
                hoverBg.alpha = 0;
                hoverElements.forEach(element => element.alpha = 0);
                cardContainer.zIndex = 0;
            } 
            else 
            {
                // Show
                isHovered = true;
                hoverBg.alpha = 1;
                hoverElements.forEach(element => element.alpha = 1);
                cardContainer.zIndex = 1000;
                container.sortChildren();
                
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    if (isHovered) 
                    {
                        isHovered = false;
                        hoverBg.alpha = 0;
                        hoverElements.forEach(element => element.alpha = 0);
                        cardContainer.zIndex = 0;
                    }
                }, 3000);
            }
        });
        
        cardContainer.sortChildren();
        container.addChild(cardContainer);
    }
    
    /**
     * Simple resize handler
     */
    const resizeElements = () => {
        const currentScreenSize = getScreenSize();
        
        // Update main title
        elements.titles[0].position.set(app.screen.width / 2, 80);
        elements.titles[0].style.fontSize = FONT_SIZES.mainTitle[currentScreenSize];
        
        // Update description
        elements.titles[1].position.set(app.screen.width / 2, 120);
        elements.titles[1].style.fontSize = FONT_SIZES.description[currentScreenSize];
        elements.titles[1].style.wordWrapWidth = app.screen.width - 100;
        
        // Recreate cards with new layout
        setTimeout(() => {
            recreateCards();
        }, 10);
    };
    
    /**
     * Recreate cards - simple approach
     */
    function recreateCards() {
        // Remove existing card containers
        elements.cardContainers.forEach(cardContainer => {
            if (cardContainer.parent) 
            {
                cardContainer.parent.removeChild(cardContainer);
            }
        });
        
        elements.cardContainers = [];
        
        // Remove existing category titles
        for (let i = elements.titles.length - 1; i >= 2; i--) {
            if (elements.titles[i].parent) 
            {
                elements.titles[i].parent.removeChild(elements.titles[i]);
            }
            elements.titles.splice(i, 1);
        }
        
        // Recreate everything
        let currentY = 160;
        const currentScreenSize = getScreenSize();
        
        projectCategories.forEach((category) => {
            // Category title
            const categoryTitle = new PIXI.Text(category.title, {
                fontFamily: FONTS.heading,
                fontSize: FONT_SIZES.categoryTitle[currentScreenSize],
                fill: colors.categoryTitle
            });
            categoryTitle.anchor.set(0.5, 0);
            categoryTitle.position.set(app.screen.width / 2, currentY);
            container.addChild(categoryTitle);
            elements.titles.push(categoryTitle);
            
            currentY += LAYOUT.titleSpacing[currentScreenSize];
            
            // Create cards
            const cardsContainer = createCategoryCards(container, category, currentY);
            elements.cardContainers.push(cardsContainer);
            
            const cardsPerRow = Math.floor((app.screen.width - 100) / (LAYOUT.cardWidth[currentScreenSize] + LAYOUT.spacing[currentScreenSize]));
            const rows = Math.ceil(category.projects.length / cardsPerRow);
            currentY += rows * (LAYOUT.cardHeight[currentScreenSize] + LAYOUT.spacing[currentScreenSize]) + LAYOUT.categorySpacing[currentScreenSize];
        });
    }
    
    /**
     * Theme update handler - FIXED COLOR ISSUE
     */
    const updateTheme = () => {
        const newTheme = document.body.getAttribute('data-theme') || 'light';
        colors = getColors(newTheme);
        
        // Update title colors
        elements.titles.forEach((title, index) => {
            if (title.style) {
                if (index === 1) 
                {
                    title.style.fill = colors.whiteText;
                } 
                else 
                {
                    title.style.fill = colors.title;
                }
            }
        });
        
        // Recreate cards with new colors
        recreateCards();
    };
    
    // Event listeners
    window.addEventListener('resize', resizeElements);
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') 
            {
                updateTheme();
            }
        });
    });
    observer.observe(document.body, { attributes: true });
    
    // Cleanup
    container.cleanup = () => {
        window.removeEventListener('resize', resizeElements);
        observer.disconnect();
    };
    
    return true;
}