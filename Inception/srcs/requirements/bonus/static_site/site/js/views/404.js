/**
 * 404 page content creator for Pixi.js
 * Creates themed RPG 404 message following the same pattern as about.js
 */
export default function notFound404(container, app, assetManager) 
{
    // Font detection and fallback - check if Honk causes excessive width
    const getFontFamily = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Test Honk font with a sample text
        context.font = '32px Honk, serif';
        const testWidth = context.measureText('Test').width;
        
        // fallback
        if (testWidth > 200) 
        {
            return "Impact, serif";
        }
        
        return "Honk, serif";
    };
    
    const fontFamily = getFontFamily();
    
    // 404 Title 
    const errorTitle = new PIXI.Text("404 - Quest Not Found", {
        fontFamily: fontFamily,
        fontSize: 36,
        fill: 0xff3366,
        fontWeight: 'bold'
    });
    errorTitle.anchor.set(0.5, 0);
    errorTitle.position.set(app.screen.width / 2, 150);
    container.addChild(errorTitle);
    
    // Create animated player sprite
    createAnimatedPlayer(container, app, assetManager);
    
    // Error message section
    const messageTitle = new PIXI.Text("Status Report", {
        fontFamily: fontFamily,
        fontSize: 36,
        fill: 0xffcc33,
        fontWeight: 'bold'
    });
    messageTitle.anchor.set(0.5, 0);
    messageTitle.position.set(app.screen.width / 2, 320);
    container.addChild(messageTitle);
    
    // Message background
    const messageBg = new PIXI.Graphics();
    messageBg.beginFill(0x212529, 0.2);
    messageBg.drawRoundedRect(50, 370, app.screen.width - 100, 150, 10);
    messageBg.endFill();
    container.addChild(messageBg);
    
    // Error description text
    const errorText = new PIXI.Text(
        "Brave adventurer, you seem to have wandered into uncharted territory! The page you seek doesn't exist in this realm.\n\nBut fear not - your main quest awaits. Return to the known lands and continue your journey through the world of code and creation.",
        {
            fontFamily: "Arial, sans-serif",
            fontSize: 16,
            fill: 0xffffff,
            wordWrap: true,
            wordWrapWidth: app.screen.width - 120,
            lineHeight: 20
        }
    );
    errorText.position.set(70, 390);
    container.addChild(errorText);
    
    // Return button
    createReturnButton(container, app);
    
    // Add ambient particles
    createAmbientParticles(container, app);
    
    // Handle window resize
    const resizeHandler = () => 
    {
        // Reposition elements on resize
        errorTitle.position.set(app.screen.width / 2, 150);
        messageTitle.position.set(app.screen.width / 2, 320);
        
        // Update background width
        messageBg.clear();
        messageBg.beginFill(0x212529, 0.2);
        messageBg.drawRoundedRect(50, 370, app.screen.width - 100, 150, 10);
        messageBg.endFill();
        
        // Update text wrap width
        errorText.style.wordWrapWidth = app.screen.width - 120;
        
        // Update player position
        const playerContainer = container.getChildByName('playerContainer');
        if (playerContainer) 
        {
            playerContainer.position.set(app.screen.width / 2, 250);
        }
        
        // Update button position
        const buttonContainer = container.getChildByName('returnButton');
        if (buttonContainer) 
        {
            buttonContainer.position.set(app.screen.width / 2 - 140, 540);
        }
    };
    
    window.addEventListener('resize', resizeHandler);
    
    // Store resize handler for cleanup
    container.resizeHandler = resizeHandler;
    
    return true;
}

/*
 * Create animated player using attack animations only
 */
