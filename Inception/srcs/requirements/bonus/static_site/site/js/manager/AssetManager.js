/**
 * AssetManager - Handles loading and managing game assets
 * Uses PixiJS Assets API for efficient resource loading
 */
export class AssetManager 
{
	constructor() 
	{
		this.onProgress = null;
		this.onComplete = null;
		// Asset lists
		this.textures = {};
		this.backgrounds = {};
		this.spritesheets = {};
		// Loading state
		this.isLoading = false;
		// Asset paths configuration
		this.assetPaths = {
			player: {
				spritesheet: './assets/images/player/Little_Leo64px.webp',
				data: './assets/images/player/Little_Leo64px.json'
			},
			monsters: {
				slime2: {
					spritesheet: './assets/images/monsters/Slime2/Slime2.webp',
					data: './assets/images/monsters/Slime2/Slime2.json'
				},
				slime3: {
					spritesheet: './assets/images/monsters/Slime3/Slime3.webp',
					data: './assets/images/monsters/Slime3/Slime3.json'
				},
				vampire1: {
					spritesheet: './assets/images/monsters/Vampires1/Vampire1.webp',
					data: './assets/images/monsters/Vampires1/Vampire1.json'
				},
				vampire2: {
					spritesheet: './assets/images/monsters/Vampires2/Vampire2.webp',
					data: './assets/images/monsters/Vampires2/Vampire2.json'
				},
				vampire3: {
					spritesheet: './assets/images/monsters/Vampires3/Vampire3.webp',
					data: './assets/images/monsters/Vampires3/Vampire3.json'
				}
			},
			clouds_spritesheet: {
				texture: './assets/images/background/light/clouds.webp',
				data: './assets/images/background/light/clouds.json'
			},
			backgrounds: {
				light: {
					backgroundColor: '#87CEEB',
					mountain: './assets/images/background/light/mountain.webp',
					// clouds: './assets/images/background/light/clouds.webp',
					castle: './assets/images/background/light/castle.webp',
					field1: './assets/images/background/light/field1.webp',
					field2: './assets/images/background/light/field2.webp',
					field3: './assets/images/background/light/field3.webp',
					field4: './assets/images/background/light/field4.webp',
					field5: './assets/images/background/light/field5.webp',
					field6: './assets/images/background/light/field6.webp',
					field7: './assets/images/background/light/field7.webp'
				},
				dark: {
					backgroundColor: '#191970',
					background: './assets/images/background/dark/background_night.webp',
					mountain: './assets/images/background/dark/mountain_night.webp',
					moon: './assets/images/background/dark/moon_night.webp',
					castle: './assets/images/background/dark/castle_night.webp',
					field1: './assets/images/background/dark/field1_night.webp',
					field2: './assets/images/background/dark/field2_night.webp',
					field3: './assets/images/background/dark/field3_night.webp',
					field4: './assets/images/background/dark/field4_night.webp',
					field5: './assets/images/background/dark/field5_night.webp',
					field6: './assets/images/background/dark/field6_night.webp',
					field7: './assets/images/background/dark/field7_night.webp'
				}
			},
			ui: {
				cursors: {
					light: './assets/images/cursor_light.png',
					dark: './assets/images/cursor_night.png'
				}
			}
		};
	}
	
	/**
	 * Start loading all assets
	 */
	loadAllAssets() 
	{
		if (this.isLoading) return;
		this.isLoading = true;
		this.updateProgress(0);
		this.initAssets()
			.then(() => this.loadAssets())
			.catch(error => {
				console.error("Error loading assets:", error);
				this.isLoading = false;
			});
	}
	
	/**
	 * Initialize PIXI Assets with manifest
	 */
	async initAssets() 
	{
		const manifest = this.createManifest();
		await PIXI.Assets.init({manifest});
	}
	
	/**
	 * Load all assets in bundles
	 */
	async loadAssets() 
	{
		try 
		{
			const manifest = this.createManifest();
			const bundleNames = manifest.bundles.map(bundle => bundle.name);
			let loadedBundles = 0;
			// Load each bundle and track progress
			for (const bundleName of bundleNames) 
			{
				try 
				{
					const resources = await PIXI.Assets.loadBundle(bundleName, (progress) => {
						const overallProgress = 
							((loadedBundles + progress) / bundleNames.length) * 100;
						this.updateProgress(overallProgress);
					});
					
					this.processLoadedResources(bundleName, resources);
					loadedBundles++;
				} 
				catch (error) 
				{
					console.error(`Error loading bundle ${bundleName}:`, error);
				}
			}
			await this.processSpritesheets();
			this.isLoading = false;
			if (this.onComplete) 
			{
				this.onComplete();
			}
		} 
		catch (error)
		{
			console.error("Error in loadAssets:", error);
			throw error;
		}
	}
	
