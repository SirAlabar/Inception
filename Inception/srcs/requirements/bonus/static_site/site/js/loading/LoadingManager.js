/**
 * LoadingManager - Manages the asset loading process and initialization
 * Coordinates between LoadingUI, AssetManager and GameInitializer
 */
import { LoadingUI } from './LoadingUI.js';
import { GameInitializer } from './GameInitializer.js';
import { createAssetManager } from '../manager/AssetManager.js';
import { initSceneManager, getSceneManager } from '../manager/SceneManager.js';
import { CloudsManager } from '../manager/CloudsManager.js';
import { CursorEffectComponent } from '../components/CursorEffectsComponent.js';
import { createContentManager } from '../manager/ContentManager.js';

export class LoadingManager 
{
   constructor() 
   {
       // Create visual UI component
       this.ui = new LoadingUI();
       
       // Flag to track completion
       this.isComplete = false;
       
       // Create AssetManager
       this.assetManager = createAssetManager();
       
       // Set up callbacks
       this.assetManager.onProgress = (progress) => {
           this.ui.updateProgress(progress);
       };
       
       this.assetManager.onComplete = () => {
           this.onLoadingComplete();
       };
   }
   
// Start loading assets
   start() 
   {
        this.assetManager.loadAllAssets();
   }
   
   // Handle loading completion
   onLoadingComplete() 
   {
       // Mark as complete
       this.isComplete = true;
       
       // Show completion visual effects
       this.ui.showComplete().then(async () => {
           // Initialize the site
           await this.initSite();
           
           // Hide loading screen
           this.ui.hide();
       });
   }

   /**
    * Initialize the site after assets are loaded
    * @returns {Promise} Resolves when site is initialized
    */
   async initSite() 
   {
       const currentTheme = localStorage.getItem('theme') || 'light';
       const sceneElement = document.getElementById('main-scene');
       const gameContainer = document.getElementById('game-container');
       
       // Initialize PIXI application
       const app = new PIXI.Application();
       await app.init({
            background: 0x000000,
            backgroundAlpha: 0,
            resizeTo: sceneElement,  
            antialias: true,
            useBackBuffer: true,
            clearBeforeRender: true
       });
       
       // Register app globally for access from main.js
       window.app = app;
       
       sceneElement.appendChild(app.canvas);
       sceneElement.style.height = '200vh';
       
       // Create render groups
       const { backgroundGroup, contentGroup, pageGroups, uiGroup } = this.createRenderGroups(app);
       
       // Initialize SceneManager
        const sceneManager = initSceneManager(this.assetManager);
        if (sceneManager) 
        {
            sceneManager.setBackgroundGroup(backgroundGroup, app);
            sceneManager.applyTheme(currentTheme);
        }
       
       // Initialize ContentManager
       const contentManager = createContentManager(app, contentGroup, pageGroups, this.assetManager);
       window.contentManager = contentManager;
       
       // Initialize Game in the homeContent container
       const gameInitializer = new GameInitializer();
       await gameInitializer.initialize(app, pageGroups.homeContent, gameContainer, this.assetManager);
       
       // Initialize CloudsManager
        if (this.assetManager.getSpritesheet('clouds_spritesheet')) 
        {
            const cloudsManager = new CloudsManager(
                app, 
                backgroundGroup, 
                this.assetManager,
                sceneManager
            );
            cloudsManager.init(currentTheme);
        }
        else 
        {
            // Set up a retry mechanism
            const checkForSpritesheet = setInterval(() => {
                if (this.assetManager.getSpritesheet('clouds_spritesheet')) 
                {
                    clearInterval(checkForSpritesheet);
                    const cloudsManager = new CloudsManager(app, backgroundGroup, this.assetManager);
                    sceneManager.setCloudsManager(cloudsManager);
                    cloudsManager.init(currentTheme);
                }
            }, 500);
        }
            
       // Initialize CursorEffectComponent
        const cursorEffect = new CursorEffectComponent(null, app, uiGroup, {
            particlesCount: 3,
        }, this.assetManager);
       
       // Handle responsive UI
       if (window.innerWidth > 768) 
       {
           const navbarCollapse = document.getElementById('navbarSupportedContent');
           const navbarToggler = document.querySelector('.navbar-toggler');
           if (navbarCollapse && !navbarCollapse.classList.contains('show')) 
           {
               navbarCollapse.classList.add('show');
               if (navbarToggler) 
               {
                   navbarToggler.setAttribute('aria-expanded', 'true');
               }
               setTimeout(() => {
                   window.dispatchEvent(new Event('resize'));
               }, 100);
           }
       }
   }
   
