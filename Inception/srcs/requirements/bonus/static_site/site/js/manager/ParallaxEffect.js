
import { lerp, boundValue } from '../utils/MathUtils.js';

export class ParallaxEffect 
{
	constructor(pixiApp, backgroundGroup) 
	{
		// Store PIXI references
		this.app = pixiApp;
		this.backgroundGroup = backgroundGroup;
		
		// Boundary settings for parallax
		this.bounds = {
			mouse: { min: -1, max: 1 },
			scroll: { min: -3, max: 3 }
		};
		
		// Smoothing factor for movement
		this.smoothFactor = 0.05;
		
		// Intensity multipliers
		this.mouseIntensity = 0.2;
		this.scrollIntensity = 0.1;
		
		// Track current positions
		this.currentPositions = new Map();
		
		// Initialize
		this.init();
	}
	
	init() 
	{
		// Check if we have everything we need
		if (!this.app || !this.backgroundGroup) 
		{
			console.error("PIXI App and/or backgroundGroup not defined");
			return;
		}
		
		// Initialize current positions for each layer
		for (let i = 0; i < this.backgroundGroup.children.length; i++) 
		{
			const layer = this.backgroundGroup.children[i];
			this.currentPositions.set(layer, { x: 0, y: 0, targetX: 0, targetY: 0, targetScrollY: 0 });
		}
		
		// Add event listeners
		window.addEventListener('mousemove', this.handleMouse.bind(this));
		window.addEventListener('scroll', this.handleScroll.bind(this));
		
		// Start animation loop
		this.app.ticker.add(this.animate.bind(this));
		
		// Trigger an initial scroll event to set positions
		this.handleScroll();
	}
	
	handleMouse(e) 
	{
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;
		
		for (let i = 0; i < this.backgroundGroup.children.length; i++) 
		{
			const layer = this.backgroundGroup.children[i];
			
			// Skip background layer
			if (layer.name === 'background') 
			{
				continue;
			}
			
			// Get parallax speed from layer
			const speed = layer.parallaxSpeed || 0;
			
			const targetX = (e.clientX - centerX) * speed * this.mouseIntensity;
			const targetY = (e.clientY - centerY) * speed * this.mouseIntensity;
			
			const current = this.currentPositions.get(layer);
			if (current) 
			{
				current.targetX = boundValue(targetX, this.bounds.mouse.min, this.bounds.mouse.max);
				current.targetY = boundValue(targetY, this.bounds.mouse.min, this.bounds.mouse.max);
			}
		}
	}
	
	handleScroll() 
	{
		const scrolled = window.pageYOffset;
		
		for (let i = 0; i < this.backgroundGroup.children.length; i++) 
		{
			const layer = this.backgroundGroup.children[i];
			
			// Skip background layer
			if (layer.name === 'background') 
			{
				continue;
			}
			
			// Get parallax speed from layer
			const speed = layer.parallaxSpeed || 0;
			
			const yOffset = -(scrolled * speed * this.scrollIntensity);
			const boundedY = boundValue(yOffset, this.bounds.scroll.min, this.bounds.scroll.max);
			
			const current = this.currentPositions.get(layer);
			if (current) 
			{
				current.targetScrollY = boundedY;
			}
		}
	}
	
	animate() 
	{
		for (let i = 0; i < this.backgroundGroup.children.length; i++) 
		{
			const layer = this.backgroundGroup.children[i];
			const current = this.currentPositions.get(layer);
			
			if (!current) 
			{
				continue;
			}
			
			// Initialize missing values
			if (current.x === undefined) 
			{
				current.x = 0;
			}
			
			if (current.y === undefined) 
			{
				current.y = 0;
			}
			
			if (current.targetX === undefined) 
			{
				current.targetX = 0;
			}
			
			if (current.targetY === undefined) 
			{
				current.targetY = 0;
			}
			
			if (current.targetScrollY === undefined) 
			{
				current.targetScrollY = 0;
			}
			
			// Smoothly interpolate to target values
			current.x = lerp(current.x, current.targetX, this.smoothFactor);
			current.y = lerp(current.y, current.targetScrollY + current.targetY, this.smoothFactor);
			
			// Apply transform
			layer.position.x = current.x;
			layer.position.y = current.y;
		}
	}

	/**
	 * Update when window is resized
	 */
	onResize() 
	{
		// Readjust bounds if needed
		this.handleScroll();
	}
	
	/**
	 * Clean up events and resources when destroying
	 */
	destroy() 
	{
		window.removeEventListener('mousemove', this.handleMouse.bind(this));
		window.removeEventListener('scroll', this.handleScroll.bind(this));
		this.app.ticker.remove(this.animate.bind(this));
	}
}

export function createParallaxEffect(pixiApp, backgroundGroup) 
{
  return new ParallaxEffect(pixiApp, backgroundGroup);
}