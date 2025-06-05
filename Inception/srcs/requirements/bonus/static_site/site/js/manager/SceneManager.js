import { createParallaxEffect } from './ParallaxEffect.js';
import { lerp, boundValue } from '../utils/MathUtils.js';

export class SceneManager 
{
	constructor(assetManager,  cloudsManager) 
	{
		// PIXI references - will be set by setBackgroundGroup
		this.app = null;
		this.backgroundGroup = null;
		this.assetManager = assetManager;
		this.cloudsManager = cloudsManager;
		// Layer containers
		this.layers = {};
		this.parallaxEffect = null;
		
		// Theme state
		this.currentTheme = localStorage.getItem('theme') || 'light';
		
		// Layer configuration with parallax speeds
		this.layerConfig = [
			{ id: 'background', speed: 0.0, zIndex: -11 },
			{ id: 'mountain', speed: 0.0, zIndex: -10 },
			{ id: 'clouds', speed: 0.02, zIndex: -9 },
			{ id: 'moon', speed: 0.02, zIndex: -9 },
			{ id: 'castle', speed: 0.03, zIndex: -1 },
			{ id: 'field7', speed: -0.2, zIndex: -8 },
			{ id: 'field6', speed: -0.1, zIndex: -7 },
			{ id: 'field5', speed: 0.08, zIndex: -6 },
			{ id: 'field4', speed: -0.07, zIndex: -5 },
			{ id: 'field3', speed: 0.06, zIndex: -4 },
			{ id: 'field2', speed: -0.1, zIndex: -3 },
			{ id: 'field1', speed: 0.09, zIndex: -2 }
		];
		
		// Set up theme toggle button
		this.setupThemeToggle();
		
		// Resize listener to update scaling when window size changes
		window.addEventListener('resize', this.handleResize.bind(this));
	}

	setCloudsManager(cloudsManager) 
	{
		this.cloudsManager = cloudsManager;
	}

	// Set the PIXI background group and app references
	setBackgroundGroup(backgroundGroup, app) 
	{
		this.backgroundGroup = backgroundGroup;
		this.app = app;
		
		// Initialize the PIXI background
		this.createPixiScene();
		
		// Apply the current theme
		this.applyTheme(this.currentTheme);
		
		return this;
	}
	
	// Create the PIXI scene with all background layers
	createPixiScene() 
	{
		if (!this.backgroundGroup || !this.app) 
		{
			console.error("PIXI background group or app not set. Call setBackgroundGroup first.");
			return;
		}
		
		// Clear existing layers if any
		this.backgroundGroup.removeChildren();
		this.layers = {};
		this.backgroundGroup.sortableChildren = true;
		
		// Create each layer based on the configuration
		this.layerConfig.forEach(config => {
			const container = new PIXI.Container();
			container.name = config.id;
			container.zIndex = config.zIndex;
			
			// Store the speed for parallax effect
			container.parallaxSpeed = config.speed;
			
			// Add to background group
			this.backgroundGroup.addChild(container);
			
			// Store reference
			this.layers[config.id] = container;
		});
		
		this.backgroundGroup.position.set(0, 0);
	}
	
	// Apply a theme to the scene
	applyTheme(theme) 
	{
		if (!this.backgroundGroup || !this.app) 
		{
			console.warn("PIXI not initialized yet, skipping theme application");
			return;
		}
		
		// Check if AssetManager is available
		if (!this.assetManager) 
		{
			console.error("AssetManager not available");
			return;
		}
		
		// First, make all layers visible
		for (const [id, container] of Object.entries(this.layers)) 
		{
			container.visible = true;
		}
		
		// Set up the base background (color or image)
		this.setupBackground(theme);
		
		// Apply textures to each layer
		for (const [id, container] of Object.entries(this.layers)) 
		{
			// Skip the background layer, it's handled separately
			if (id === 'background' || id === 'clouds') 
			{
				continue;
			}
			
			// Skip clouds in dark theme
			if (id === 'clouds' && theme === 'dark') 
			{
				container.visible = false;
				continue;
			}
			
			// Skip moon in light theme
			if (id === 'moon' && theme === 'light') 
			{
				container.visible = false;
				continue;
			}
			
			// Clear existing sprites
			container.removeChildren();
			
			// Get the texture for this layer
			const texture = this.assetManager.getBackgroundTexture(theme, id);
			if (texture) 
			{
				const sprite = new PIXI.Sprite(texture);
				// Add to container without setting dimensions yet
				container.addChild(sprite);
			} 
			else 
			{
				console.warn(`No texture found for layer ${id} in theme ${theme}`);
			}
		}
		
		// Apply scaling to all layers to maintain 2:1 aspect ratio
		this.applyBackgroundScaling();
		
		// Apply special effects for certain layers
		this.applySpecialEffects(theme);

		// Update the cloud system if available
		if (this.cloudsManager) 
		{
			if (theme === 'light') 
			{
				this.cloudsManager.init(theme);
			} 
			else 
			{
				this.cloudsManager.hideAllClouds();
			}
		}

		// Update current theme
		this.currentTheme = theme;
		localStorage.setItem('theme', theme);
		
		// Update the toggle button
		const themeToggle = document.getElementById('theme-toggle');
		if (themeToggle) 
		{
			themeToggle.textContent = theme === 'light' ? '🌚' : '🌞';
		}
	}
	
