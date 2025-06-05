/**
 * ContentManager.js
 * Manages PIXI content for different pages including project sub-routes
 * Delegates content creation to respective view files
 */
export class ContentManager 
{
    constructor(app, contentGroup, pageGroups, assetManager) 
    {
        // Store references
        this.app = app;
        this.contentGroup = contentGroup;
        this.pageGroups = pageGroups;
        this.assetManager = assetManager;
        this.currentPage = 'home';
        this.currentSubpage = null;
        
        // Store initialization state
        this.initialized = {
            home: false,
            about: false,
            contact: false,
            projects: false,
            notFound: false,
            // Project sub-pages
            projects42: false,
            projectsWeb: false,
            projectsMobile: false,
            projectsGames: false
        };
        
        // Store view module references
        this.views = {};
    }
    
    /**
     * Initialize the ContentManager
     */
    init() 
    {
        console.log("ContentManager initialized");
        
        // Pre-load view modules
        this.loadViewModules();
        
        // Set up resize handler
        window.addEventListener('resize', this.onResize.bind(this), { passive: true });
        
        return this;
    }
    
    /**
     * Load all view modules
     */
    async loadViewModules() 
    {
        try 
        {
            // Dynamic imports for main view modules
            const homeModule = await import('../views/Home.js');
            const aboutModule = await import('../views/About.js');
            const contactModule = await import('../views/Contact.js');
            const notFoundModule = await import('../views/404.js');
            
            // Dynamic imports for project sub-modules
            const projects42Module = await import('../views/Projects42.js');
            const projectsWebModule = await import('../views/ProjectsWeb.js');
            const projectsMobileModule = await import('../views/ProjectsMobile.js');
            const projectsGamesModule = await import('../views/ProjectsGames.js');
            
            // Store module references
            this.views = {
                home: homeModule.default,
                about: aboutModule.default,
                contact: contactModule.default,
                notFound: notFoundModule.default,
                projects42: projects42Module.default,
                projectsWeb: projectsWebModule.default,
                projectsMobile: projectsMobileModule.default,
                projectsGames: projectsGamesModule.default
            };
            
            console.log("View modules loaded");
        } 
        catch (error) 
        {
            console.error("Error loading view modules:", error);
        }
    }
    
    /**
     * Navigate to specific page or subpage
     * @param {string} page - Page name (home, about, contact, projects)
     * @param {string} subpage - Optional subpage name (42, web, mobile, games)
     */
    navigateTo(page, subpage = null) 
    {
        // Handle project sub-routes
        if (page === 'projects' && subpage) 
        {
            this.navigateToProjectSubpage(subpage);
            return this;
        }
        
        // Handle main page navigation
        const pageContentName = page + 'Content';
        if (!this.pageGroups[pageContentName] && page !== '404') 
        {
            console.warn(`Page ${page} not found, showing 404`);
            return this.navigateTo('404');
        }
        
        if (page === '404') 
        {
            this.hideAllMainPages();
            if (!this.initialized.notFound) 
            {
                this.init404Page();
            }
            this.pageGroups.notFound404Content.visible = true;
            this.currentPage = '404';
            this.currentSubpage = null;
            
            this.contentGroup.sortChildren();
            this.app.renderer.render(this.app.stage);
            
            console.log("Navigated to 404 page");
            return this;
        }

        // Hide all main page contents
        this.hideAllMainPages();
        
        // Initialize the page if needed
        if (!this.initialized[page]) 
        {
            this.initPage(page);
        }
        
        // Show the requested page
        this.pageGroups[page + 'Content'].visible = true;
        this.currentPage = page;
        this.currentSubpage = null;
        
        // Force sorting and rendering
        this.contentGroup.sortChildren();
        this.app.renderer.render(this.app.stage);
        
        console.log(`Navigated to ${page} page`);
        return this;
    }
    
    /**
     * Navigate to project subpage
     * @param {string} subpage - Subpage name (42, web, mobile, games)
     */
    navigateToProjectSubpage(subpage) 
    {
        const subpageKey = 'projects' + subpage.charAt(0).toUpperCase() + subpage.slice(1);
        const subpageContentName = subpageKey + 'Content';
        
        if (!this.pageGroups[subpageContentName]) 
        {
            console.warn(`Project subpage ${subpage} not found`);
            return this.navigateTo('projects');
        }
        
        // Hide all main pages
        this.hideAllMainPages();
        
        // Show projects main container
        this.pageGroups.projectsContent.visible = true;
        
        // Hide all project subpages
        this.hideAllProjectSubpages();
        
        // Initialize the subpage if needed
        if (!this.initialized[subpageKey]) 
        {
            this.initProjectSubpage(subpage, subpageKey);
        }
        
        // Show the requested subpage
        this.pageGroups[subpageContentName].visible = true;
        this.currentPage = 'projects';
        this.currentSubpage = subpage;
        
        // Force sorting and rendering
        this.contentGroup.sortChildren();
        this.pageGroups.projectsContent.sortChildren();
        this.app.renderer.render(this.app.stage);
        
        console.log(`Navigated to projects/${subpage} subpage`);
        return this;
    }
    
