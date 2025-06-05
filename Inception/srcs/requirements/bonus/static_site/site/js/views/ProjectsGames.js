/**
 * Game Projects page content creator for Pixi.js
 * Creates game development project cards
 */
export default function projectsGames(container, app) 
{
    // Enable sorting for proper z-index behavior
    container.sortableChildren = true;
    
    // Store references for resize handling
    container.app = app;
    
    // Title - positioned like contact page
    const title = new PIXI.Text("Game Development Projects", 
    {
        fontFamily: "Honk, Arial, sans-serif",
        fontSize: Math.min(40, app.screen.width * 0.06),
        fill: 0xffcc33
    });
    title.anchor.set(0.5, 0);
    title.position.set(app.screen.width / 2, 150);
    title.name = 'gameTitle';
    container.addChild(title);
    
    // Description
    const description = new PIXI.Text(
        "Game development projects and interactive experiences:",
        {
            fontFamily: "Arial, sans-serif",
            fontSize: Math.min(18, app.screen.width * 0.025),
            fill: 0xffffff
        }
    );
    description.anchor.set(0.5, 0);
    description.position.set(app.screen.width / 2, 200);
    description.name = 'gameDescription';
    container.addChild(description);
    
    // Game projects data
    const gameProjects = [
        {
            title: "So_long (42 Project)",
            description: "2D adventure game built with MiniLibX graphics library in C",
            status: "Completed",
            tech: "C, MiniLibX, 2D Graphics",
            color: 0x9C27B0
        },
        {
            title: "This Portfolio Website",
            description: "Interactive portfolio with Pixi.js game elements and animations",
            status: "In Progress",
            tech: "Pixi.js, JavaScript, WebGL",
            color: 0x61DAFB
        },
        {
            title: "cub3d (42 Project)",
            description: "Raycasting engine creating 3D-like environment from 2D map",
            status: "Completed",
            tech: "C, Raycasting, MiniLibX, 3D Graphics",
            color: 0x4CAF50
        },
        {
            title: "Doom Nuked",
            description: "Classic DOOM-style game engine with modern enhancements",
            status: "Coming Soon",
            tech: "C++, OpenGL, Game Engine",
            color: 0xFF9800
        }
    ];
    
    // Store references for resize
    const elements = 
    {
        title,
        description,
        gameProjects,
        cards: []
    };
    
    // Create initial cards
    createCards();
    
    function createCards() 
    {
        // Clear existing cards
        elements.cards.forEach(card => 
        {
            if (card.parent) 
            {
                card.parent.removeChild(card);
            }
        });
        elements.cards = [];
        
        // Calculate responsive dimensions
        const dimensions = calculateCardDimensions();
        
        gameProjects.forEach((project, index) => 
        {
            const row = Math.floor(index / dimensions.cardsPerRow);
            const col = index % dimensions.cardsPerRow;
            
            const cardX = dimensions.startX + col * (dimensions.cardWidth + dimensions.cardSpacing);
            const cardY = dimensions.startY + row * (dimensions.cardHeight + dimensions.cardSpacing);
            
            const card = createGameProjectCard(container, project, cardX, cardY, dimensions.cardWidth, dimensions.cardHeight, dimensions);
            elements.cards.push(card);
        });
    }
    
    function calculateCardDimensions() 
    {
        // Base dimensions
        const baseWidth = 1920;
        const baseCardWidth = 350; 
        const baseCardHeight = 200;
        
        // Calculate scale factor with adjusted min/max limits
        let scaleFactor = app.screen.width / baseWidth;
        scaleFactor = Math.max(0.75, Math.min(1.3, scaleFactor));
        
        // Calculate responsive dimensions
        const cardWidth = Math.floor(baseCardWidth * scaleFactor);
        const cardHeight = Math.floor(baseCardHeight * scaleFactor);
        const cardSpacing = Math.floor(30 * scaleFactor);
        
        // Calculate status badge dimensions
        const statusBadgeWidth = Math.floor(120 * scaleFactor);
        const statusBadgeHeight = Math.floor(30 * scaleFactor);
        
        // Determine cards per row based on screen width
        let cardsPerRow = 2;
        if (app.screen.width < 900) 
        {
            cardsPerRow = 1; // Mobile: 1 card per row
        } 
        else 
        {
            cardsPerRow = 2; // Tablet/Desktop: 2 cards per row
        }
        
        // Calculate starting positions
        const totalWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * cardSpacing;
        const startX = (app.screen.width - totalWidth) / 2;
        const startY = 280;
        
        return {
            cardWidth,
            cardHeight,
            cardSpacing,
            cardsPerRow,
            startX,
            startY,
            scaleFactor,
            statusBadgeWidth,
            statusBadgeHeight,
            fontSizes: 
            {
                title: Math.floor(24 * scaleFactor),
                description: Math.floor(16 * scaleFactor),
                techLabel: Math.floor(14 * scaleFactor),
                techText: Math.floor(13 * scaleFactor),
                status: Math.floor(14 * scaleFactor)
            }
        };
    }
    
    const resizeElements = () => 
    {
        // Check if elements still exist
        if (!elements.title || !elements.description) 
        {
            return;
        }
        
        // Calculate new dimensions
        const dimensions = calculateCardDimensions();
        
        // Update title position and size
        elements.title.position.set(app.screen.width / 2, 150);
        elements.title.style.fontSize = Math.min(40, app.screen.width * 0.06);
        
        // Update description position and size
        elements.description.position.set(app.screen.width / 2, 200);
        elements.description.style.fontSize = Math.min(18, app.screen.width * 0.025);
        
        elements.description._autoResolution = true;
        
        setTimeout(() => 
        {
            // Recreate cards with new dimensions
            createCards();
        }, 10);
    };
    
    // Resize listener
    window.addEventListener('resize', resizeElements);
    
    // Theme change observer
    const observer = new MutationObserver((mutations) => 
    {
        mutations.forEach((mutation) => 
        {
            if (mutation.attributeName === 'data-theme') 
            {
                // Theme changed
            }
        });
    });
    observer.observe(document.body, { attributes: true });

    container.cleanup = () => 
    {
        window.removeEventListener('resize', resizeElements);
        observer.disconnect();
    };
    
    return true;
}