	/**
	 * Create a manifest structure for PIXI.Assets
	 */
	createManifest() 
	{
		const manifest = {
			bundles: []
		};
		
		// Player bundle
		const playerBundle = this.createPlayerBundle();
		manifest.bundles.push(playerBundle);
		// Monsters bundle
		const monstersBundle = this.createMonstersBundle();
		manifest.bundles.push(monstersBundle);
		// Background bundles
		const bgBundles = this.createBackgroundBundles();
		manifest.bundles.push(...bgBundles);
		// UI bundle
		const uiBundle = this.createUiBundle();
		manifest.bundles.push(uiBundle);
		// Bundle of spritesheets
		const spritesheetsBundle = this.createSpritesheetsBundle();
		manifest.bundles.push(spritesheetsBundle);
		
		return manifest;
	}
	
	/**
	 * Create player assets bundle
	 */
	createPlayerBundle() 
	{
		const playerBundle = {
			name: 'player',
			assets: [{
				alias: 'player_spritesheet',
				src: this.assetPaths.player.data
			}]
		};
		
		return playerBundle;
	}
	
	/**
	 * Create monsters assets bundle
	 */
	createMonstersBundle() 
	{
		const monstersBundle = {
			name: 'monsters',
			assets: []
		};
		
		for (const [monsterType, resources] of Object.entries(this.assetPaths.monsters)) 
		{
			monstersBundle.assets.push({
				alias: `${monsterType}_spritesheet`,
				src: resources.data
			});
		}
		
		return monstersBundle;
	}
	
	/**
	 * Create background assets bundles
	 */
	createBackgroundBundles() 
	{
		const bgBundles = [];
		
		for (const [theme, layers] of Object.entries(this.assetPaths.backgrounds)) 
		{
			// Store background color
			if (!this.backgrounds[theme]) 
			{
				this.backgrounds[theme] = {};
			}
			this.backgrounds[theme].backgroundColor = layers.backgroundColor;
			// Create bundle for this theme
			const themeBundle = {
				name: `bg_${theme}`,
				assets: []
			};
			for (const [key, src] of Object.entries(layers)) 
			{
				if (key !== 'backgroundColor') 
				{
					if (typeof src === 'object' && src.data && src.texture) 
					{
						themeBundle.assets.push({
							alias: `${theme}_${key}`,
							src: src.data
						});
					} 
					else 
					{
						themeBundle.assets.push({
							alias: `${theme}_${key}`,
							src
						});
					}
				}
			}
			bgBundles.push(themeBundle);
		}
		return bgBundles;
	}

	/**
	 * Create UI assets bundle
	 */
	createUiBundle() {
		const uiBundle = {
			name: 'ui',
			assets: []
		};
		
		// Add cursor
		if (this.assetPaths.ui && this.assetPaths.ui.cursors) 
		{
			for (const [key, src] of Object.entries(this.assetPaths.ui.cursors)) 
			{
				uiBundle.assets.push({
					alias: `cursor_${key}`,
					src
				});
			}
		}
		
		return uiBundle;
	}

	/**
	 * Create bundle for spritesheets
	 */
	createSpritesheetsBundle() 
	{
		const spritesheetsBundle = {
			name: 'spritesheets',
			assets: []
		};
		
		// Add clouds spritesheet
		if (this.assetPaths.clouds_spritesheet) 
		{
			spritesheetsBundle.assets.push({
				alias: 'clouds_spritesheet_json',
				src: this.assetPaths.clouds_spritesheet.data
			});
			spritesheetsBundle.assets.push({
				alias: 'clouds_spritesheet_texture',
				src: this.assetPaths.clouds_spritesheet.texture
			});
		} 
		else 
		{
			console.error("clouds_spritesheet not found in assetPaths!");
		}
		
		return spritesheetsBundle;
	}
	
	/**
	 * Process resources after loading
	 */
	processLoadedResources(bundleName, resources) 
	{
		if (bundleName === 'player') 
		{
			this.processPlayerResources(resources);
		}
		else if (bundleName === 'monsters') 
		{
			this.processMonsterResources(resources);
		}
		else if (bundleName.startsWith('bg_')) 
		{
			this.processBackgroundResources(bundleName, resources);
		}
		else if (bundleName === 'ui') 
		{
			this.processUiResources(resources);
		}
		else if (bundleName === 'spritesheets') 
		{
			for (const [alias, resource] of Object.entries(resources)) 
			{
				this.textures[alias] = resource;
			}
		}
	}
	
	/**
	 * Process player resources
	 */
	processPlayerResources(resources) 
	{
		this.textures['player'] = resources.player_spritesheet;
	}

	/**
	 * Process monster resources
	 */
	processMonsterResources(resources) 
	{
		for (const [alias, spritesheet] of Object.entries(resources)) 
		{
			const monsterType = alias.split('_')[0];
			this.textures[monsterType] = spritesheet;
		}
	}
	