	// Set up the background layer (color or image)
	setupBackground(theme) 
	{
		const backgroundContainer = this.layers['background'];
		if (!backgroundContainer) return;
		
		// Clear existing content
		backgroundContainer.removeChildren();
		
		// Create appropriate background based on theme
		if (theme === 'dark') 
		{
			// Try to get background texture for dark theme
			const bgTexture = this.assetManager.getBackgroundTexture('dark', 'background');
			
			if (bgTexture) 
			{
				// Create sprite with the texture
				const bgSprite = new PIXI.Sprite(bgTexture);
				this.setupBackgroundSprite(bgSprite);
				backgroundContainer.addChild(bgSprite);
			} 
			else 
			{
				// Create a colored rectangle as fallback
				this.createColorBackground(backgroundContainer, 0x191970); // Midnight blue
			}
		} 
		else 
		{
			// For light theme
			const bgTexture = this.assetManager.getBackgroundTexture('light', 'background');
			
			if (bgTexture) 
			{
				// If we have a texture, use it
				const bgSprite = new PIXI.Sprite(bgTexture);
				this.setupBackgroundSprite(bgSprite);
				backgroundContainer.addChild(bgSprite);
			} 
			else 
			{
				// Create a colored rectangle as fallback
				this.createColorBackground(backgroundContainer, 0x87CEEB); // Sky blue
			}
		}
		
		// Apply also to CSS for fallback
		document.documentElement.style.setProperty('--bg-color', theme === 'light' ? '#87CEEB' : '#191970');
		document.documentElement.style.setProperty('--bg-image', theme === 'dark' ? 'url(assets/images/background/dark/background_night.webp)' : 'none');
		
		// Force background visibility
		setTimeout(() => {
			const bgContainer = this.layers['background'];
			bgContainer.visible = true;
			bgContainer.alpha = 1;
			bgContainer.children.forEach(child => {
				child.visible = true;
				child.alpha = 1;
				child.zIndex = -999;
			});
		}, 500);
	}
	
	// Helper to setup background sprite sizing
	setupBackgroundSprite(sprite) 
	{
		// Apply consistent sizing and positioning
		sprite.width = this.app.screen.width;
		sprite.height = Math.max(this.app.screen.height * 3, this.app.screen.width * 2);
		
		// Set the anchor point for proper positioning
		sprite.anchor.set(0.5, 0);
		sprite.position.set(this.app.screen.width / 2, 0);
	}

	// Create a solid color background
	createColorBackground(container, color) 
	{
		const colorTexture = PIXI.Texture.WHITE;
		const bgSprite = new PIXI.Sprite(colorTexture);
		
		bgSprite.tint = color;
		
		// Cover the entire viewable area with extra margin
		bgSprite.width = this.app.screen.width * 1.2;
		bgSprite.height = this.app.screen.height * 3;
		
		// Position at center of screen
		bgSprite.anchor.set(0.5, 0);
		bgSprite.position.set(this.app.screen.width / 2, 0);
		
		// Ensure this sprite stays behind everything
		bgSprite.zIndex = -9999;
		
		container.addChild(bgSprite);
		return bgSprite;
	}
	
