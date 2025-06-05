export default function projectsMobile(container, app) 
{
    
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    
    const getFontFamily = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '32px Honk, serif';
        const testWidth = context.measureText('Test').width;
        if (testWidth > 200) 
        {
            return "Impact, serif";
        }
        return "Honk, serif";
    };
    
    const fontFamily = getFontFamily();
    
    const getColors = (theme) => 
    {
        return {
            title: theme === 'dark' ? 0xffcc33 : 0xcc0000,
            whiteText: 0xffffff,
            grayText: 0xcccccc,
            fixedBlueBg: 0x1e3a5f,
            bgAlpha: 0.4,
            bgLineAlpha: 0.6
        };
    };
    
    let colors = getColors(currentTheme);
    
    const mobileBg = new PIXI.Graphics();
    mobileBg.name = 'mobileBg';
    container.addChild(mobileBg);
    
    const title = new PIXI.Text("Mobile Development Projects", {
        fontFamily: fontFamily,
        fontSize: Math.min(36, app.screen.width * 0.06),
        fill: colors.title,
        fontWeight: 'bold'
    });
    title.anchor.set(0.5, 0);
    title.position.set(app.screen.width / 2, 150);
    title.name = 'mobileTitle';
    container.addChild(title);
    
    const infoTitle = new PIXI.Text("Get Mobile Updates", {
        fontFamily: fontFamily,
        fontSize: Math.min(32, app.screen.width * 0.05),
        fill: colors.title,
        fontWeight: 'bold'
    });
    infoTitle.anchor.set(0.5, 0);
    infoTitle.position.set(app.screen.width / 2, 240);
    infoTitle.name = 'infoTitle';
    container.addChild(infoTitle);
    
    const description = new PIXI.Text(
        "Mobile development projects will be featured here!\n\nIncluding React Native and native iOS/Android apps.",
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
    description.name = 'descriptionText';
    container.addChild(description);
    
    const elements = {
        title,
        infoTitle,
        mobileBg,
        description
    };

    const drawBackgrounds = () => 
    {
        const mobileBgWidth = Math.min(elements.description.width + 40, app.screen.width - 100);
        const mobileBgHeight = elements.description.height + 40;
        const mobileBgX = (app.screen.width - mobileBgWidth) / 2;
        const mobileBgY = 290;
        
        elements.mobileBg.clear();
        elements.mobileBg.beginFill(colors.fixedBlueBg, colors.bgAlpha);
        elements.mobileBg.lineStyle(1, colors.fixedBlueBg, colors.bgLineAlpha);
        elements.mobileBg.drawRoundedRect(mobileBgX, mobileBgY, mobileBgWidth, mobileBgHeight, 10);
        elements.mobileBg.endFill();
        
        elements.description.position.set(mobileBgX + 20, mobileBgY + 20);
    };
    
    const resizeElements = () => 
    {
        
        if (!elements.title || !elements.description) 
        {
            console.warn("Mobile projects page elements not found during resize");
            return;
        }
        
        elements.title.position.set(app.screen.width / 2, 150);
        elements.title.style.fontSize = Math.min(36, app.screen.width * 0.06);
        
        elements.infoTitle.position.set(app.screen.width / 2, 240);
        elements.infoTitle.style.fontSize = Math.min(32, app.screen.width * 0.05);
        
        elements.description.style.fontSize = Math.min(16, app.screen.width * 0.022);
        elements.description.style.wordWrapWidth = Math.min(app.screen.width - 120, 800);
        
        elements.description._autoResolution = true;
        
        setTimeout(() => 
        {
            if (elements.title) 
            {
                elements.title._autoResolution = true;
            }
            if (elements.infoTitle)
            { 
                elements.infoTitle._autoResolution = true;
            }
            if (elements.description)
            {
                elements.description._autoResolution = true;
            }
            drawBackgrounds();
        }, 10);
    };

    const updateTheme = () => 
    {
        const newTheme = document.body.getAttribute('data-theme') || 'light';
        colors = getColors(newTheme);
        
        elements.title.style.fill = colors.title;
        elements.infoTitle.style.fill = colors.title;
        
        drawBackgrounds();
    };
    
    drawBackgrounds();

    window.addEventListener('resize', resizeElements);
    
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