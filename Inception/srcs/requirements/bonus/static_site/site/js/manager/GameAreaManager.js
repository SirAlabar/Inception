/**
 * Manages the game's playable area and PIXI container positioning
 * Responsible for confining entities to game bounds and handling screen resizing
 */
class GameAreaManager 
{
	constructor(gameInstance) 
	{
		this.gameInstance = gameInstance;
		
		// Default bounds (will be updated based on screen size)
		this.bounds = {
			x: 0,
			y: 0,
			width: window.innerWidth,
			height: window.innerHeight * 0.4, // Default to bottom 40% of screen
			bottom: window.innerHeight,       // The bottom boundary
			fieldTop: window.innerHeight * 0.6 // Where fields start
		};
		
		// Initialize
		this.initialize();
		
		// Event listeners
		window.addEventListener('resize', this.onResize.bind(this));
	}
	
	// Initialize game area and set up boundaries
	initialize() 
	{
		// Update bounds based on current screen size
		this.updateBounds();
		
		// Configure PIXI containers
		this.configureGameArea();
	}
	
	// Updates area bounds to target the bottom half of the scene
	updateBounds()
	{
		const screenHeight = window.innerHeight;
		const screenWidth = window.innerWidth;
		
		// Calculate the middle point - where gameplay should begin
		const middlePoint = (screenHeight / 2);
		
		// Set bounds to target only the bottom half of the screen
		this.bounds = {
			x: 0,
			y: middlePoint,           // Start at the middle point
			width: screenWidth,
			height: screenHeight - middlePoint, // Height is the remaining space
			bottom: screenHeight,      // Bottom of the screen
			fieldTop: middlePoint      // Where the playable area starts
		};
		
		console.log("Game area bounds updated:", this.bounds);
	}

	// Configure the PIXI containers for the game area
	configureGameArea()
	{
		if (!this.gameInstance || !this.gameInstance.app || !this.gameInstance.gameplayGroup)
		{ 
			console.error("Game instance, app, or gameplay group not available");
			return;
		}
		
		try 
		{
			// Position the gameplay group
			const gameplayGroup = this.gameInstance.gameplayGroup;
			
			// Set position to match the bounds
			gameplayGroup.position.set(this.bounds.x, this.bounds.y);
			
			// Add a mask to confine visuals within the gameplay area
			this.createGameAreaMask();
			
			console.log("Game area configured in PIXI");
		}
		catch (error) 
		{
			console.error("Error configuring game area:", error);
		}
	}
	
	// Create a visual mask for the game area
	createGameAreaMask()
	{
		if (!this.gameInstance || !this.gameInstance.gameplayGroup)
		{ 
			return;
		}
		
		// Create a mask graphics object
		const mask = new PIXI.Graphics();
		mask.beginFill(0xFFFFFF);
		mask.drawRect(0, 0, this.bounds.width, this.bounds.height);
		mask.endFill();
		
		// Apply the mask to the gameplay group if needed
		// Note: Only uncomment this if you want to strictly mask gameplay elements
		// this.gameInstance.gameplayGroup.mask = mask;
		
		// Add to gameplay group for reference
		this.gameInstance.gameplayGroup.addChild(mask);
		
		// Add a debug border around the game area
		this.addDebugBorder();
	}
	
	// Add a debug border to visualize the game area boundaries
	addDebugBorder()
	{
		// Only in development/debug mode
		if (!this.gameInstance.debug)
		{
			return;
		}
		
		const debugBorder = new PIXI.Graphics();
		debugBorder.lineStyle(2, 0xFF0000, 0.5);
		debugBorder.drawRect(0, 0, this.bounds.width, this.bounds.height);
		
		// Add to gameplay group
		this.gameInstance.gameplayGroup.addChild(debugBorder);
		
		console.log("Debug border added to game area");
	}
	
	// Constrains a position to stay within the game bounds
	constrainToArea(position, entityWidth, entityHeight) 
	{
		const halfWidth = entityWidth / 2;
		const halfHeight = entityHeight / 2;
		
		return {
			x: Math.max(halfWidth, Math.min(this.bounds.width - halfWidth, position.x)),
			y: Math.max(halfHeight, Math.min(this.bounds.height - halfHeight, position.y))
		};
	}
	
	// Handle window resize events
	onResize() 
	{
		// Update the game area bounds
		this.updateBounds();
		
		// Update PIXI containers and masks
		this.updateContainers();
		
		// Notify game of resize
		if (this.gameInstance && this.gameInstance.onResize) 
		{
			this.gameInstance.onResize(this.bounds);
		}
	}
	
	// Update PIXI containers after resize
	updateContainers()
	{
		if (!this.gameInstance || !this.gameInstance.app || !this.gameInstance.gameplayGroup)
		{ 
			return;
		}
		
		// Update gameplay group position
		this.gameInstance.gameplayGroup.position.set(this.bounds.x, this.bounds.y);
		
		// Remove old mask
		const oldMask = this.gameInstance.gameplayGroup.mask;
		if (oldMask)
		{
			oldMask.destroy();
			this.gameInstance.gameplayGroup.mask = null;
		}
		
		// Create new mask
		this.createGameAreaMask();
	}
	
	// Check if a position is within the game area
	isInGameArea(x, y)
	{
		return (
			x >= this.bounds.x && 
			x <= this.bounds.x + this.bounds.width &&
			y >= this.bounds.y && 
			y <= this.bounds.y + this.bounds.height
		);
	}
	
	// Convert world coordinates to local game area coordinates
	worldToLocal(worldX, worldY)
	{
		return {
			x: worldX - this.bounds.x,
			y: worldY - this.bounds.y
		};
	}
	
	// Convert local game area coordinates to world coordinates
	localToWorld(localX, localY)
	{
		return {
			x: localX + this.bounds.x,
			y: localY + this.bounds.y
		};
	}
	
	// Clean up resources when manager is destroyed
	destroy()
	{
		window.removeEventListener('resize', this.onResize.bind(this));
	}
}

// Make GameAreaManager globally available
window.GameAreaManager = GameAreaManager;