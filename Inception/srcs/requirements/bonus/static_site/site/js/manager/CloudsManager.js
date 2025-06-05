
import { lerp, boundValue } from '../utils/MathUtils.js';

/**
 * CloudsManager.js for PixiJS
 * Creates and manages cloud sprites with custom animations
 */
export class CloudsManager {
	constructor(app, backgroundGroup, assetManager, sceneManager) 
	{
		// Store PixiJS references
		this.app = app;
		this.backgroundGroup = backgroundGroup;
		this.assetManager = assetManager;
		this.sceneManager = sceneManager;
		// Cloud container
		this.cloudsContainer = new PIXI.Container();
		this.cloudsContainer.name = 'clouds';
		this.cloudsContainer.position.set(0, 0);
		this.cloudsContainer.zIndex = -9;
		// Add to background group if available
		if (this.backgroundGroup) 
		{
			this.backgroundGroup.addChild(this.cloudsContainer);
		}
		// Cloud settings
		this.config = {
			minClouds: 3,
			maxClouds: 10,
			minDistance: 100,
			containerHeight: this.getSceneHeight(),
			minScale: 0.5,
			maxScale: 2.5,
			spritesheetName: 'clouds_spritesheet'
		};
		// Animation type probabilities
		this.animationTypes = [
			'driftLeftToRight',
			'driftRightToLeft',
			'driftDiagonalUp',
			'driftSlow'
		];
		// Animation speeds (matching CSS classes)
		this.formationSpeeds = [
			{ formationTime: 4000, driftDelay: 0 },
			{ formationTime: 5000, driftDelay: 1000 },
			{ formationTime: 6000, driftDelay: 2000 }
		];
		// Opacity levels 
		this.opacityLevels = [
			0.2,
			0.3,
			0.5,
			0.7,
			0.8 
		];
		// Collection of active cloud sprites
		this.activeCloudSprites = [];
		// Setup flags
		this.initialized = false;
		this.initInProgress = false;
		this.isDestroyed = false;
		// Current theme
		this.currentTheme = document.body.getAttribute('data-theme') || 'light';
	}

	/**
	 * Initialize the clouds manager
	 */
	init(theme) 
	{
		// Prevent multiple simultaneous initialization attempts
		if (this.initInProgress || this.isDestroyed) 
		{
			return;
		}
		// If already initialized, just refresh the clouds
		if (this.initialized) 
		{
			this.refreshClouds();
			return;
		}
		this.initInProgress = true;
		// Check if we have access to the asset manager and app
		if (!this.assetManager || !this.app) 
		{
			console.error('CloudsManager: assetManager or PixiJS app not available');
			this.initInProgress = false;
			return;
		}
		// Verify that the clouds spritesheet is loaded
		const cloudsSpritesheet = this.assetManager.getSpritesheet(this.config.spritesheetName);
		if (!cloudsSpritesheet) 
		{
			console.warn(`CloudsManager: ${this.config.spritesheetName} not found - will retry later`);
			this.initInProgress = false;
			// Set up a retry mechanism
			setTimeout(() => this.init(theme), 2000);
			return;
		}
		// Set current theme from parameter or get from document
		if (theme) 
		{
			this.currentTheme = theme;
		} 
		else 
		{
			this.currentTheme = document.body.getAttribute('data-theme') || 'light';
		}
		
		// Only proceed with cloud creation for light theme
		if (this.currentTheme === 'light') 
		{
			// Create initial clouds
			this.refreshClouds();
			// Set up the cloud lifecycle ticker
			this.startCloudLifecycle();
		} 
		// Set up theme change listener
		this.setupThemeListeners();
		// Listen for window resize
		window.addEventListener('resize', this.onResize.bind(this));
		this.initialized = true;
		this.initInProgress = false;
	}
	