    // Creates render groups to separate background and gameplay elements
   createRenderGroups(app)
   {
       // Create a background group for parallax layers
       const backgroundGroup = new PIXI.Container();
       backgroundGroup.name = "backgroundGroup";
       backgroundGroup.zIndex = 0;
       
       // Create a content group for all page content
        const contentGroup = new PIXI.Container();
        contentGroup.name = "contentGroup";
        contentGroup.zIndex = 10;
        contentGroup.sortableChildren = true;

        // Main page containers
        const homeContent = new PIXI.Container();
        homeContent.name = "homeContent";
        homeContent.visible = true;

        const aboutContent = new PIXI.Container(); 
        aboutContent.name = "aboutContent";
        aboutContent.visible = false;
        
        const contactContent = new PIXI.Container();
        contactContent.name = "contactContent";
        contactContent.visible = false;

        const notFound404Content = new PIXI.Container(); 
        notFound404Content.name = "notFound404Content";
        notFound404Content.visible = false;
        
        // Projects main container
        const projectsContent = new PIXI.Container();
        projectsContent.name = "projectsContent";
        projectsContent.visible = false;
        projectsContent.sortableChildren = true;
        
        // Projects sub-containers (sub-routes)
        const projects42Content = new PIXI.Container();
        projects42Content.name = "projects42Content";
        projects42Content.visible = false;
        
        const projectsWebContent = new PIXI.Container();
        projectsWebContent.name = "projectsWebContent";
        projectsWebContent.visible = false;
        
        const projectsMobileContent = new PIXI.Container();
        projectsMobileContent.name = "projectsMobileContent";
        projectsMobileContent.visible = false;
        
        const projectsGamesContent = new PIXI.Container();
        projectsGamesContent.name = "projectsGamesContent";
        projectsGamesContent.visible = false;
        
        // Add project sub-containers to projects main container
        projectsContent.addChild(projects42Content);
        projectsContent.addChild(projectsWebContent);
        projectsContent.addChild(projectsMobileContent);
        projectsContent.addChild(projectsGamesContent);
        
        // Add main page containers to content group
        contentGroup.addChild(homeContent);
        contentGroup.addChild(aboutContent);
        contentGroup.addChild(contactContent);
        contentGroup.addChild(projectsContent);
        contentGroup.addChild(notFound404Content);

       // Create a UI group for cursor effects and HUD elements (100% coverage)
       const uiGroup = new PIXI.Container();
       uiGroup.name = "uiGroup";
       uiGroup.zIndex = 999;

       uiGroup.interactive = true;
       uiGroup.interactiveChildren = true;
       uiGroup.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
       
       // Add all groups to the stage in the correct order
       app.stage.addChild(backgroundGroup);
       app.stage.addChild(contentGroup);
       app.stage.addChild(uiGroup);
       
       app.stage.sortableChildren = true;
       app.stage.sortChildren();
       
       // Return the created groups for use by initSite
       return {
            backgroundGroup,
            contentGroup,
            pageGroups: {
                homeContent,
                aboutContent,
                contactContent,
                notFound404Content,
                projectsContent,
                // Project sub-containers
                projects42Content,
                projectsWebContent,
                projectsMobileContent,
                projectsGamesContent
            },
            uiGroup
       };
   }
}