	// Apply special visual effects to certain layers
	applySpecialEffects(theme)
	{
		if (theme === 'dark' && this.layers['moon']) 
		{
			const moonContainer = this.layers['moon'];
			
			if (moonContainer.children.length > 0) 
			{
				const moonSprite = moonContainer.children[0];
				const originalY = moonSprite.position.y;
				
				// Clean up previous effects
				if (moonSprite.glowEffects) 
				{
					moonSprite.glowEffects.forEach(effect => {
						if (effect.parent) effect.parent.removeChild(effect);
					});
				}
				
				// Initialize glow effects array
				moonSprite.glowEffects = [];
				
				// Configure glow layers
				const glowLayers = [
					{ scale: 1.01, alpha: 0.15 }, // First layer (closest)
					{ scale: 1.015, alpha: 0.1 },  // Middle layer
					{ scale: 1.02, alpha: 0.05 }  // Outer layer
				];
				
				moonSprite.glowLayers = glowLayers;
				
				// Get moon anchor points
				const moonAnchorX = moonSprite.anchor.x;
				const moonAnchorY = moonSprite.anchor.y;
				
				// Create each glow layer
				glowLayers.forEach(setting => {
					const glowSprite = new PIXI.Sprite(moonSprite.texture);
					
					// Match moon anchor points
					glowSprite.anchor.set(moonAnchorX, moonAnchorY);
					
					// Set initial scale based on configuration
					glowSprite.scale.set(
						moonSprite.scale.x * setting.scale,
						moonSprite.scale.y * setting.scale
					);
					
					// Configure appearance
					glowSprite.alpha = setting.alpha;
					glowSprite.tint = 0xFFFFFF;
					
					// Add to container behind moon
					moonContainer.addChildAt(glowSprite, 0);
					moonSprite.glowEffects.push(glowSprite);
				});
				
				// Animation function
				const animate = (delta) => {
					const time = performance.now() / 1000;
					
					// Moon floating animation
					moonSprite.position.y = originalY + Math.sin(time * 0.4) * 10;
					
					// Animate glow layers
					if (moonSprite.glowEffects && moonSprite.glowEffects.length) 
					{
						const layers = moonSprite.glowLayers;
						
						moonSprite.glowEffects.forEach((glow, index) => {
							// Position glow layers
							glow.position.x = moonSprite.position.x;
							glow.position.y = moonSprite.position.y;
							
							// Create phase offset for each layer
							const phaseOffset = index * 0.3;
							
							// Pulsing effect
							const pulse = (Math.sin((time + phaseOffset) * 0.6) + 1) / 2;
							
							// Adjust opacity with pulse
							const baseAlpha = layers[index].alpha;
							glow.alpha = baseAlpha * (0.5 + pulse * 0.4);
							
							// Apply uniform scale with pulsing variation
							const baseScale = layers[index].scale;
							const scaleVariation = 1 + (pulse * 0.025);
							glow.scale.set(
								moonSprite.scale.x * baseScale * scaleVariation,
								moonSprite.scale.y * baseScale * scaleVariation
							);
						});
					}
				};
				
				// Remove previous animation if exists
				if (moonSprite.moonAnimation) 
				{
					this.app.ticker.remove(moonSprite.moonAnimation);
				}
				
				// Add animation to ticker
				this.app.ticker.add(animate);
				moonSprite.moonAnimation = animate;
			}
		} 
		else if (theme === 'light') 
		{
			// Clean up any moon effects when in light theme
			const moonContainer = this.layers['moon'];
			if (moonContainer && moonContainer.children.length > 0) 
			{
				const moonSprite = moonContainer.children[0];
				
				if (moonSprite && moonSprite.glowEffects) 
				{
					moonSprite.glowEffects.forEach(effect => {
						if (effect.parent) effect.parent.removeChild(effect);
					});
					moonSprite.glowEffects = [];
				}
				
				if (moonSprite && moonSprite.moonAnimation) 
				{
					this.app.ticker.remove(moonSprite.moonAnimation);
					moonSprite.moonAnimation = null;
				}
			}
		}
	}

	// Setup the theme toggle button
	setupThemeToggle()
	{
		const themeToggleDesktop = document.getElementById('theme-toggle');
		const themeToggleMobile = document.getElementById('theme-toggle-mobile');
		
		// Function to update button text
		const updateToggleText = (theme) => {
			const newText = theme === 'light' ? '🌚' : '🌞';
			if (themeToggleDesktop) themeToggleDesktop.textContent = newText;
			if (themeToggleMobile) themeToggleMobile.textContent = newText;
		};
		
		// Set initial text based on current theme
		updateToggleText(this.currentTheme);
		
		// Add click event to desktop button
		if (themeToggleDesktop) 
		{
			themeToggleDesktop.addEventListener('click', () => {
				this.toggleTheme();
			});
		}
		
		// Add click event to mobile button
		if (themeToggleMobile) 
		{
			themeToggleMobile.addEventListener('click', () => {
				this.toggleTheme();
			});
		}
	}