	//Set up theme change listeners
	setupThemeListeners() 
	{
		const themeToggle = document.getElementById('theme-toggle');
		const themeToggleMobile = document.getElementById('theme-toggle-mobile');
		
		if (this.sceneManager) 
		{
			const originalToggleTheme = this.sceneManager.toggleTheme;
			this.sceneManager.toggleTheme = () => {
				originalToggleTheme.call(this.sceneManager);
				
				const newTheme = document.body.getAttribute('data-theme') || 'light';
				
				if (newTheme !== this.currentTheme) 
				{
					this.currentTheme = newTheme;
					
					if (newTheme === 'light')
					{
						this.refreshClouds();
					} 
					else 
					{
						this.hideAllClouds();
					}
				}
			};
			
		}
		const handleThemeToggle = () => {
			setTimeout(() => {
				const newTheme = document.body.getAttribute('data-theme') || 'light';

				if (newTheme !== this.currentTheme) 
				{
					this.currentTheme = newTheme;
					if (newTheme === 'light') 
					{
						this.refreshClouds();
					} 
					else 
					{
						this.hideAllClouds();
					}
				}
			}, 100);
		};
		
		if (themeToggle) 
		{
			themeToggle.addEventListener('click', handleThemeToggle);
		}
		if (themeToggleMobile) 
		{
			themeToggleMobile.addEventListener('click', handleThemeToggle);
		}
	}

	//Hide all clouds - used when switching to dark theme
	hideAllClouds() 
	{
		// Stop the lifecycle interval
		if (this.cloudLifecycleInterval) 
		{
			clearInterval(this.cloudLifecycleInterval);
			this.cloudLifecycleInterval = null;
		}
		// Safely remove all cloud ticker callbacks
		this.activeCloudSprites.forEach(cloud => {
			if (cloud && cloud.tickerCallback) 
			{
				this.app.ticker.remove(cloud.tickerCallback);
				cloud.tickerCallback = null;
			}
		});
		// Clear the container
		if (this.cloudsContainer) 
		{
			this.cloudsContainer.removeChildren();
		}
		// Clear the active sprites array
		this.activeCloudSprites = [];
	}
	
	//Start the cloud lifecycle management
	startCloudLifecycle() 
	{
		// Clear any existing interval first
		if (this.cloudLifecycleInterval) 
		{
			clearInterval(this.cloudLifecycleInterval);
		}
		// Check cloud lifecycle every 5 seconds
		this.cloudLifecycleInterval = setInterval(() => {
			if (this.isDestroyed) 
			{
				clearInterval(this.cloudLifecycleInterval);
				return;
			}
			if (this.initialized && this.currentTheme === 'light') 
			{
				this.manageCloudLifecycle();
			}
		}, 5000);
	}
	
	 //Manage the cloud lifecycle (add/remove as needed)
	manageCloudLifecycle()
	{
		if (!this.cloudsContainer || this.isDestroyed)
		{
			return;
		}
		// Clean up any completed animations
		this.cleanupCompletedClouds();
		// Count current visible clouds
		const visibleCount = this.activeCloudSprites.filter(
			cloud => !cloud.markedForRemoval && cloud.visible
		).length;
		// Determine target number of clouds
		const targetCount = this.config.minClouds + 
			Math.floor(Math.random() * (this.config.maxClouds - this.config.minClouds + 1));
		// Add new clouds if needed
		if (visibleCount < targetCount) 
		{
			const newCount = targetCount - visibleCount;
			this.addNewClouds(newCount);
		}
	}
	
	 //Remove clouds that have completed their animations
	cleanupCompletedClouds() 
	{
		if (this.isDestroyed) 
		{
			return;
		}
		// Filter out clouds marked for removal
		this.activeCloudSprites = this.activeCloudSprites.filter(cloud => {
			if (cloud.markedForRemoval) 
			{
				if (cloud.parent) 
				{
					cloud.parent.removeChild(cloud);
				}
				// Remove ticker callback
				if (cloud.tickerCallback) 
				{
					this.app.ticker.remove(cloud.tickerCallback);
					cloud.tickerCallback = null;
				}
				cloud.destroy({children: true});
				return false;
			}
			return true;
		});
	}
	
	 //Add a batch of new clouds to the scene
	addNewClouds(count) 
	{
		if (!this.cloudsContainer || this.isDestroyed) 
		{
			return;
		}
		// Screen dimensions for distribution
		const screenWidth = window.innerWidth;
		const screenHeight = this.config.containerHeight;
		// Track used positions including existing clouds
		const usedPositions = [];
		// Get positions of existing clouds to avoid overlap
		this.activeCloudSprites.forEach(cloud => {
			if (cloud && cloud.position) 
			{
				usedPositions.push({ 
					top: cloud.position.y, 
					left: cloud.position.x 
				});
			}
		});
		// Add new clouds
		for (let i = 0; i < count && !this.isDestroyed; i++) 
		{
			this.createSingleCloud(screenWidth, screenHeight, usedPositions);
		}
	}
	
