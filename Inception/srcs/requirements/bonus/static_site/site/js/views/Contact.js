/**
 * Contact page content creator for Pixi.js
 * Creates contact section following About.js patterns exactly
 */
export default function contact(container, app, assetManager) 
{
    // Get initial theme
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    
    // Font detection and fallback - check if Honk causes excessive width
    const getFontFamily = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Test Honk font with a sample text
        context.font = '32px Honk, serif';
        const testWidth = context.measureText('Test').width;
        
        // If width is excessive (like 5000px), use fallback
        if (testWidth > 200) 
        {
            return "Impact, serif";
        }
        
        return "Honk, serif";
    };
    
    const fontFamily = getFontFamily();
    
    // Define colors based on theme
    const getColors = (theme) => 
    {
        return {
            title: theme === 'dark' ? 0xffcc33 : 0xcc0000,
            fixedBlueBg: 0x1e3a5f,
            bgAlpha: 0.4,
            bgLineAlpha: 0.6,
            whiteText: 0xffffff
        };
    };
    
    let colors = getColors(currentTheme);
    
    const contactBg = new PIXI.Graphics();
    contactBg.name = 'contactBg';
    container.addChild(contactBg);
    
    // Main Title
    const contactTitle = new PIXI.Text("Contact Me", 
    {
        fontFamily: fontFamily,
        fontSize: Math.min(36, app.screen.width * 0.06),
        fill: colors.title,
        fontWeight: 'bold'
    });
    contactTitle.anchor.set(0.5, 0);
    contactTitle.position.set(app.screen.width / 2, 150);
    contactTitle.name = 'contactTitle';
    container.addChild(contactTitle);
    
    // Get In Touch Title
    const infoTitle = new PIXI.Text("Get In Touch", 
    {
        fontFamily: fontFamily,
        fontSize: Math.min(32, app.screen.width * 0.05),
        fill: colors.title,
        fontWeight: 'bold'
    });
    infoTitle.anchor.set(0.5, 0);
    infoTitle.position.set(app.screen.width / 2, 540);
    infoTitle.name = 'infoTitle';
    container.addChild(infoTitle);
    
    // Coming Soon Text
    const comingSoonText = new PIXI.Text(
        "Coming Soon...\n\nI'm working on creating the perfect way for us to connect. Stay tuned for updates!",
        {
            fontFamily: "Arial, sans-serif",
            fontSize: Math.min(16, app.screen.width * 0.022),
            fill: colors.whiteText,
            wordWrap: true,
            wordWrapWidth: Math.min(app.screen.width - 120, 800),
            lineHeight: 20,
            align: 'center'
        }
    );
    comingSoonText.name = 'comingSoonText';
    container.addChild(comingSoonText);
    
    const elements = {
        contactTitle,
        infoTitle,
        contactBg,
        comingSoonText
    };

    const drawBackgrounds = () => 
    {
        // Contact background
        const contactBgWidth = Math.min(elements.comingSoonText.width + 40, app.screen.width - 100);
        const contactBgHeight = elements.comingSoonText.height + 40;
        const contactBgX = (app.screen.width - contactBgWidth) / 2;
        const contactBgY = 290;
        
        elements.contactBg.clear();
        elements.contactBg.beginFill(colors.fixedBlueBg, colors.bgAlpha);
        elements.contactBg.lineStyle(1, colors.fixedBlueBg, colors.bgLineAlpha);
        elements.contactBg.drawRoundedRect(contactBgX, contactBgY, contactBgWidth, contactBgHeight, 10);
        elements.contactBg.endFill();
        
        // Position coming soon text
        elements.comingSoonText.position.set(contactBgX + 20, contactBgY + 20);
    };
    
    const resizeElements = () => 
    {
        // Check if elements still exist
        if (!elements.contactTitle || !elements.comingSoonText) 
        {
            console.warn("Contact page elements not found during resize");
            return;
        }
        
        // Update titles positions and sizes
        elements.contactTitle.position.set(app.screen.width / 2, 150);
        elements.contactTitle.style.fontSize = Math.min(36, app.screen.width * 0.06);
        
        elements.infoTitle.position.set(app.screen.width / 2, 240);
        elements.infoTitle.style.fontSize = Math.min(32, app.screen.width * 0.05);
        
        elements.comingSoonText.style.fontSize = Math.min(16, app.screen.width * 0.022);
        elements.comingSoonText.style.wordWrapWidth = Math.min(app.screen.width - 120, 800);
        
        elements.comingSoonText._autoResolution = true;
        
        setTimeout(() => 
        {
            // Redraw backgrounds
            drawBackgrounds();
        }, 10);
    };

    const updateTheme = () => 
    {
        const newTheme = document.body.getAttribute('data-theme') || 'light';
        colors = getColors(newTheme);
        
        elements.contactTitle.style.fill = colors.title;
        elements.infoTitle.style.fill = colors.title;
        
        drawBackgrounds();
    };
    
    // Initial build
    drawBackgrounds();

    // Resize listener
    window.addEventListener('resize', resizeElements);
    
    // Theme change observer
    const observer = new MutationObserver((mutations) => 
    {
        mutations.forEach((mutation) => 
        {
            if (mutation.attributeName === 'data-theme') 
            {
                updateTheme();
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