	// Toggle between light and dark themes
	toggleTheme()
	{
		// Toggle theme
		const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
		
		// Store the new theme in localStorage
		localStorage.setItem('theme', newTheme);
		
		// Apply the new theme to PIXI scene
		try 
		{
			this.applyTheme(newTheme);
		} 
		catch (error) 
		{
			console.error("Error applying PIXI theme:", error);
		}
		
		// Update the toggle buttons
		const themeToggleDesktop = document.getElementById('theme-toggle');
		const themeToggleMobile = document.getElementById('theme-toggle-mobile');
		
		const newText = newTheme === 'light' ? '🌚' : '🌞';
		if (themeToggleDesktop) themeToggleDesktop.textContent = newText;
		if (themeToggleMobile) themeToggleMobile.textContent = newText;
		
		// Apply theme to body for CSS styling
		document.body.setAttribute('data-theme', newTheme);
		
		// Update clouds if CloudsManager exists
		if (this.cloudsManager) 
		{
			try 
			{
				if (typeof this.cloudsManager.init === 'function') 
				{
					this.cloudsManager.init(newTheme);
				} 
				else if (typeof this.cloudsManager.refreshClouds === 'function') 
				{
					this.cloudsManager.refreshClouds();
				}
			} 
			catch (error) 
			{
				console.warn("Error refreshing clouds:", error);
			}
		}
	}
	
	// Initialize parallax effect
	initParallax() 
	{
		// Set up the mouse move and scroll event handlers
		this.setupParallaxEvents();
	}
	
	// Set up event handlers for parallax effects
	setupParallaxEvents()
	{
		if (!this.app)
		{
			return;
		}
		
		// Store movement targets
		this.parallaxTargets = {};
		
		// Initialize all layers with zero offset
		for (const [id, container] of Object.entries(this.layers)) 
		{
			this.parallaxTargets[id] = {
				x: 0,
				y: 0,
				scrollY: 0,
				// Store the original position
				originalX: container.position.x,
				originalY: container.position.y
			};
		}
		
		// Mouse movement handler
		window.addEventListener('mousemove', (e) => {
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;
			
			for (const [id, container] of Object.entries(this.layers)) 
			{
				// Skip background
				if (id === 'background' || !container.visible) 
				{
					continue;
				}
				
				const speed = container.parallaxSpeed || 0;
				const mouseIntensity = 0.3;
				
				// Calculate offsets
				const targetX = (e.clientX - centerX) * speed * mouseIntensity;
				const targetY = (e.clientY - centerY) * speed * mouseIntensity;
				
				// Store targets
				this.parallaxTargets[id].targetX = boundValue(targetX, -80, 80);
				this.parallaxTargets[id].targetY = boundValue(targetY, -80, 80);
			}
		});
		
		// Scroll handler with more impactful effect
		const handleScroll = () => {
			// Get scroll position
			const scrolled = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
			
			for (const [id, container] of Object.entries(this.layers)) 
			{
				// Skip background or invisible layers
				if (id === 'background' || !container.visible) 
				{
					continue;
				}
				
				// Get parallax speed or default to zero
				const speed = container.parallaxSpeed || 0;
				
				// Skip layers with zero speed
				if (speed === 0) continue;
				
				// Calculate offset for scroll effect
				const yOffset = -scrolled * speed * 1.0;
				
				// Apply scroll effect to target
				this.parallaxTargets[id].targetScrollY = yOffset;
			}
		};
		
		// Add event listeners
		window.addEventListener('scroll', handleScroll, { passive: true });
		document.addEventListener('DOMContentLoaded', handleScroll);
		window.addEventListener('resize', handleScroll);
		
		// Force initial update
		setTimeout(handleScroll, 100);
		
		// Increase ticker priority for smoother parallax
		this.app.ticker.add(this.updateParallax.bind(this), null, PIXI.UPDATE_PRIORITY.HIGH);
	}

	// Update parallax positions on each frame
	updateParallax() 
	{
		if (!this.parallaxTargets) 
		{
			return;
		}
		
		const smoothFactor = 0.1;
		
		for (const [id, container] of Object.entries(this.layers)) 
		{
			// Skip background
			if (id === 'background') 
			{
				continue;
			}
			
			const target = this.parallaxTargets[id];
			
			// Skip if no target data
			if (!target) 
			{
				continue;
			}
			
			// Initialize values if needed
			if (target.x === undefined) target.x = 0;
			if (target.y === undefined) target.y = 0;
			if (target.targetX === undefined) target.targetX = 0;
			if (target.targetY === undefined) target.targetY = 0;
			if (target.targetScrollY === undefined) target.targetScrollY = 0;
			
			// Smoothly interpolate to target values
			target.x = lerp(target.x, target.targetX, smoothFactor);
			target.y = lerp(target.y, target.targetScrollY + target.targetY, smoothFactor);
			
			// Apply the transform to the PIXI container
			container.position.x = (target.originalX || 0) + target.x;
			container.position.y = (target.originalY || 0) + target.y;
		}
	}