	 //Completely refresh all clouds
	refreshClouds() 
	{
		if (this.isDestroyed) 
		{
			return;
		}
		// Only handle light theme
		if (this.currentTheme !== 'light') 
		{
			this.hideAllClouds();
			return;
		}
		// Clear all existing clouds
		this.hideAllClouds();
		// Create new clouds batch
		const cloudCount = this.config.minClouds + 
			Math.floor(Math.random() * (this.config.maxClouds - this.config.minClouds + 1));
		// Screen dimensions for cloud positions
		const screenWidth = window.innerWidth;
		const screenHeight = this.config.containerHeight;
		// Create multiple clouds
		const usedPositions = [];
		for (let i = 0; i < cloudCount && !this.isDestroyed; i++) 
		{
			this.createSingleCloud(screenWidth, screenHeight, usedPositions);
		}
		if (this.debugMode) 
		{
			this.createDebugVisualization();
		}
		// Ensure the lifecycle is running
		this.startCloudLifecycle();
	}
	
	 //Create a single cloud sprite with animation
	createSingleCloud(screenWidth, screenHeight, usedPositions) 
	{
		if (this.isDestroyed) 
		{
			return null;
		}
		// Get the spritesheet
		const cloudsSpritesheet = this.assetManager.getSpritesheet(this.config.spritesheetName);
		if (!cloudsSpritesheet || !cloudsSpritesheet.textures) 
		{
			console.error('CloudsManager: Cannot create cloud - spritesheet not available');
			return null;
		}
		// Get all cloud frames from the spritesheet
		const frames = Object.values(cloudsSpritesheet.textures);
		if (frames.length === 0)
		{
			console.error('CloudsManager: No cloud frames found in spritesheet');
			return null;
		}

		try 
		{
			// Get a random cloud frame
			const randomFrameIndex = Math.floor(Math.random() * frames.length);
			const randomTexture = frames[randomFrameIndex];
			// Create a sprite with the random frame
			const cloud = new PIXI.Sprite(randomTexture);
			cloud.name = `cloud-${this.activeCloudSprites.length}`;
			cloud.anchor.set(0.5, 0.5);
			// Initialize cloud properties
			cloud.alpha = 0;
			// Choose random animation properties
			const randomAnimIndex = Math.floor(Math.random() * this.animationTypes.length);
			const randomAnimType = this.animationTypes[randomAnimIndex];
			const randomSpeedIndex = Math.floor(Math.random() * this.formationSpeeds.length);
			const randomSpeed = this.formationSpeeds[randomSpeedIndex];
			const randomOpacityIndex = Math.floor(Math.random() * this.opacityLevels.length);
			const finalOpacity = this.opacityLevels[randomOpacityIndex];
			// Get scene scale - adjust cloud scale and positioning
			const sceneScale = this.getSceneScale();
			// Choose a random base scale for variety
			const baseScale = this.config.minScale + 
				Math.random() * (this.config.maxScale - this.config.minScale);
			// Apply scene scaling to the cloud scale
			const scaledSize = baseScale * sceneScale;
			// Start at 80% of final size
			cloud.scale.set(scaledSize * 0.7);
			// Find a position that's not too close to existing clouds
			let positionFound = false;
			let attempts = 0;
			let randomTop, randomLeft;
			while (!positionFound && attempts < 10) 
			{
				// Scale the positioning with scene scale as well
				const cloudNumber = this.activeCloudSprites.length;
				if (cloudNumber % 3 === 0) 
				{
					randomTop = Math.random() * (screenHeight / 3);
				} 
				else if (cloudNumber % 3 === 1) 
				{
					randomTop = (screenHeight / 3) + Math.random() * (screenHeight / 3);
				} 
				else 
				{
					randomTop = (screenHeight * 2/3) + Math.random() * (screenHeight / 3);
				}
				// Random horizontal position
				if (randomAnimType === 'driftLeftToRight') 
				{
					randomLeft = -cloud.width; // Start off-screen left
				} 
				else if (randomAnimType === 'driftRightToLeft') 
				{
					randomLeft = screenWidth + cloud.width; // Start off-screen right
				} 
				else if (randomAnimType === 'driftDiagonalUp') 
				{
					randomLeft = -cloud.width; // Start off-screen left
					randomTop = screenHeight - cloud.height/2;
				} 
				else 
				{
					// For driftSlow animation
					randomLeft = Math.floor(Math.random() * screenWidth * 0.8) + (screenWidth * 0.1);
				}
				// Check if this position is far enough from existing clouds
				positionFound = true;
				for (const pos of usedPositions) 
				{
					const xDist = Math.abs(pos.left - randomLeft);
					const yDist = Math.abs(pos.top - randomTop);
					const distance = Math.sqrt(xDist*xDist + yDist*yDist);
					// Min distance also scales with scene
					if (distance < this.config.minDistance * sceneScale) 
					{
						positionFound = false;
						break;
					}
				}
				attempts++;
			}
			// Ensure some clouds cover the entire width of the screen
			if (this.activeCloudSprites.length === 0) randomLeft = -cloud.width; // First cloud starts at the left
			if (this.activeCloudSprites.length === 1) randomLeft = screenWidth - cloud.width/2; // Second cloud starts at the right
			// Position the cloud
			cloud.position.set(randomLeft, randomTop);
			// Store animation parameters in cloud for the ticker
			cloud.animationData = {
				type: randomAnimType,
				formationTime: randomSpeed.formationTime,
				driftDelay: randomSpeed.driftDelay,
				finalOpacity: finalOpacity,
				finalScale: scaledSize,
				startTime: performance.now(),
				startPosition: { x: randomLeft, y: randomTop },
				endPosition: this.calculateEndPosition(randomAnimType, randomLeft, randomTop, screenWidth, screenHeight),
				// Scale factors for reference
				sceneScale: sceneScale,
				baseScale: baseScale,
				// Custom state for driftSlow animation
				driftSlowState: {
					phase: 0,
					offset: Math.random() * Math.PI * 2 // Random starting phase
				}
			};
			// Add cloud to container
			this.cloudsContainer.addChild(cloud);
			// Start animations
			this.setupCloudAnimations(cloud);
			// Track the cloud
			this.activeCloudSprites.push(cloud);
			// Add to used positions to avoid overlap
			usedPositions.push({ top: randomTop, left: randomLeft });
			return cloud;
		} 
		catch (error) 
		{
			console.error('CloudsManager: Error creating cloud', error);
			return null;
		}
	}
	
