// main.js - Pixi.js based content rendering with hash routing including project sub-routes

import { SwordButtonComponent, createSwordButton } from './components/SwordButtonComponent.js';
import { getSceneManager, initSceneManager } from './manager/SceneManager.js';
import { LoadingManager } from './loading/LoadingManager.js';
import { CloudsManager } from './manager/CloudsManager.js';

// Store global reference to LoadingManager
let globalLoadingManager;

// Define route titles including project sub-routes
const routes = 
{
    "#/": { title: "Home - Hugo Marta" },
    "#/about": { title: "About - Hugo Marta" },
    "#/contact": { title: "Contact - Hugo Marta" },
    "#/projects": { title: "Projects - Hugo Marta" },
    "#/projects/42": { title: "42 Projects - Hugo Marta" },
    "#/projects/web": { title: "Web Projects - Hugo Marta" },
    "#/projects/mobile": { title: "Mobile Projects - Hugo Marta" },
    "#/projects/games": { title: "Game Projects - Hugo Marta" },
    "#/404": { title: "Page Not Found - Hugo Marta" }
};

// Function to get current hash or default to home
function getCurrentHash() 
{
    return window.location.hash || "#/";
}

// Function to parse route and determine page/subpage
function parseRoute(hash) 
{
    const path = hash.replace('#/', '');
    const segments = path.split('/');
    
    if (segments.length === 0 || segments[0] === '') 
    {
        return { page: 'home', subpage: null };
    }
    
    if (segments[0] === 'projects' && segments[1]) 
    {
        return { page: 'projects', subpage: segments[1] };
    }
    
    return { page: segments[0], subpage: null };
}

// Function to navigate between pages - WITH PROJECT SUB-ROUTES AND SCROLL TO TOP
function navigateTo(hash) 
{
    // Ensure hash starts with #/
    const path = hash.startsWith('#/') ? hash : 
                 hash.startsWith('/') ? `#${hash}` : 
                 hash === '#' ? '#/' : `#/${hash}`;
    
    // Get the route info
    const route = routes[path] || routes["#/404"];
    
    // Update page title
    document.title = route.title;
    
    // Update URL in browser using hash
    window.location.hash = path;
    
    // Parse the route to get page and subpage
    const { page, subpage } = parseRoute(path);

    let targetPage = page;
    if (!routes[path]) 
    {
        targetPage = '404';
    }
    
    // SCROLL TO TOP - Multiple methods for cross-browser compatibility
    // Method 1: Modern browsers
    if (window.scrollTo) 
    {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth' // Smooth scroll animation
        });
    }
    
    // Method 2: Fallback for older browsers
    try 
    {
        document.documentElement.scrollTop = 0; // Modern browsers
        document.body.scrollTop = 0; // Safari
    } 
    catch (error) 
    {
        console.warn("Scroll to top failed:", error);
    }
    
    // Method 3: Additional fallback
    if (document.scrollingElement) 
    {
        document.scrollingElement.scrollTop = 0;
    }
    
    // Use ContentManager to switch to this page
    if (window.contentManager) 
    {
        // Navigate to main page or subpage
        if (subpage) 
        {
            window.contentManager.navigateTo(targetPage, subpage);
        } 
        else 
        {
            window.contentManager.navigateTo(targetPage);
        }
        
        // Force app stage sorting and rendering
        if (window.app) 
        {
            window.app.stage.sortChildren();
            window.app.renderer.render(window.app.stage);
        }
    }
    else 
    {
        console.warn("ContentManager not initialized yet");
    }
    
    // Highlight active nav link
    updateActiveNavLink();
}

// Update active nav link (including dropdown items)
function updateActiveNavLink() 
{
    const currentHash = getCurrentHash();
    const { page, subpage } = parseRoute(currentHash);
    
    // Handle main navigation links
    document.querySelectorAll('.nav-link').forEach(link => 
    {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Convert href to hash format if needed
        const linkHash = href.startsWith('#') ? href : 
                       href === '/' ? '#/' : `#${href}`;
        
        if (linkHash === currentHash) 
        {
            link.classList.add('active');
        } 
        else 
        {
            link.classList.remove('active');
        }
    });
    
    // Handle dropdown items for projects
    document.querySelectorAll('.dropdown-item').forEach(item => 
    {
        const href = item.getAttribute('href');
        if (!href) return;
        
        const linkHash = href.startsWith('#') ? href : `#${href}`;
        
        if (linkHash === currentHash) 
        {
            item.classList.add('active');
            // Also mark the parent dropdown as active
            const parentDropdown = item.closest('.nav-item.dropdown');
            if (parentDropdown) 
            {
                const dropdownToggle = parentDropdown.querySelector('.nav-link.dropdown-toggle');
                if (dropdownToggle) 
                {
                    dropdownToggle.classList.add('active');
                }
            }
        } 
        else 
        {
            item.classList.remove('active');
        }
    });
}

// Handle clicks on links (including dropdown items)
document.addEventListener('click', e => 
{
    const link = e.target.closest("[data-link]");
    if (link) 
    {
        e.preventDefault();
        // Get the hash from the link
        const hash = link.getAttribute('href');
        // Navigate to the hash (will include scroll to top)
        navigateTo(hash);
    }
});

// Handle hash changes (back/forward buttons, reload)
window.addEventListener('hashchange', () => 
{
    // Get the hash from the URL
    const hash = getCurrentHash();
    // Navigate to the hash (will include scroll to top)
    navigateTo(hash);
});

// Function to setup project dropdown links
function setupProjectDropdown() 
{
    // Update project dropdown items to use proper routes
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (dropdownMenu) 
    {
        dropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="#/projects/42" data-link>42 Projects</a></li>
            <li><a class="dropdown-item" href="#/projects/web" data-link>Web</a></li>
            <li><a class="dropdown-item" href="#/projects/mobile" data-link>Mobile</a></li>
            <li><a class="dropdown-item" href="#/projects/games" data-link>Games</a></li>
        `;
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => 
{
    // Initialize existing components
    const swordButton = createSwordButton();
    const loadingManager = new LoadingManager();
    
    // Store global reference
    globalLoadingManager = loadingManager;
    
    // Override the onLoadingComplete method to integrate with navigation
    const originalOnLoadingComplete = loadingManager.onLoadingComplete.bind(loadingManager);
    loadingManager.onLoadingComplete = function() 
    {
        // Call the original method first
        originalOnLoadingComplete();
        // After the original method completes, initialize navigation
        setTimeout(() => 
        {
            // Setup project dropdown
            setupProjectDropdown();
            
            // Initialize navigation after LoadingManager finishes
            const initialHash = getCurrentHash();
            navigateTo(initialHash);
        }, 1500);
    };
    
    // Update navigation links to use hash format
    document.querySelectorAll('a[data-link]').forEach(link => 
    {
        const href = link.getAttribute('href');
        // Convert href to hash format if needed
        if (!href.startsWith('#')) 
        {
            const newHref = href === '/' ? '#/' : `#${href}`;
            link.setAttribute('href', newHref);
        }
    });
    
    // Start loading
    loadingManager.start();
});