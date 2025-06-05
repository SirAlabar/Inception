/**
 * CursorEffectComponent.js
 * 
 * Optimized component for cursor effects using PIXI.js
 * Includes geometric particles in light theme and blood drops in dark theme
 */

export class CursorEffectComponent 
{
	constructor(game, app, uiGroup, options = {}, assetManager) 
	{
		// System references
		this.game = game;
		this.app = app;
		this.uiGroup = uiGroup;
		this.assetManager = assetManager;
		
		// Check if we have the necessary dependencies
		if (!this.app || !this.uiGroup) 
		{
			console.error("CursorEffectComponent: app and uiGroup are required");
			return;
		}
		
		// Default settings
		this.config = {
			particlesEnabled: true,
			cursorSize: 32,          // Cursor size in pixels
			particlesCount: 2,       // Number of particles
			particlesLifespan: 60,   // Duration in frames
			...options
		};

		// Internal state
		this.currentTheme = 'light';
		this.isInitialized = false;
		this.particles = [];
		this.bloodDrops = [];
		this.cursorPos = { x: 0, y: 0 };
		this.lastPos = { x: 0, y: 0 };
		this.particleContainer = null;
		this.cursorSprite = null;
		this.cursorInCanvas = false;
		this.lastBloodTime = 0;
		this.bloodDropRate = 100; // ms between drops
		// Particle shapes and colors
		this.particleShapes = ['circle', 'square', 'triangle', 'diamond', 'star'];
		this.particleColors = {
			light: [
				0xFF5252, 0xFF7B25, 0xFFC107, 
				0x4CAF50, 0x2196F3, 0x9C27B0, 
				0xE91E63
			],
			dark: [
				0xFF0000, 0xCC0000, 0xAA0000, 
				0x880000, 0x990000, 0xBB0000
			]
		};
		// Initialize
		this.init();
	}

	/**
	 * Initialize the component
	 */
	init() 
	{
			if (this.isInitialized)
			{
				return;
			}
			
			const savedTheme = localStorage.getItem('theme');
			if (savedTheme) 
			{
					this.currentTheme = savedTheme;
			} 
			else 
			{
					this.currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
			}
			
			// Configure PIXI containers
			this.setupContainers();
			// Load textures and create cursor sprite with correct theme
			this.loadTextures().then(() => {
					this.createCursorSprite();
					if (this.cursorSprite) 
					{
							this.cursorSprite.visible = false;
					}
			});
			// Set up theme change observer
			this.observeThemeChanges();
			// Add event listeners
			this.bindEvents();
			this.isInitialized = true;
	}

	/**
	 * Set up PIXI containers for particles
	 */
	setupContainers() 
	{
		// Container for particles
		this.particleContainer = new PIXI.Container();
		this.particleContainer.name = "cursorParticles";
		this.particleContainer.sortableChildren = true;
		this.uiGroup.addChild(this.particleContainer);
		// Ensure uiGroup is in front
		this.uiGroup.zIndex = 1000;
		// Force sorting if parent has sortableChildren
		if (this.uiGroup.parent && this.uiGroup.parent.sortableChildren) 
		{
			this.uiGroup.parent.sortChildren();
		}
	}

	/**
	 * Load textures for cursor
	 */
	async loadTextures() 
	{
		try 
		{
			// Get textures directly from AssetManager
			if (this.assetManager && this.assetManager.textures) 
			{
					this.cursorLightTexture = this.assetManager.textures.cursor_light;
					this.cursorDarkTexture = this.assetManager.textures.cursor_dark;
			}
		} 
		catch (error) 
		{
			console.error("Error loading cursor textures:", error);
			return false;
		}
	}