    /**
     * Hide all main page containers
     */
    hideAllMainPages() 
    {
        const mainPages = ['homeContent', 'aboutContent', 'contactContent', 'projectsContent', 'notFound404Content'];
        mainPages.forEach(pageName => {
            if (this.pageGroups[pageName]) 
            {
                this.pageGroups[pageName].visible = false;
            }
        });
    }
    
    /**
     * Hide all project subpage containers
     */
    hideAllProjectSubpages() 
    {
        const subPages = ['projects42Content', 'projectsWebContent', 'projectsMobileContent', 'projectsGamesContent'];
        subPages.forEach(subPageName => {
            if (this.pageGroups[subPageName]) 
            {
                this.pageGroups[subPageName].visible = false;
            }
        });
    }
    
    /**
     * Initialize page content if not already initialized
     * @param {string} page - Page name to initialize
     */
    initPage(page) 
    {
        if (this.initialized[page]) 
        {
            return;
        }
        
        console.log(`Initializing ${page} page content`);
        
        const container = this.pageGroups[page + 'Content'];
        
        // Call the appropriate view file function
        switch (page) 
        {
            case 'home':
                // Home content is already handled by GameInitializer
                break;
            case 'about':
                if (this.views.about) 
                {
                    this.views.about(container, this.app, this.assetManager);
                }
                break;
            case 'contact':
                if (this.views.contact) 
                {
                    this.views.contact(container, this.app, this.assetManager);
                }
                break;
            case 'projects':
                this.initProjectsOverview(container);
                break;
            case '404':
                // Already handled in navigateTo method
                break;
            default:
                console.warn(`No initialization method for ${page}`);
                return;
        }
        
        // Mark as initialized
        this.initialized[page] = true;
    }
    
    /**
     * Initialize project subpage content
     * @param {string} subpage - Subpage name (42, web, mobile, games)
     * @param {string} subpageKey - Internal key (projects42, projectsWeb, etc.)
     */
    initProjectSubpage(subpage, subpageKey) 
    {
        if (this.initialized[subpageKey]) 
        {
            return;
        }
        
        console.log(`Initializing projects/${subpage} subpage content`);
        
        const container = this.pageGroups[subpageKey + 'Content'];
        const viewKey = 'projects' + subpage.charAt(0).toUpperCase() + subpage.slice(1);
        
        // Call the appropriate view file function
        if (this.views[viewKey]) 
        {
            this.views[viewKey](container, this.app);
        }
        else 
        {
            console.warn(`No view module found for ${viewKey}`);
        }
        
        // Mark as initialized
        this.initialized[subpageKey] = true;
    }
    
    /**
     * Initialize main Projects page with overview
     */
    initProjectsOverview(container) 
    {
        const title = new PIXI.Text("My Projects", {
            fontFamily: "Honk, serif",
            fontSize: 40,
            fill: 0xffcc33
        });
        title.anchor.set(0.5, 0);
        title.position.set(this.app.screen.width / 2, 100);
        container.addChild(title);
        
        const subtitle = new PIXI.Text("Choose a category from the dropdown menu above", {
            fontFamily: "Arial",
            fontSize: 18,
            fill: 0xffffff
        });
        subtitle.anchor.set(0.5, 0.5);
        subtitle.position.set(this.app.screen.width / 2, 200);
        container.addChild(subtitle);
    }
    
    /**
     * Handle window resize events
     */
    onResize() 
    {
        // For now, just re-initialize current page if needed
        // Each view file should handle its own responsive behavior
        console.log("Resize event - delegating to view files");
    }
    /**
     * Initialize 404 page with animated player
     */
    init404Page() 
    {
        if (this.initialized.notFound) 
        {
            return;
        }
        
        // Clear the about container to use it for 404
        const container = this.pageGroups.notFound404Content;
        container.removeChildren();
        
        // Call the 404 view function
        if (this.views.notFound) 
        {
            this.views.notFound(container, this.app, this.assetManager);
        }
        
        // Mark as initialized
        this.initialized.notFound = true;
    }
    /**
     * Clean up resources 
     */
    destroy() 
    {
        window.removeEventListener('resize', this.onResize.bind(this));
        console.log("ContentManager destroyed");
    }
}

/**
 * Create and initialize a ContentManager
 * @param {PIXI.Application} app - Pixi application
 * @param {PIXI.Container} contentGroup - Content group container
 * @param {Object} pageGroups - Object containing page containers
 * @returns {ContentManager} Initialized ContentManager
 */
export function createContentManager(app, contentGroup, pageGroups, assetManager) 
{
    return new ContentManager(app, contentGroup, pageGroups, assetManager).init();
}