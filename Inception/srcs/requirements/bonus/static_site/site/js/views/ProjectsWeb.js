export default function projectsWeb(container, app) 
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
    
    const webBg = new PIXI.Graphics();
    webBg.name = 'webBg';
    container.addChild(webBg);
    
    const title = new PIXI.Text("Web Development Projects", {
        fontFamily: fontFamily,
        fontSize: Math.min(36, app.screen.width * 0.06),
        fill: colors.title,
        fontWeight: 'bold'
    });
    title.anchor.set(0.5, 0);
    title.position.set(app.screen.width / 2, 150);
    title.name = 'webTitle';
    container.addChild(title);
    
    const infoTitle = new PIXI.Text("Coming Soon", {
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
        "Web development projects will be showcased here soon!\n\nThis will include React, Node.js, and full-stack applications.",
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
    
    const placeholderProjects = [
        {
            title: "Portfolio Website",
            description: "This very website you're browsing! Built with Pixi.js",
            status: "In Progress",
            tech: "Pixi.js, HTML5, CSS3",
            color: 0x61DAFB
        }
    ];
    
    const cardElements = [];
    
    const createProjectCards = () => {
        cardElements.forEach(cardData => {
            if (cardData && cardData.elements)
            {
                cardData.elements.forEach(element => {
                    if (element && element.parent) 
                    {
                        element.parent.removeChild(element);
                        if (element.destroy) 
                        {
                            element.destroy({ children: true, texture: false });
                        }
                    }
                });
            }
        });
        cardElements.length = 0;
        
        const elementsToRemove = [];
        container.children.forEach(child => {
            if (child.name && (child.name.includes('card') || child.name.includes('status') || child.name.includes('tech'))) 
            {
                elementsToRemove.push(child);
            }
        });
        elementsToRemove.forEach(element => {
            if (element.parent) 
            {
                element.parent.removeChild(element);
                if (element.destroy) 
                {
                    element.destroy({ children: true, texture: false });
                }
            }
        });
        
        const cardWidth = Math.min(280, app.screen.width - 40);
        const cardHeight = 140;
        const cardSpacing = 30;
        const startY = 450;
        
        const totalWidth = placeholderProjects.length * cardWidth + (placeholderProjects.length - 1) * cardSpacing;
        const startX = (app.screen.width - totalWidth) / 2;
        
        placeholderProjects.forEach((project, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const cardY = startY;
            
            const cardData = createWebProjectCard(container, project, cardX, cardY, cardWidth, cardHeight);
            cardElements.push(cardData);
        });
    };
    
    const elements = {
        title,
        infoTitle,
        webBg,
        description
    };
    
    const drawBackgrounds = () => 
    {
        const webBgWidth = Math.min(elements.description.width + 40, app.screen.width - 100);
        const webBgHeight = elements.description.height + 40;
        const webBgX = (app.screen.width - webBgWidth) / 2;
        const webBgY = 290;
        
        elements.webBg.clear();
        elements.webBg.beginFill(colors.fixedBlueBg, colors.bgAlpha);
        elements.webBg.lineStyle(1, colors.fixedBlueBg, colors.bgLineAlpha);
        elements.webBg.drawRoundedRect(webBgX, webBgY, webBgWidth, webBgHeight, 10);
        elements.webBg.endFill();
        
        elements.description.position.set(webBgX + 20, webBgY + 20);
    };
    
    const resizeElements = () => 
    {
        
        if (!elements.title || !elements.description) 
        {
            console.warn("Web projects page elements not found during resize");
            return;
        }
        
        elements.title.position.set(app.screen.width / 2, 150);
        elements.title.style.fontSize = Math.min(36, app.screen.width * 0.06);
        
        elements.infoTitle.position.set(app.screen.width / 2, 240);
        elements.infoTitle.style.fontSize = Math.min(32, app.screen.width * 0.05);
        
        elements.description.style.fontSize = Math.min(16, app.screen.width * 0.022);
        elements.description.style.wordWrapWidth = Math.min(app.screen.width - 120, 800);
        
        elements.description._autoResolution = true;
        
        setTimeout(() => {
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
            createProjectCards();
        }, 10);
    };

    const updateTheme = () => 
    {
        const newTheme = document.body.getAttribute('data-theme') || 'light';
        colors = getColors(newTheme);
        
        elements.title.style.fill = colors.title;
        elements.infoTitle.style.fill = colors.title;
        
        setTimeout(() => {
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
            createProjectCards();
        }, 10);
    };
    
    drawBackgrounds();
    createProjectCards();
    
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

function createWebProjectCard(container, project, x, y, width, height) 
{
    const cardContainer = new PIXI.Container();
    cardContainer.name = `cardContainer_${Date.now()}`;
    
    const cardBg = new PIXI.Graphics();
    cardBg.name = `cardBg_${Date.now()}`;
    cardBg.beginFill(0x1a1a1a, 0.5);
    cardBg.lineStyle(2, project.color, 0.6);
    cardBg.drawRoundedRect(0, 0, width, height, 12);
    cardBg.endFill();
    cardBg.position.set(x, y);
    
    const cardTitle = new PIXI.Text(project.title, {
        fontFamily: "Honk, serif",
        fontSize: Math.min(20, width * 0.07),
        fill: project.color,
        fontWeight: "bold"
    });
    cardTitle.name = `cardTitle_${Date.now()}`;
    cardTitle.anchor.set(0.5, 0);
    cardTitle.position.set(x + width / 2, y + 15);
    
    const cardDesc = new PIXI.Text(project.description, {
        fontFamily: "Arial",
        fontSize: Math.min(13, width * 0.046),
        fill: 0xdddddd,
        wordWrap: true,
        wordWrapWidth: width - 20,
        lineHeight: 16
    });
    cardDesc.name = `cardDesc_${Date.now()}`;
    cardDesc.position.set(x + 10, y + 45);
    
    const techText = new PIXI.Text(`Tech: ${project.tech}`, {
        fontFamily: "Arial",
        fontSize: Math.min(11, width * 0.039),
        fill: 0x888888,
        wordWrap: true,
        wordWrapWidth: width - 20
    });
    techText.name = `techText_${Date.now()}`;
    techText.position.set(x + 10, y + 85);
    
    const statusColor = project.status === "In Progress" ? 0xFF9800 : 0x666666;
    const statusBg = new PIXI.Graphics();
    statusBg.name = `statusBg_${Date.now()}`;
    statusBg.beginFill(statusColor, 0.8);
    statusBg.drawRoundedRect(0, 0, 90, 22, 11);
    statusBg.endFill();
    statusBg.position.set(x + width - 100, y + height - 32);
    
    const statusText = new PIXI.Text(project.status, {
        fontFamily: "Arial",
        fontSize: Math.min(11, width * 0.039),
        fill: 0xffffff,
        fontWeight: "bold"
    });
    statusText.name = `statusText_${Date.now()}`;
    statusText.anchor.set(0.5, 0.5);
    statusText.position.set(x + width - 55, y + height - 21);
    
    cardContainer.addChild(cardBg);
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';
    
    cardContainer.on('pointerover', () => {
        cardBg.tint = 0xf5f5f5;
        cardContainer.scale.set(1.03);
    });
    
    cardContainer.on('pointerout', () => {
        cardBg.tint = 0xffffff;
        cardContainer.scale.set(1.0);
    });
    
    container.addChild(cardContainer);
    container.addChild(cardTitle);
    container.addChild(cardDesc);
    container.addChild(techText);
    container.addChild(statusBg);
    container.addChild(statusText);
    
    return {
        container: cardContainer,
        elements: [cardContainer, cardTitle, cardDesc, techText, statusBg, statusText]
    };
}