	/**
	 * Process background resources
	 */
	processBackgroundResources(bundleName, resources) 
	{
		const theme = bundleName.substring(3); // Remove 'bg_' prefix
		
		for (const [alias, texture] of Object.entries(resources)) 
		{
			const parts = alias.split('_');
			if (parts.length >= 2) 
			{
				const layerName = parts[1];
				this.backgrounds[theme][layerName] = texture;
			}
		}
	}

	/**
	 * Process UI resources
	 */
	processUiResources(resources) 
	{
		for (const [alias, texture] of Object.entries(resources)) 
		{
			this.textures[alias] = texture;
		}
	}

	/**
	 * Process spritesheets with modern PixiJS 8.x approach
	 * Using direct loading for simplicity
	 */
	async processSpritesheets() 
	{
		try 
		{
			// Define spritesheets to load directly from their JSON files
			const spritesheetsToLoad = [
				// Clouds spritesheet
				{
					name: 'clouds_spritesheet',
					path: this.assetPaths.clouds_spritesheet.data
				},
				// Player spritesheet
				{
					name: 'player_spritesheet',
					path: this.assetPaths.player.data
				}
			];
			
			// Add monster spritesheets
			for (const [monsterType, info] of Object.entries(this.assetPaths.monsters)) 
			{
				spritesheetsToLoad.push({
					name: `${monsterType}_spritesheet`,
					path: info.data
				});
			}
			
			// Simply load each spritesheet directly
			for (const sheet of spritesheetsToLoad) 
			{
				// Skip if already loaded
				if (this.spritesheets[sheet.name]) 
				{
					continue;
				}
				
				try 
				{
					const spritesheet = await PIXI.Assets.load(sheet.path);
					this.spritesheets[sheet.name] = spritesheet;
				} 
				catch (error) 
				{
					console.error(`Failed to load ${sheet.name}:`, error);
				}
			}
		} 
		catch (error) 
		{
			console.error("Error in spritesheet processing:", error);
		}
	}

	/**
	 * Update loading progress and notify
	 */
	updateProgress(value) 
	{
		const progress = Math.min(Math.round(value), 100);
		if (this.onProgress) 
		{
			this.onProgress(progress);
		}
	}
	
	/**
	 * Get a background texture for a specific theme and layer
	 */
	getBackgroundTexture(theme, layer) 
	{
		const skipWarningLayers = ['background', 'clouds'];

		if (this.backgrounds[theme] && this.backgrounds[theme][layer]) 
		{
			return this.backgrounds[theme][layer];
		}
		if (!skipWarningLayers.includes(layer)) 
		{
			console.warn(`Texture not found for ${theme}_${layer}`);
		}
		return null;
	}
	
	/**
	 * Get all background textures for a specific theme
	 */
	getBackgroundTextures(theme) 
	{
		if (this.backgrounds[theme]) 
		{
			return this.backgrounds[theme];
		}
		console.warn(`No textures found for theme: ${theme}`);
		return {};
	}
	
	/**
	 * Get a spritesheet by name
	 */
	getSpritesheet(name) 
	{
		if (this.spritesheets[name]) 
		{
			return this.spritesheets[name];
		}
		console.warn(`Spritesheet not found: ${name}`);
		return null;
	}
	
	/**
	 * Get all frames from a spritesheet
	 */
	getSpriteFrames(spritesheetName) 
	{
		const spritesheet = this.getSpritesheet(spritesheetName);
		if (spritesheet && spritesheet.textures) 
		{
			return Object.values(spritesheet.textures);
		}
		console.warn(`No frames found for spritesheet: ${spritesheetName}`);
		return [];
	}

	/**
	 * Get background color or texture for a theme
	 */
	getBackgroundInfo(theme) 
	{
		const result = {
			color: 0x000000,
			useTexture: false,
			texture: null
		};
		
		if (this.backgrounds[theme]) 
		{
			if (theme === 'light') 
			{
				// Light theme uses a solid color
				result.color = this.hexToNumber(this.backgrounds[theme].backgroundColor);
				result.useTexture = false;
			} 
			else if (theme === 'dark') 
			{
				// Dark theme uses a background image
				result.color = 0x000000;
				result.useTexture = true;
				// Try to load the background texture
				try 
				{
					// The night background image path
					const backgroundPath = './assets/images/background/dark/background_night.webp';
					result.texture = PIXI.Texture.from(backgroundPath);
				} 
				catch (error) 
				{
					console.error("Error loading night background texture:", error);
					result.useTexture = false;
					result.color = this.hexToNumber(this.backgrounds[theme].backgroundColor);
				}
			}
		}
		
		return result;
	}
	
	/**
	 * Convert hex color string to number for PIXI
	 */
	hexToNumber(hex) 
	{
		// Remove # if present
		hex = hex.replace('#', '');
		// Convert to number
		return parseInt(hex, 16);
	}
}

export function createAssetManager() 
{
	return new AssetManager();
}