	//Get the current scene height
	getSceneHeight() 
	{
		if (this.sceneManager && this.sceneManager.app) 
		{
			return this.sceneManager.app.screen.height * 0.35;
		}
		// Fallback:
		return window.innerHeight * 0.55;
	}


	 //Get the current scene scale factor
	getSceneScale() 
	{
		// Default scale factor if scene manager is not available
		let scaleFactor = 1.0;
		try 
		{
			// First try to get scale info from SceneManager if available
			if (this.sceneManager && this.sceneManager.backgroundGroup) 
			{
				// Find the background or layer scale
				const backgroundGroup = this.sceneManager.backgroundGroup;
				if (backgroundGroup.children && backgroundGroup.children.length > 0) 
				{
					// Check layers
					for (const layer of backgroundGroup.children) 
					{
						if (layer.name === 'background' || layer.name === 'mountain') 
						{
							if (layer.children && layer.children.length > 0) 
							{
								const sprite = layer.children[0];
								if (sprite && sprite.width && window.innerWidth > 0) 
								{
									// Use width ratio for scale factor
									scaleFactor = sprite.width / window.innerWidth;
									break;
								}
							}
						}
					}
				}
			}
			// Fallback to element size comparison
			if (scaleFactor === 1.0) 
			{
				const sceneElement = document.getElementById('main-scene');
				if (sceneElement) 
				{
					// Get height ratio compared to window
					const sceneHeight = sceneElement.clientHeight;
					const windowHeight = window.innerHeight;
					if (windowHeight > 0) 
					{
						scaleFactor = sceneHeight / windowHeight;
					}
				}
			}
			// Constrain to reasonable values
			scaleFactor = Math.max(0.25, Math.min(scaleFactor, 1.25));
			// Use a smaller factor for clouds so they don't get too large
			// but still scale with the scene
			scaleFactor = 0.5 + (scaleFactor - 1.0) * 0.4;
		} 
		catch (error) 
		{
			console.warn('CloudsManager: Error calculating scene scale', error);
		}
		return scaleFactor;
	}
	
