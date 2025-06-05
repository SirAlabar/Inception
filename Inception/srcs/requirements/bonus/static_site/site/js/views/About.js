/**
 * About page content creator for Pixi.js
 * Creates character stats and quest description with improved responsive design
 * Includes font fallback for Linux compatibility
 */
export default function about(container, app, assetManager) 
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
    
    // Define colors based on theme - ONLY SET ONCE
    const getColors = (theme) => 
    {
        return {
            title: theme === 'dark' ? 0xffcc33 : 0xcc0000,
            skillBg: theme === 'dark' ? 0x4a4a4a : 0x4a4a4a,
            skillBgAlpha: 0.6,
            skillBgLineAlpha: 0.7,
            fixedBlueBg: 0x1e3a5f,
            bgAlpha: 0.4,
            bgLineAlpha: 0.6,
            whiteText: 0xffffff
        };
    };
    
    let colors = getColors(currentTheme);
    
    // CREATE ALL BACKGROUNDS
    const statsBg = new PIXI.Graphics();
    statsBg.name = 'statsBg';
    container.addChild(statsBg);
    
    const skillsBg = new PIXI.Graphics();
    skillsBg.name = 'skillsBg';
    container.addChild(skillsBg);
    
    const questBg = new PIXI.Graphics();
    questBg.name = 'questBg';
    container.addChild(questBg);
    
    // CREATE ALL TEXT ELEMENTS
    // Stats Title
    const statsTitle = new PIXI.Text("Character Stats", 
    {
        fontFamily: fontFamily,
        fontSize: Math.min(36, app.screen.width * 0.06),
        fill: colors.title,
        fontWeight: 'bold'
    });
    statsTitle.anchor.set(0.5, 0);
    statsTitle.position.set(app.screen.width / 2, 150);
    statsTitle.name = 'statsTitle';
    container.addChild(statsTitle);
    
    // Stats Container
    const statsContainer = new PIXI.Container();
    statsContainer.name = 'statsContainer';
    container.addChild(statsContainer);
    
    // Skills Title
    const skillsTitle = new PIXI.Text("Technical Skills", 
    {
        fontFamily: fontFamily,
        fontSize: Math.min(32, app.screen.width * 0.05),
        fill: colors.title,
        fontWeight: 'bold'
    });
    skillsTitle.anchor.set(0.5, 0);
    skillsTitle.position.set(app.screen.width / 2, 330);
    skillsTitle.name = 'skillsTitle';
    container.addChild(skillsTitle);
    
    // Skills Container
    const skillsContainer = new PIXI.Container();
    skillsContainer.name = 'skillsContainer';
    container.addChild(skillsContainer);
    
    // Quest Title
    const questTitle = new PIXI.Text("Current Quest", 
    {
        fontFamily: fontFamily,
        fontSize: Math.min(32, app.screen.width * 0.05),
        fill: colors.title,
        fontWeight: 'bold'
    });
    questTitle.anchor.set(0.5, 0);
    questTitle.position.set(app.screen.width / 2, 540);
    questTitle.name = 'questTitle';
    container.addChild(questTitle);
    
    // Quest Text
    const questText = new PIXI.Text(
        "As a career changer diving into the world of game development, I am excited to explore and create innovative solutions using technology. Currently focusing on mastering C and developing small games in C#, I am passionate about discovering new technologies and leveraging them to craft high-quality projects.\n\nI am a student at 42 School, where I am honing my skills and expanding my horizons in this dynamic field.",
        {
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: Math.min(16, app.screen.width * 0.022),
            fill: colors.whiteText,
            wordWrap: true,
            wordWrapWidth: Math.min(app.screen.width - 120, 800),
            lineHeight: 20
        }
    );
    questText.name = 'questText';
    container.addChild(questText);
    
    const stats = [
        { label: "Class:", value: "Software Developer" },
        { label: "Former Class:", value: "Accountant" },
        { label: "Level:", value: "34" },
        { label: "Guild:", value: "42 Porto" },
        { label: "Base:", value: "Porto, Portugal" },
        { label: "Interests:", value: "Game Design, Pixel Art" }
    ];
    
    const skillCategories = [
        {
            title: "Main Stack:",
            skills: ["C", "C++", "Git"]
        },
        {
            title: "Secondary Stack:",
            skills: ["C#", "CSS", "HTML", "JavaScript"]
        },
        {
            title: "Studying Now:",
            skills: ["Unity", "Game Development", "Algorithms"]
        },
        {
            title: "Tools:",
            skills: [".NET", "VS Code", "Linux", "Slack"]
        }
    ];
    
    const elements = {
        statsTitle,
        skillsTitle,
        questTitle,
        statsBg,
        skillsBg,
        questBg,
        questText,
        statsContainer,
        skillsContainer
    };

    const drawBackgrounds = () => 
    {
        // Stats background - responsive width, centered
        const maxStatsWidth = 600;
        const minStatsWidth = Math.min(app.screen.width - 40, 300);
        const statsWidth = Math.min(maxStatsWidth, Math.max(minStatsWidth, app.screen.width * 0.8));
        const statsHeight = 120;
        const statsX = (app.screen.width - statsWidth) / 2;
        const statsY = 200;
        
        elements.statsBg.clear();
        elements.statsBg.beginFill(colors.fixedBlueBg, colors.bgAlpha);
        elements.statsBg.lineStyle(1, colors.fixedBlueBg, colors.bgLineAlpha);
        elements.statsBg.drawRoundedRect(statsX, statsY, statsWidth, statsHeight, 10);
        elements.statsBg.endFill();
        
        // Skills background - responsive width, centered
        const maxSkillsWidth = 700;
        const minSkillsWidth = Math.min(app.screen.width - 40, 350);
        const skillsWidth = Math.min(maxSkillsWidth, Math.max(minSkillsWidth, app.screen.width * 0.85));
        const skillsHeight = 160;
        const skillsX = (app.screen.width - skillsWidth) / 2;
        const skillsY = 370;
        
        elements.skillsBg.clear();
        elements.skillsBg.beginFill(colors.fixedBlueBg, colors.bgAlpha);
        elements.skillsBg.lineStyle(1, colors.fixedBlueBg, colors.bgLineAlpha);
        elements.skillsBg.drawRoundedRect(skillsX, skillsY, skillsWidth, skillsHeight, 10);
        elements.skillsBg.endFill();
        
        // Quest background - dynamic width based on text, centered
        const questBgWidth = Math.min(elements.questText.width + 40, app.screen.width - 100);
        const questBgHeight = elements.questText.height + 40;
        const questBgX = (app.screen.width - questBgWidth) / 2;
        const questBgY = 590;
        
        elements.questBg.clear();
        elements.questBg.beginFill(colors.fixedBlueBg, colors.bgAlpha);
        elements.questBg.lineStyle(1, colors.fixedBlueBg, colors.bgLineAlpha);
        elements.questBg.drawRoundedRect(questBgX, questBgY, questBgWidth, questBgHeight, 10);
        elements.questBg.endFill();
        
        // Position quest text RELATIVE to its background
        elements.questText.position.set(questBgX + 20, questBgY + 20);
    };

    const buildStatsContent = () => 
    {
        elements.statsContainer.removeChildren();
        
        // Calculate responsive positions RELATIVE to background
        const maxStatsWidth = 600;
        const minStatsWidth = Math.min(app.screen.width - 40, 300);
        const statsWidth = Math.min(maxStatsWidth, Math.max(minStatsWidth, app.screen.width * 0.8));
        const statsX = (app.screen.width - statsWidth) / 2;
        const leftX = statsX + 50;  // 50px padding from left edge of background
        const rightX = statsX + (statsWidth / 2); // Middle of background
        const startY = 215;
        
        const leftColumn = stats.slice(0, 3);
        const rightColumn = stats.slice(3);
        
        leftColumn.forEach((stat, index) => 
        {
            const label = new PIXI.Text(stat.label, 
            {
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: Math.min(18, app.screen.width * 0.025),
                fontWeight: "bold",
                fill: colors.whiteText
            });
            label.position.set(leftX, startY + index * 30);
            elements.statsContainer.addChild(label);
            
            const value = new PIXI.Text(stat.value, 
            {
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: Math.min(16, app.screen.width * 0.022),
                fill: colors.whiteText
            });
            value.position.set(leftX + label.width + 10, startY + index * 30);
            elements.statsContainer.addChild(value);
        });
        
        rightColumn.forEach((stat, index) => 
        {
            const label = new PIXI.Text(stat.label, 
            {
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: Math.min(18, app.screen.width * 0.025),
                fontWeight: "bold",
                fill: colors.whiteText
            });
            label.position.set(rightX, startY + index * 30);
            elements.statsContainer.addChild(label);
            
            const value = new PIXI.Text(stat.value, 
            {
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: Math.min(16, app.screen.width * 0.022),
                fill: colors.whiteText
            });
            value.position.set(rightX + label.width + 10, startY + index * 30);
            elements.statsContainer.addChild(value);
        });
    };

    const buildSkillsContent = () => 
    {
        elements.skillsContainer.removeChildren();
        
        // Calculate responsive positions RELATIVE to background
        const maxSkillsWidth = 700;
        const minSkillsWidth = Math.min(app.screen.width - 40, 350);
        const skillsWidth = Math.min(maxSkillsWidth, Math.max(minSkillsWidth, app.screen.width * 0.85));
        const skillsX = (app.screen.width - skillsWidth) / 2;
        const skillStartX = skillsX + 50;
        const startY = 385;
        
        skillCategories.forEach((category, categoryIndex) => 
        {
            const categoryTitle = new PIXI.Text(category.title, 
            {
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: Math.min(16, app.screen.width * 0.023),
                fontWeight: "bold",
                fill: colors.whiteText
            });
            categoryTitle.position.set(skillStartX, startY + categoryIndex * 35);
            elements.skillsContainer.addChild(categoryTitle);
            
            let skillX = skillStartX + categoryTitle.width + 15;
            
            category.skills.forEach((skill) => 
            {
                const skillBg = new PIXI.Graphics();
                skillBg.beginFill(colors.skillBg, colors.skillBgAlpha);
                skillBg.lineStyle(1, colors.skillBg, colors.skillBgLineAlpha);
                
                const skillText = new PIXI.Text(skill, 
                {
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: Math.min(14, app.screen.width * 0.02),
                    fill: colors.whiteText
                });
                
                const padding = 8;
                skillBg.drawRoundedRect(0, 0, skillText.width + padding * 2, skillText.height + padding, 6);
                skillBg.endFill();
                skillBg.position.set(skillX, startY + categoryIndex * 35 - 2);
                
                skillText.position.set(skillX + padding, startY + categoryIndex * 35 + 2);
                
                elements.skillsContainer.addChild(skillBg);
                elements.skillsContainer.addChild(skillText);
                
                skillX += skillText.width + padding * 2 + 10;
            });
        });
    };
    
    const resizeElements = () => 
    {
        // Check if elements still exist
        if (!elements.statsTitle || !elements.questText) 
        {
            console.warn("About page elements not found during resize");
            return;
        }
        
        // Update titles positions and sizes
        elements.statsTitle.position.set(app.screen.width / 2, 150);
        elements.statsTitle.style.fontSize = Math.min(36, app.screen.width * 0.06);
        
        elements.skillsTitle.position.set(app.screen.width / 2, 335);
        elements.skillsTitle.style.fontSize = Math.min(32, app.screen.width * 0.05);
        
        elements.questTitle.position.set(app.screen.width / 2, 540);
        elements.questTitle.style.fontSize = Math.min(32, app.screen.width * 0.05);
        
        // Update quest text size and wrap width
        elements.questText.style.fontSize = Math.min(16, app.screen.width * 0.022);
        elements.questText.style.wordWrapWidth = Math.min(app.screen.width - 120, 800);
        
        // Force text to recalculate after style changes
        elements.questText._autoResolution = true;
        
        // Small delay to ensure text has recalculated before drawing backgrounds
        setTimeout(() => 
        {
            // Redraw backgrounds
            drawBackgrounds();
            
            // Rebuild content with new positions
            buildStatsContent();
            buildSkillsContent();
        }, 10);
    };

    const updateTheme = () => 
    {
        const newTheme = document.body.getAttribute('data-theme') || 'light';
        colors = getColors(newTheme);
        
        // Update title colors
        elements.statsTitle.style.fill = colors.title;
        elements.skillsTitle.style.fill = colors.title;
        elements.questTitle.style.fill = colors.title;
        
        // Redraw backgrounds with new colors
        drawBackgrounds();
        
        // Rebuild skills with new colors (skills have colored backgrounds)
        buildSkillsContent();
    };
    
    // Initial build
    drawBackgrounds();
    buildStatsContent();
    buildSkillsContent();

    // Resize listener
    window.addEventListener('resize', resizeElements);
    
    // Theme change observer - only for colors and styles
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