function createAnimatedPlayer(container, app, assetManager) 
{
    // Get the player spritesheet from the asset manager
    const playerSpritesheet = assetManager?.getSpritesheet('player_spritesheet');
    
    if (!playerSpritesheet || !playerSpritesheet.textures) 
    {
        console.error("Player spritesheet not found!");
        createSimplePlayerPlaceholder(container, app);
        return;
    }

    // Focus only on attack animations since those are working
    const attackAnimations = {
        attackFront: ['AtkFront-0', 'AtkFront-1', 'AtkFront-2', 'AtkFront-3', 'AtkFront-4', 'AtkFront-5'],
        attackLeft: ['AtkLeft-0', 'AtkLeft-1', 'AtkLeft-2', 'AtkLeft-3', 'AtkLeft-4', 'AtkLeft-5'],
        attackRight: ['AtkRight-0', 'AtkRight-1', 'AtkRight-2', 'AtkRight-3', 'AtkRight-4', 'AtkRight-5'],
        attackBack: ['AtkBack-0', 'AtkBack-1', 'AtkBack-2', 'AtkBack-3', 'AtkBack-4', 'AtkBack-5']
    };
    
    // Create player container positioned between the two titles
    const playerContainer = new PIXI.Container();
    playerContainer.name = 'playerContainer';
    playerContainer.position.set(app.screen.width / 2, 250);
    container.addChild(playerContainer);
    
    // Animation state management
    let currentAnimatedSprite = null;
    let currentDirection = 0; // 0: front, 1: left, 2: right, 3: back
    let animationTimer = 0;
    
    const directions = ['Front', 'Left', 'Right', 'Back'];
    const animationDuration = 120;
    
    /*
     * Create animated sprite for attack sequence
     */
    function createAttackSprite(animationKey)
    {
        const frameNames = attackAnimations[animationKey];
        if (!frameNames) 
        {
            return null;
        }
        
        // Get textures for this sequence
        const textures = [];
        for (const frameName of frameNames)
        {
            if (playerSpritesheet.textures[frameName])
            {
                textures.push(playerSpritesheet.textures[frameName]);
            }
        }
        
        if (textures.length === 0) 
        {
            return null;
        }
        
        const animatedSprite = new PIXI.AnimatedSprite(textures);
        animatedSprite.anchor.set(0.5, 0.5);
        animatedSprite.scale.set(2.5);
        animatedSprite.animationSpeed = 0.15;
        animatedSprite.loop = true;
        
        return animatedSprite;
    }
    
    /*
     * Switch to new attack animation
     */
    function switchAttackAnimation(dirIndex)
    {
        
        // Remove current sprite
        if (currentAnimatedSprite)
        {
            currentAnimatedSprite.stop();
            playerContainer.removeChild(currentAnimatedSprite);
            currentAnimatedSprite.destroy();
        }
        
        // Build attack animation key
        const animationKey = 'attack' + directions[dirIndex];
        
        
        // Create new animated sprite
        currentAnimatedSprite = createAttackSprite(animationKey);
        
        if (currentAnimatedSprite)
        {
            playerContainer.addChild(currentAnimatedSprite);
            currentAnimatedSprite.play();
        }
        else
        {
            console.error(`Failed to create attack animation for ${animationKey}`);
        }
    }
    
    // Start with attack front animation
    switchAttackAnimation(currentDirection);
    
    // Animation cycle ticker
    const animationTicker = () => 
    {
        animationTimer++;
        
        // Change direction after duration
        if (animationTimer >= animationDuration)
        {
            animationTimer = 0;
            currentDirection = (currentDirection + 1) % directions.length;
            switchAttackAnimation(currentDirection);
        }
        
        // Add subtle floating animation
        if (playerContainer)
        {
            const floatOffset = Math.sin(Date.now() * 0.001) * 3;
            playerContainer.y = 250 + floatOffset;
        }
    };
    
    app.ticker.add(animationTicker);
}

/*
 * Create simple player placeholder when spritesheet fails
 */
function createSimplePlayerPlaceholder(container, app) 
{
    const playerContainer = new PIXI.Container();
    playerContainer.name = 'playerContainer';
    
    // Body
    const body = new PIXI.Graphics();
    body.beginFill(0x4CAF50);
    body.drawRect(-16, -24, 32, 48);
    body.endFill();
    
    // Head
    const head = new PIXI.Graphics();
    head.beginFill(0xFFDBB5);
    head.drawCircle(0, -32, 12);
    head.endFill();
    
    // Eyes
    const eye1 = new PIXI.Graphics();
    eye1.beginFill(0x000000);
    eye1.drawCircle(-4, -34, 2);
    eye1.endFill();
    
    const eye2 = new PIXI.Graphics();
    eye2.beginFill(0x000000);
    eye2.drawCircle(4, -34, 2);
    eye2.endFill();
    
    playerContainer.addChild(body, head, eye1, eye2);
    playerContainer.position.set(app.screen.width / 2, 250);
    playerContainer.scale.set(2);
    
    // Add blinking animation
    let blinkTimer = 0;
    const tickerFunction = () => 
    {
        blinkTimer += 0.02;
        if (Math.sin(blinkTimer * 3) > 0.9) 
        {
            eye1.visible = false;
            eye2.visible = false;
        } 
        else 
        {
            eye1.visible = true;
            eye2.visible = true;
        }
        
        // Floating animation
        const floatOffset = Math.sin(blinkTimer) * 3;
        playerContainer.y = 250 + floatOffset;
    };
    
    app.ticker.add(tickerFunction);
    
    container.addChild(playerContainer);
}

/*
 * Create functional return button
 */