	 //Setup cloud animations using PixiJS ticker
	setupCloudAnimations(cloud) 
	{
		if (this.isDestroyed) 
		{
			return;
		}
		const animData = cloud.animationData;
		const startTime = animData.startTime;
		let tickerCallback;
		// Calculate animation durations based on type
		let animationDuration;
		switch (animData.type) 
		{
			case 'driftLeftToRight':
				animationDuration = 60000; // 60 seconds
				break;
			case 'driftRightToLeft':
				animationDuration = 80000; // 80 seconds
				break;
			case 'driftDiagonalUp':
				animationDuration = 90000; // 90 seconds
				break;
			case 'driftSlow':
				animationDuration = 30000; // 30 seconds per "wave" but actually infinite
				break;
			default:
				animationDuration = 60000;
		}
				// Create the animation ticker
		tickerCallback = (time) => {
			// Safety check - if cloud is destroyed, removed, or manager is destroyed
			if (this.isDestroyed || !cloud || !cloud.parent) 
			{
				this.app.ticker.remove(tickerCallback);
				return;
			}
			try 
			{
				const currentTime = performance.now();
				const elapsed = currentTime - startTime;
				// Phase 1: Formation (fade in and scale)
				if (elapsed <= animData.formationTime) 
				{
					const formProgress = elapsed / animData.formationTime;
					// Fade in
					cloud.alpha = formProgress * animData.finalOpacity;
					// Scale up
					const scaleProgress = Math.min(1, formProgress * 1.1);
					cloud.scale.set(
						lerp(animData.finalScale * 0.8, animData.finalScale, scaleProgress)
					);
					return;
				}
				// Phase 2: Drift delay (pause before drifting)
				if (elapsed <= animData.formationTime + animData.driftDelay) 
				{
					cloud.alpha = animData.finalOpacity;
					cloud.scale.set(animData.finalScale);
					return;
				}
				// Phase 3: Drift animation
				const driftStartTime = animData.formationTime + animData.driftDelay;
				const driftElapsed = elapsed - driftStartTime;
				const driftProgress = Math.min(1, driftElapsed / animationDuration);
				// Handle different animation types
				switch (animData.type) 
				{
					case 'driftLeftToRight':
					case 'driftRightToLeft':
					case 'driftDiagonalUp':
						// Linear movement from start to end position
						cloud.position.x = lerp(animData.startPosition.x, animData.endPosition.x, driftProgress);
						cloud.position.y = lerp(animData.startPosition.y, animData.endPosition.y, driftProgress);
						// Fade in/out bell curve
						if (driftProgress < 0.1) 
						{
							// Fade in
							cloud.alpha = lerp(0, animData.finalOpacity, driftProgress * 10);
						} 
						else if (driftProgress > 0.8) 
						{
							// Fade out
							cloud.alpha = lerp(animData.finalOpacity, 0, (driftProgress - 0.8) * 5);
						} 
						else 
						{
							// Middle section
							cloud.alpha = animData.finalOpacity;
						}
						// If animation is complete, mark for removal
						if (driftProgress >= 1) 
						{
							cloud.markedForRemoval = true;
							cloud.visible = false;
							this.app.ticker.remove(tickerCallback);
							cloud.tickerCallback = null;
						}
						break;
						
					case 'driftSlow':
						// Oscillating movement
						animData.driftSlowState.phase += 0.001; // Slow phase increment
						const offsetX = Math.sin(animData.driftSlowState.phase) * 50; // 50px amplitude
						cloud.position.x = animData.startPosition.x + offsetX;
						// No complete condition - will run infinitely until cleaned up
						// But set alpha based on sine wave to create pulsing effect
						const alphaOffset = Math.sin(animData.driftSlowState.phase) * 0.3;
						cloud.alpha = animData.finalOpacity + alphaOffset;
						// Clouds with driftSlow will eventually be removed during refresh
						break;
				}
			} 
			catch (error) 
			{
				console.warn('CloudsManager: Error in cloud animation', error);
				this.app.ticker.remove(tickerCallback);
				// Mark cloud for removal on error
				if (cloud) 
				{
					cloud.markedForRemoval = true;
					cloud.visible = false;
					cloud.tickerCallback = null;
				}
			}
		};
		// Add to ticker
		this.app.ticker.add(tickerCallback);
		// Store ticker callback for later removal
		cloud.tickerCallback = tickerCallback;
	}
	