	/**
	 * Create cursor sprite
	 */
	createCursorSprite() 
	{
		// Get texture based on current theme
		const texture = this.currentTheme === 'dark' 
			? this.cursorDarkTexture 
			: this.cursorLightTexture;
		
		// Create sprite if it doesn't exist
		if (!this.cursorSprite) 
		{
			this.cursorSprite = new PIXI.Sprite(texture);
			this.cursorSprite.anchor.set(0.1, 0.1);
			this.cursorSprite.width = this.config.cursorSize;
			this.cursorSprite.height = this.config.cursorSize;
			this.cursorSprite.zIndex = 10;
			this.uiGroup.addChild(this.cursorSprite);
		} 
		else 
		{
			// Update existing texture
			this.cursorSprite.texture = texture;
		}
	}

	/**
	 * Configure observer for theme changes
	 */
	observeThemeChanges() 
	{
		// Observe changes to body's data-theme attribute
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'data-theme') 
				{
					const newTheme = document.body.getAttribute('data-theme');
					if (newTheme === 'dark' || newTheme === 'light') 
					{
						this.onThemeChange(newTheme);
					}
				}
			});
		});
		
		observer.observe(document.body, { attributes: true });
	}

	/**
	 * Handle theme changes
	 */
	onThemeChange(newTheme) 
	{
		if (newTheme === this.currentTheme) 
		{
			return;
		}
		
		this.currentTheme = newTheme;
		// Update cursor texture
		if (this.cursorSprite) 
		{
			this.cursorSprite.texture = this.currentTheme === 'dark' 
				? this.cursorDarkTexture 
				: this.cursorLightTexture;
		}
	}

	/**
	 * Add event listeners
	 */
	bindEvents() 
	{
		// Define global variables for mouse tracking
		window.mouseX = 0;
		window.mouseY = 0;
		
		// Add listener to update global mouse position
		document.addEventListener('mousemove', (e) => {
			window.mouseX = e.clientX;
			window.mouseY = e.clientY;
		});
		
		// Track cursor events on canvas
		this.app.view.addEventListener('pointerenter', this.onCanvasEnter.bind(this));
		this.app.view.addEventListener('pointerleave', this.onCanvasLeave.bind(this));
		this.app.view.addEventListener('pointermove', this.onPointerMove.bind(this));
		
		// Add scroll handler for PIXI cursor
		window.addEventListener('scroll', () => {
			// If cursor was in canvas, ensure cursor sprite stays visible during scroll
			if (this.cursorInCanvas && this.cursorSprite) 
			{
				const rect = this.app.view.getBoundingClientRect();
				// Now window.mouseX and window.mouseY exist and have valid values
				const mouseX = window.mouseX || 0;
				const mouseY = window.mouseY || 0;
				// Update cursor position relative to canvas
				this.cursorPos.x = mouseX - rect.left;
				this.cursorPos.y = mouseY - rect.top;
				// Update the sprite
				this.cursorSprite.x = this.cursorPos.x;
				this.cursorSprite.y = this.cursorPos.y;
				this.cursorSprite.visible = true;
			}
		}, { passive: true });
		// Add to PIXI ticker for frame updates
		this.app.ticker.add(this.update, this);
	}

	/**
	 * When cursor enters the canvas
	 */
	onCanvasEnter() 
	{
		this.cursorInCanvas = true;
		this.app.view.style.cursor = 'none';
		if (this.cursorSprite) 
		{
			this.cursorSprite.visible = true;
		}
		const rect = this.app.view.getBoundingClientRect();
		const mouseX = event.clientX || 0;
		const mouseY = event.clientY || 0;
		this.cursorPos.x = mouseX - rect.left;
		this.cursorPos.y = mouseY - rect.top;
	}

	/**
	 * When cursor leaves the canvas
	 */
	onCanvasLeave() 
	{
		this.cursorInCanvas = false;
		this.app.view.style.cursor = '';
		if (this.cursorSprite) 
		{
			this.cursorSprite.visible = false;
		}
	}

	/**
	 * Handler for mouse/pointer movement
	 */
	onPointerMove(e) 
	{
		// Skip if not in canvas
		if (!this.cursorInCanvas) 
		{
			return;
		}
		// Convert DOM coordinates to PIXI coordinates
		const rect = this.app.view.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		this.cursorPos.x = x;
		this.cursorPos.y = y;
		// Calculate distance moved
		const dx = this.cursorPos.x - this.lastPos.x;
		const dy = this.cursorPos.y - this.lastPos.y;
		const distance = Math.sqrt(dx*dx + dy*dy);
		
		// If significant movement and particles enabled, create particles
		if (distance > 1.5 && this.config.particlesEnabled) 
		{
			const particleCount = Math.min(
				this.config.particlesCount,
				Math.floor(distance / 5) + 1
			);
			// Create particles based on current theme
			if (this.currentTheme === 'dark') 
			{
				// Add blood drops more sparingly
				const now = Date.now();
				if (now - this.lastBloodTime >= this.bloodDropRate) 
				{
					this.addParticle(x, y);
					this.lastBloodTime = now;
				}
			} 
			else 
			{
				// Add geometric particles
				for (let i = 0; i < particleCount; i++)
				{
					this.addParticle(
						this.cursorPos.x - dx * (i / particleCount), 
						this.cursorPos.y - dy * (i / particleCount)
					);
				}
			}
		}
		// Update previous position
		this.lastPos.x = this.cursorPos.x;
		this.lastPos.y = this.cursorPos.y;
	}

	/**
	 * Add a new particle (either geometric or blood based on theme)
	 */
	addParticle(x, y) 
	{
		const graphics = new PIXI.Graphics();
		
		if (this.currentTheme === 'dark') 
		{
			// Select random red color
			const colors = this.particleColors.dark;
			const color = colors[Math.floor(Math.random() * colors.length)];
			// Varied size for blood drops
			const size = 2 + Math.random() * 3;
			// Create blood drop with different physics to simulate dripping
			const bloodDrop = {
				graphics,
				x,
				y,
				color,
				size,
				// Heavier physics for blood drops
				velocity: {
					x: (Math.random() - 0.5) * 0.5, // Less horizontal movement
					y: 0.5 + Math.random() * 1.5,   // Downward movement (dripping)
				},
				// Drop elongation
				elongation: 1 + Math.random() * 2,
				// Longer lifetime for drops
				life: this.config.particlesLifespan * 1.5,
				initialLife: this.config.particlesLifespan * 1.5,
				// Blood trail
				trail: Math.random() > 0.7,
				trailDrops: [],
				splatter: false // Will be true when drop hits the "ground"
			};
			
			// Draw initial drop
			this.drawBloodDrop(bloodDrop);
			
			// Add to container and list
			this.particleContainer.addChild(graphics);
			this.bloodDrops.push(bloodDrop);
		} 
		else 
		{
			const shape = this.particleShapes[Math.floor(Math.random() * this.particleShapes.length)];
			// Select random color based on theme
			const colors = this.particleColors.light;
			const color = colors[Math.floor(Math.random() * colors.length)];
			// Configure the particle
			const particle = {
				graphics,
				shape,
				color,
				x,
				y,
				size: 2 + Math.random() * 2,
				velocity: {
					x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 10),
					y: -0.4 + Math.random() * -1,
				},
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.1,
				life: this.config.particlesLifespan,
				initialLife: this.config.particlesLifespan,
			};
			// Add to container and list
			this.particleContainer.addChild(graphics);
			this.particles.push(particle);
			// Draw initial shape
			this.drawParticleShape(particle, particle.size, 0.8);
		}
	}

	/**
	 * Draw the particle shape
	 */
	drawParticleShape(particle, size, alpha) 
	{
		const g = particle.graphics;
		g.clear();
		// Configure style
		g.alpha = alpha;
		// Draw shape
		switch (particle.shape) 
		{
			case 'circle':
				g.beginFill(particle.color, alpha);
				g.drawCircle(0, 0, size);
				g.endFill();
				// Add border
				g.lineStyle(1, 0xFFFFFF, alpha * 0.3);
				g.drawCircle(0, 0, size);
				break;
			case 'square':
				g.beginFill(particle.color, alpha);
				g.drawRect(-size, -size, size * 2, size * 2);
				g.endFill();
				break;
			case 'triangle':
				g.beginFill(particle.color, alpha);
				g.moveTo(0, -size);
				g.lineTo(-size, size);
				g.lineTo(size, size);
				g.closePath();
				g.endFill();
				break;
			case 'diamond':
				g.beginFill(particle.color, alpha);
				g.moveTo(0, -size);
				g.lineTo(size, 0);
				g.lineTo(0, size);
				g.lineTo(-size, 0);
				g.closePath();
				g.endFill();
				break;
			case 'star':
				g.beginFill(particle.color, alpha);
				const outerRadius = size;
				const innerRadius = size / 2;
				const spikes = 5;
				
				for (let i = 0; i < spikes * 2; i++) 
				{
					const radius = i % 2 === 0 ? outerRadius : innerRadius;
					const angle = (Math.PI / spikes) * i;
					if (i === 0) 
					{
						g.moveTo(
							Math.cos(angle) * radius,
							Math.sin(angle) * radius
						);
					} 
					else 
					{
						g.lineTo(
							Math.cos(angle) * radius,
							Math.sin(angle) * radius
						);
					}
				}
				g.closePath();
				g.endFill();
				break;
		}
		// Position and rotate
		g.x = particle.x;
		g.y = particle.y;
		g.rotation = particle.rotation;
	}

	/**
	 * Draw blood drop
	 */
	drawBloodDrop(drop) 
	{
		const g = drop.graphics;
		g.clear();
		
		// Alpha based on life
		const lifeRatio = drop.life / drop.initialLife;
		const alpha = Math.min(1, lifeRatio * 1.5);
		// Draw a blood drop (elongated circle or splatter)
		if (!drop.splatter) 
		{
			// Normal dripping drop
			g.beginFill(drop.color, alpha);
			// Draw elongated drop
			const elongation = drop.velocity.y * 0.5;
			g.drawEllipse(0, 0, drop.size, drop.size * (1 + elongation));
			// Add highlight for wet effect
			g.beginFill(0xFF5555, alpha * 0.3);
			g.drawEllipse(-drop.size * 0.3, -drop.size * 0.3, drop.size * 0.4, drop.size * 0.4);
			g.endFill();
		}
		else 
		{
			// Draw splatter (when drop hits the "ground")
			g.beginFill(drop.color, alpha * 0.8);
			// Irregular splatter shape
			const splatterSize = drop.size * (1.5 + Math.random());
			g.moveTo(0, 0);
			// Create irregular shape for splatter
			const points = 5 + Math.floor(Math.random() * 4);
			for (let i = 0; i < points; i++) 
			{
				const angle = (Math.PI * 2 / points) * i;
				const radius = splatterSize * (0.5 + Math.random() * 0.8);
				g.lineTo(
					Math.cos(angle) * radius,
					Math.sin(angle) * radius
				);
			}
			g.closePath();
			g.endFill();
		}
		// Position
		g.x = drop.x;
		g.y = drop.y;
	}

	//Update component each frame
	update(deltaTime) 
	{
		// Update cursor position
		if (this.cursorSprite)
		{
			this.cursorSprite.x = this.cursorPos.x;
			this.cursorSprite.y = this.cursorPos.y;
		}
		// Update all particles
		for (let i = this.particles.length - 1; i >= 0; i--) 
		{
			const p = this.particles[i];
			// Update position
			p.x += p.velocity.x;
			p.y += p.velocity.y;
			// Add randomness to movement
			p.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
			p.velocity.y -= Math.random() / 600;
			// Update rotation
			p.rotation += p.rotationSpeed;
			// Reduce life
			p.life--;
			// Calculate scale and opacity based on life
			const lifeProgress = 1 - (p.life / p.initialLife);
			const scale = 0.2 + lifeProgress * 0.8;
			const size = p.size * scale;
			const opacity = p.life <= 0 ? 0 : Math.min(0.8, lifeProgress < 0.2 
				? lifeProgress * 4 // Fade in
				: p.life < p.initialLife * 0.3 
					? p.life / (p.initialLife * 0.3) // Fade out
					: 0.8); // Normal
			// Redraw particle
			this.drawParticleShape(p, size, opacity);
			// Remove dead particle
			if (p.life <= 0) 
			{
				this.particleContainer.removeChild(p.graphics);
				this.particles.splice(i, 1);
			}
		}
		
		// Update blood drops (dark theme)
		for (let i = this.bloodDrops.length - 1; i >= 0; i--) 
		{
			const drop = this.bloodDrops[i];
			// Update position
			drop.x += drop.velocity.x;
			drop.y += drop.velocity.y;
			// Elongate drop as it falls faster
			drop.elongation = 1 + drop.velocity.y * 0.3;
			// Increase velocity (gravity acceleration)
			drop.velocity.y += 0.05;
			// Add a bit of random horizontal movement
			drop.velocity.x += (Math.random() - 0.5) * 0.02;
			// Create occasional trails
			if (drop.trail && Math.random() > 0.9 && drop.life > 20) 
			{
				const trailDrop = {
					x: drop.x,
					y: drop.y,
					size: drop.size * 0.4,
					color: drop.color,
					alpha: 0.7,
					life: 20
				};
				drop.trailDrops.push(trailDrop);
			}
			// Update trails
			for (let j = drop.trailDrops.length - 1; j >= 0; j--) 
			{
				const trail = drop.trailDrops[j];
				trail.life--;
				trail.alpha = trail.life / 20;
				if (trail.life <= 0) 
				{
					drop.trailDrops.splice(j, 1);
				}
			}
			// Check if drop hit the "virtual ground"
			if (!drop.splatter && drop.y > this.app.screen.height - Math.random() * 100) 
			{
				drop.splatter = true;
				drop.velocity.x = 0;
				drop.velocity.y = 0;
				drop.life = Math.min(drop.life, 30); // Limit life after splatter
			}
			// Reduce life
			drop.life--;
			// Redraw drop
			this.drawBloodDrop(drop);
			// Remove dead drop
			if (drop.life <= 0) 
			{
				this.particleContainer.removeChild(drop.graphics);
				this.bloodDrops.splice(i, 1);
			}
		}
	}

	/**
	 * Update component config
	 */
	updateConfig(newConfig) 
	{
		this.config = { ...this.config, ...newConfig };
		// Update cursor size
		if (this.cursorSprite) 
		{
			this.cursorSprite.width = this.config.cursorSize;
			this.cursorSprite.height = this.config.cursorSize;
		}
		
		return this;
	}

	/**
	 * Set theme manually
	 */
	setTheme(theme) 
	{
		if (theme === 'light' || theme === 'dark') 
		{
			this.onThemeChange(theme);
		}
		return this;
	}

	/**
	 * Return current theme
	 */
	getTheme() 
	{
		return this.currentTheme;
	}

	/**
	 * Clean up resources
	 */
	destroy() 
	{
		if (!this.isInitialized) 
		{
			return;
		}
		
		// Remove from ticker
		this.app.ticker.remove(this.update, this);
		// Remove event listeners
		this.app.view.removeEventListener('pointermove', this.onPointerMove);
		this.app.view.removeEventListener('pointerenter', this.onCanvasEnter);
		this.app.view.removeEventListener('pointerleave', this.onCanvasLeave);
		// Restore default cursor on canvas
		this.app.view.style.cursor = '';
		// Clean up particles
		for (const p of this.particles) 
		{
			if (p.graphics && p.graphics.parent) 
			{
				p.graphics.parent.removeChild(p.graphics);
			}
		}
		this.particles = [];
		
		// Clean up blood drops
		for (const drop of this.bloodDrops) 
		{
			if (drop.graphics && drop.graphics.parent) 
			{
				drop.graphics.parent.removeChild(drop.graphics);
			}
		}
		this.bloodDrops = [];
		// Remove sprites and containers
		if (this.particleContainer && this.particleContainer.parent) 
		{
			this.particleContainer.parent.removeChild(this.particleContainer);
		}
		
		if (this.cursorSprite && this.cursorSprite.parent) 
		{
			this.cursorSprite.parent.removeChild(this.cursorSprite);
		}
		
		this.isInitialized = false;
	}
}