	// Apply scaling to maintain 2:1 ratio for all devices
	applyBackgroundScaling() 
	{
		const screenWidth = this.app.screen.width;
		
		// Track maximum layer height
		let maxLayerHeight = 0;
		
		// Calculate content height based on actual textures
		for (const [id, container] of Object.entries(this.layers)) 
		{
			for (let i = 0; i < container.children.length; i++) 
			{
				const child = container.children[i];
				
				if (child instanceof PIXI.Sprite) 
				{
					// Calculate original image ratio
					let originalRatio = 2; // Fallback
					if (child.texture && child.texture.width && child.texture.height) 
					{
						originalRatio = child.texture.width / child.texture.height;
					}
					
					// Apply contain sizing
					let newWidth = screenWidth;
					let newHeight = screenWidth / originalRatio;
					
					// Apply dimensions
					child.width = newWidth;
					child.height = newHeight;
					
					// Center horizontally
					child.anchor.set(0.5, 0);
					child.position.x = screenWidth / 2;
					
					// Track maximum height
					if (newHeight > maxLayerHeight) 
					{
						maxLayerHeight = newHeight;
					}
				}
			}
		}
		
		// Adjust DOM elements dynamically
		if (maxLayerHeight > 0) 
		{
			// Adjust scene height to contain image
			const sceneElement = document.getElementById('main-scene');
			if (sceneElement) 
			{
				sceneElement.style.height = maxLayerHeight + 'px';
			}
			
			if (this.app && this.app.renderer) 
			{
				this.app.renderer.resize(this.app.screen.width, maxLayerHeight);
			}
			
			// Position game-container in lower half
			const gameContainer = document.getElementById('game-container');
			if (gameContainer) 
			{
				const halfHeight = maxLayerHeight / 2;
				gameContainer.style.top = halfHeight + 'px';
				gameContainer.style.height = halfHeight + 'px';
			}
			
			// Adjust footer position
			const footer = document.querySelector('footer');
			if (footer && sceneElement) 
			{
				if (window.innerWidth <= 768) 
				{
					// Extra margin for small screens
					footer.style.marginTop = (maxLayerHeight + 50) + 'px';
				} 
				else 
				{
					// Normal margin for larger screens
					footer.style.marginTop = maxLayerHeight + 'px';
				}
			}
			
			document.body.style.minHeight = (maxLayerHeight) + 'px';
		}
	}
	
	// Handle window resize events
	onResize(width, height) 
	{
		if (!this.app || !this.backgroundGroup) 
		{ 
			return;
		}
		
		// Update renderer dimensions
		if (this.app.renderer) 
		{
			this.app.renderer.resize(width, height);
		}
		
		// Apply background scaling
		this.applyBackgroundScaling();
	}

	// Handle window resize events to update scaling
	handleResize() 
	{
		// Skip if not initialized yet
		if (!this.app || !this.backgroundGroup) 
		{
			return;
		}
		
		// Update PIXI renderer size
		this.app.renderer.resize(window.innerWidth, window.innerHeight);
		
		// Update scene scaling
		this.applyBackgroundScaling();
		
		// Update parallax targets if they exist
		if (this.parallaxTargets) 
		{
			// Reset targets to avoid jumps
			for (const [id, target] of Object.entries(this.parallaxTargets)) 
			{
				if (target) 
				{
					target.targetX = 0;
					target.targetY = 0;
					target.targetScrollY = 0;
				}
			}
		}

		// Handle navbar behavior on resize
		const navbarCollapse = document.getElementById('navbarSupportedContent');
		const navbarToggler = document.querySelector('.navbar-toggler');
		
		if (navbarCollapse && navbarToggler) 
		{
			// Force menu to show on larger screens
			if (window.innerWidth > 768) 
			{
				navbarCollapse.classList.add('show');
				navbarToggler.setAttribute('aria-expanded', 'true');
			}
		}
	}
}

// Function to initialize the SceneManager
export function getSceneManager(assetManager) 
{
	if (!window.sceneManager) 
	{
		window.sceneManager = new SceneManager(assetManager);
	}
	return window.sceneManager;
}


export function initSceneManager(assetManager) 
{
	return getSceneManager(assetManager);
}