	 //Calculate end position for cloud animation
	calculateEndPosition(animType, startX, startY, screenWidth, screenHeight) 
	{
		switch (animType) 
		{
			case 'driftLeftToRight':
				return { x: screenWidth + 200, y: startY };
				
			case 'driftRightToLeft':
				return { x: -200, y: startY };
				
			case 'driftDiagonalUp':
				return { x: screenWidth + 200, y: startY - 200 };
				
			case 'driftSlow':
				// End position not really used for driftSlow, as it oscillates
				return { x: startX, y: startY };
			default:
				return { x: screenWidth + 200, y: startY };
		}
	}
	
	 //Handle window resize events
	onResize() 
	{
		if (this.isDestroyed) 
		{
			return;
		}
		this.config.containerHeight = this.getSceneHeight();
		if (this.currentTheme === 'light' && this.initialized) 
		{
			this.updateCloudScaling();
			this.refreshClouds() 
		}
	}
	
	 //Update cloud scaling without completely refreshing
	updateCloudScaling() 
	{
		if (this.isDestroyed) 
		{
			return;
		}
		const sceneScale = this.getSceneScale();
		const newContainerHeight = this.getSceneHeight();
		// Update all existing clouds
		this.activeCloudSprites.forEach(cloud => {
			if (cloud && cloud.animationData && !cloud.markedForRemoval) 
			{
				try 
				{
					// Calculate new scale using the original base scale and the new scene scale
					const baseScale = cloud.animationData.baseScale || 
						(cloud.animationData.finalScale / cloud.animationData.sceneScale || 1.0);
					// Store the new values
					cloud.animationData.sceneScale = sceneScale;
					cloud.animationData.baseScale = baseScale;
					cloud.animationData.finalScale = baseScale * sceneScale;
					// Apply the new scale if we're past the formation phase
					const elapsed = performance.now() - cloud.animationData.startTime;
					if (elapsed >= cloud.animationData.formationTime) 
					{
						// Apply the new scale directly
						cloud.scale.set(cloud.animationData.finalScale);
					} 
					else 
					{
						// Still in formation phase, keep the partial scale
						const formProgress = elapsed / cloud.animationData.formationTime;
						const scaleProgress = Math.min(1, formProgress * 1.2);
						cloud.scale.set(
							lerp(cloud.animationData.finalScale * 0.8, cloud.animationData.finalScale, scaleProgress)
						);
					}
					// Update position for vertical scaling - CORRIGIDO para usar newContainerHeight
					const verticalRatio = cloud.position.y / this.config.containerHeight;
					cloud.position.y = verticalRatio * newContainerHeight;
				} 
				catch (error) 
				{
					console.warn('CloudsManager: Error updating cloud scale', error);
				}
			}
		});
		this.config.containerHeight = newContainerHeight;
	}
	
	 //Destroy all resources
	destroy() 
	{
		console.log('CloudsManager: Destroying');
		this.isDestroyed = true;
		// Clear interval
		if (this.cloudLifecycleInterval) 
		{
			clearInterval(this.cloudLifecycleInterval);
			this.cloudLifecycleInterval = null;
		}
		// Remove all cloud sprites
		if (this.cloudsContainer) 
		{
			// Remove all ticker callbacks first
			this.activeCloudSprites.forEach(cloud => {
				if (cloud && cloud.tickerCallback) 
				{
					this.app.ticker.remove(cloud.tickerCallback);
					cloud.tickerCallback = null;
				}
			});
			// Clear container
			this.cloudsContainer.removeChildren();
		}
		// Remove resize listener
		window.removeEventListener('resize', this.onResize.bind(this));
		// Clear arrays
		this.activeCloudSprites = [];
	}
}