function createReturnButton(container, app) 
{
    const buttonContainer = new PIXI.Container();
    buttonContainer.name = 'returnButton';
    
    // Button background
    const buttonBg = new PIXI.Graphics();
    buttonBg.beginFill(0x2196F3, 0.9);
    buttonBg.lineStyle(3, 0x1976D2, 1);
    buttonBg.drawRoundedRect(0, 0, 280, 55, 25);
    buttonBg.endFill();
    
    // Button text
    const buttonText = new PIXI.Text("Return to Main Quest", {
        fontFamily: "Arial, sans-serif",
        fontSize: 18,
        fill: 0xffffff,
        fontWeight: "bold"
    });
    buttonText.anchor.set(0.5, 0.5);
    buttonText.position.set(140, 27.5);
    
    // Add components to button container
    buttonContainer.addChild(buttonBg, buttonText);
    buttonContainer.position.set(app.screen.width / 2 - 140, 540);
    
    // Make button interactive
    buttonContainer.interactive = true;
    buttonContainer.cursor = 'pointer';
    buttonContainer.buttonMode = true;
    
    // Set hit area to ensure clicks work
    buttonContainer.hitArea = new PIXI.Rectangle(0, 0, 280, 55);

    // Hover effects
    buttonContainer.on('pointerover', () => 
    {
        buttonBg.tint = 0xdddddd;
        buttonContainer.scale.set(1.05);
    });
    
    buttonContainer.on('pointerout', () => 
    {
        buttonBg.tint = 0xffffff;
        buttonContainer.scale.set(1.0);
    });
    
    // Click handlers
    const navigateHome = () => 
    {
        window.location.hash = '#/';
        
        // Force navigation if hash doesn't work
        setTimeout(() => {
            if (window.location.hash !== '#/') {
                window.location.href = window.location.origin + '/#/';
            }
        }, 100);
    };
    
    // Try all possible click events
    buttonContainer.on('click', navigateHome);
    buttonContainer.on('pointerdown', navigateHome);
    buttonContainer.on('pointerup', navigateHome);
    buttonContainer.on('pointertap', navigateHome);
    buttonContainer.on('tap', navigateHome);
    
    // Add mouse events as backup
    buttonContainer.on('mousedown', navigateHome);
    buttonContainer.on('mouseup', navigateHome);
    container.addChild(buttonContainer);
}

/*
 * Create ambient particles for atmosphere
 */
function createAmbientParticles(container, app) 
{
    const particleContainer = new PIXI.Container();
    particleContainer.name = 'particleContainer';
    container.addChild(particleContainer);
    
    const particles = [];
    const particleCount = 20;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) 
    {
        const particle = new PIXI.Graphics();
        
        // Simple particles to avoid distraction
        const particleType = Math.random();
        if (particleType < 0.5) 
        {
            // Circular particles
            particle.beginFill(0xffcc33, 0.4);
            particle.drawCircle(0, 0, Math.random() * 2 + 1);
            particle.endFill();
        } 
        else 
        {
            // Square particles
            const size = Math.random() * 3 + 1;
            particle.beginFill(0x33ccff, 0.3);
            particle.drawRect(-size/2, -size/2, size, size);
            particle.endFill();
        }
        
        // Initialize particle data
        const particleData = {
            graphic: particle,
            x: Math.random() * app.screen.width,
            y: Math.random() * app.screen.height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            life: Math.random() * 400 + 300,
            maxLife: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.03
        };
        
        particleData.maxLife = particleData.life;
        
        // Set initial position
        particle.position.set(particleData.x, particleData.y);
        
        particleContainer.addChild(particle);
        particles.push(particleData);
    }
    
    // Animation ticker for particles
    const particleTicker = () => 
    {
        particles.forEach(p => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Update rotation
            p.graphic.rotation += p.rotationSpeed;
            
            // Apply movement
            p.graphic.position.set(p.x, p.y);
            
            // Decrease life
            p.life--;
            
            // Fade out as life decreases
            const lifeRatio = p.life / p.maxLife;
            p.graphic.alpha = Math.max(0.1, lifeRatio * 0.6);
            
            // Reset particle when it dies
            if (p.life <= 0) 
            {
                p.x = Math.random() * app.screen.width;
                p.y = Math.random() * app.screen.height;
                p.vx = (Math.random() - 0.5) * 0.8;
                p.vy = (Math.random() - 0.5) * 0.8;
                p.life = p.maxLife;
                p.graphic.alpha = 0.6;
            }
            
            // Wrap around screen edges
            if (p.x > app.screen.width + 10)
            {
                p.x = -10;
            }
            if (p.x < -10) 
            {
                p.x = app.screen.width + 10;
            }
            if (p.y > app.screen.height + 10)
            {
                 p.y = -10;
            }
            if (p.y < -10)
            {
                p.y = app.screen.height + 10;
            }
        });
    };
    
    app.ticker.add(particleTicker);
}

// Legacy function for backwards compatibility
export function handleDirectAccess() 
{
    if (!window.location.hash && window.location.pathname !== "/") 
    {
        const path = window.location.pathname;
        let redirectTo = window.location.origin;
        
        if (path !== '/' && path !== '/index.html') 
        {
            redirectTo += '/#' + path;
        } 
        else 
        {
            redirectTo += '/#/';
        }
        
        window.location.replace(redirectTo);
        return true;
    }
    return false;
}