/*
 * Create a game project card with hover expansion
 */
function createGameProjectCard(container, project, x, y, width, height, dimensions) 
{
    const cardContainer = new PIXI.Container();
    cardContainer.position.set(x, y);
    cardContainer.sortableChildren = true;
    
    cardContainer.interactive = false;
    
    // Card background
    const cardBg = new PIXI.Graphics();
    cardBg.beginFill(0x1e3a5f, 0.4);
    cardBg.lineStyle(3, project.color, 0.8);
    cardBg.drawRoundedRect(0, 0, width, height, 15);
    cardBg.endFill();
    cardBg.zIndex = 0;
    
    // Add subtle inner border
    const innerBorder = new PIXI.Graphics();
    innerBorder.lineStyle(1, project.color, 0.3);
    innerBorder.drawRoundedRect(3, 3, width - 6, height - 6, 12);
    innerBorder.zIndex = 1;
    
    // Card title with game-style font
    const cardTitle = new PIXI.Text(project.title, 
    {
        fontFamily: "Honk, Arial, sans-serif",
        fontSize: dimensions.fontSizes.title,
        fill: project.color,
        fontWeight: "bold"
    });
    cardTitle.anchor.set(0.5, 0);
    cardTitle.position.set(width / 2, 15);
    cardTitle.zIndex = 2;
    
    // Card description
    const cardDesc = new PIXI.Text(project.description, 
    {
        fontFamily: "Arial, sans-serif",
        fontSize: dimensions.fontSizes.description,
        fill: 0xe0e0e0,
        wordWrap: true,
        wordWrapWidth: width - 30,
        lineHeight: 18
    });
    cardDesc.position.set(15, 55);
    cardDesc.zIndex = 2;
    
    // Technology stack
    const techLabel = new PIXI.Text("Tech Stack:", 
    {
        fontFamily: "Arial, sans-serif",
        fontSize: dimensions.fontSizes.techLabel,
        fill: 0xaaaaaa,
        fontWeight: "bold"
    });
    techLabel.position.set(15, height - 55);
    techLabel.zIndex = 2;
    
    const techText = new PIXI.Text(project.tech, 
    {
        fontFamily: "Arial, sans-serif",
        fontSize: dimensions.fontSizes.techText,
        fill: 0xcccccc,
        wordWrap: true,
        wordWrapWidth: width - 30
    });
    techText.position.set(15, height - 35);
    techText.zIndex = 2;
    
    // Status badge
    const statusColor = getStatusColor(project.status);
    const statusBg = new PIXI.Graphics();
    statusBg.beginFill(statusColor, 0.9);
    statusBg.lineStyle(1, statusColor, 1);
    statusBg.drawRoundedRect(0, 0, dimensions.statusBadgeWidth, dimensions.statusBadgeHeight, 12);
    statusBg.endFill();
    statusBg.position.set(width - dimensions.statusBadgeWidth - 20, height - dimensions.statusBadgeHeight - 20);
    statusBg.zIndex = 2;
    
    const statusText = new PIXI.Text(project.status, 
    {
        fontFamily: "Arial, sans-serif",
        fontSize: dimensions.fontSizes.status,
        fill: 0xffffff,
        fontWeight: "bold"
    });
    statusText.anchor.set(0.5, 0.5);
    statusText.position.set(
        width - dimensions.statusBadgeWidth/2 - 20, 
        height - dimensions.statusBadgeHeight/2 - 20
    );
    statusText.zIndex = 3;
    
    // Add basic elements
    cardContainer.addChild(cardBg);
    cardContainer.addChild(innerBorder);
    cardContainer.addChild(cardTitle);
    cardContainer.addChild(cardDesc);
    cardContainer.addChild(techLabel);
    cardContainer.addChild(techText);
    cardContainer.addChild(statusBg);
    cardContainer.addChild(statusText);
    
    cardContainer.sortChildren();
    container.addChild(cardContainer);
    
    // Ensure parent containers are sortable
    if (!container.sortableChildren) 
    {
        container.sortableChildren = true;
    }
    if (container.parent && !container.parent.sortableChildren) 
    {
        container.parent.sortableChildren = true;
    }
    
    return cardContainer;
}

/*
 * Get status color based on project status
 */
function getStatusColor(status) 
{
    switch (status) 
    {
        case "Completed":
            return 0x4CAF50; // Green
        case "In Progress":
            return 0xFF9800; // Orange
        case "Coming Soon":
            return 0x2196F3; // Blue
        default:
            return 0x757575; // Gray
    }
}