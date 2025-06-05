/**
 * LoadingUI - Visual interface for the loading screen
 * Handles animations and visual effects during the loading process
 */
export class LoadingUI 
{
	constructor() 
	{
		// DOM Elements
		this.loadingBar = document.getElementById('loading-bar');
		this.loadingText = document.getElementById('loading-text');
		this.loadingScreen = document.getElementById('loading-screen');
		this.mainContent = document.querySelector('.main-content');

		// Current progress
		this.progress = 0;

		// Initialize UI
		this.updateProgress(0);
		this.createCSSParticles();
	}

	/**
	 * Updates the loading progress bar and text
	 * @param {number} value - Progress percentage (0-100)
	 */
	updateProgress(value) 
	{
		this.progress = value;
		this.loadingBar.style.width = `${value}%`;
		this.loadingText.textContent = `Loading Magic... ${value}%`;
	}
	
	/**
	 * Create particle effects for the loading screen
	 */
	createCSSParticles() 
	{
		const container = document.createElement('div');
		container.className = 'particles-container';
		this.loadingScreen.appendChild(container);
		
		for (let i = 0; i < 500; i++) 
		{
			const particle = document.createElement('div');
			particle.className = 'particle';
			// Random size
			const size = Math.random() * 8 + 2;
			particle.style.width = `${size}px`;
			particle.style.height = `${size}px`;
			// Random position
			const x = Math.random() * 100;
			const y = Math.random() * 100;
			particle.style.left = `${x}%`;
			particle.style.top = `${y}%`;
			// Random animation speed and delay
			const animDuration = Math.random() * 4 + 3;
			const delay = Math.random() * 5;
			// Apply animation
			particle.style.animation = `particleFloat ${animDuration}s ease-in-out ${delay}s infinite`;
			// Add particle to container
			container.appendChild(particle);
		}
	}

	/**
	 * Show completion animation effects
	 * @returns {Promise} Resolves when animation starts
	 */
	showComplete() 
	{
		this.loadingScreen.classList.add('loading-complete');
		
		// Return a promise that resolves after showing completion effect
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, 100);
		});
	}
	
	/**
	 * Update the loading text message
	 * @param {string} message - New message to display
	 */
	updateMessage(message) 
	{
		this.loadingText.textContent = message;
	}

	/**
	 * Start the exit transition and hide the loading screen
	 * @returns {Promise} Resolves when the transition is complete
	 */
	hide() 
	{
		return new Promise(resolve => {
			// Start fade-out transition
			this.loadingScreen.classList.add('fade-out');
			
			// Complete the transition after animation
			setTimeout(() => {
				this.loadingScreen.style.display = 'none';
				this.mainContent.style.opacity = '1';
				resolve();
			}, 150);
		});
	}
	
	//Show an error message to the user
	showError(message) 
	{
		this.loadingText.textContent = `Error: ${message}`;
		this.loadingText.style.color = 'red';
	}
}