/**
 * Sword Menu Button Component
 * Replaces default hamburger button with animated sword
 */
export class SwordButtonComponent 
{
	constructor() 
	{
		this.initialize();
	}
	
	initialize() 
	{
		// Wait for DOM to be ready
		if (document.readyState === 'loading') 
		{
			document.addEventListener('DOMContentLoaded', () => this.setup());
		} 
		else 
		{
			this.setup();
		}
	}
	
	setup() 
	{
		// Select original button
		const toggleButton = document.querySelector('.navbar-toggler');
		if (!toggleButton) 
		{
			console.error('SwordButton: Navbar toggler not found');
			return;
		}
		// Add sword-button class
		toggleButton.classList.add('sword-button');
		// Create SVG elements
		const svgNamespace = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(svgNamespace, "svg");
		svg.setAttribute("class", "sword-menu-button");
		svg.setAttribute("viewBox", "0 0 100 100");
		svg.setAttribute("fill", "none");
		// Add gradients and definitions
		const defs = document.createElementNS(svgNamespace, "defs");
		// Magic gradient
		const magicGradient = document.createElementNS(svgNamespace, "linearGradient");
		magicGradient.setAttribute("id", "swordGradient");
		magicGradient.setAttribute("x1", "0%");
		magicGradient.setAttribute("y1", "0%");
		magicGradient.setAttribute("x2", "100%");
		magicGradient.setAttribute("y2", "100%");

		const magicStop1 = document.createElementNS(svgNamespace, "stop");
		magicStop1.setAttribute("offset", "0%");
		magicStop1.setAttribute("stop-color", "#63B3ED");
		
		const magicStop2 = document.createElementNS(svgNamespace, "stop");
		magicStop2.setAttribute("offset", "50%");
		magicStop2.setAttribute("stop-color", "#B794F4");
		
		const magicStop3 = document.createElementNS(svgNamespace, "stop");
		magicStop3.setAttribute("offset", "100%");
		magicStop3.setAttribute("stop-color", "#F6AD55");
		
		magicGradient.appendChild(magicStop1);
		magicGradient.appendChild(magicStop2);
		magicGradient.appendChild(magicStop3);
		
		// Trail gradient
		const trailGradient = document.createElementNS(svgNamespace, "linearGradient");
		trailGradient.setAttribute("id", "trailGradient");
		trailGradient.setAttribute("x1", "0%");
		trailGradient.setAttribute("y1", "0%");
		trailGradient.setAttribute("x2", "100%");
		trailGradient.setAttribute("y2", "100%");
		
		const trailStop1 = document.createElementNS(svgNamespace, "stop");
		trailStop1.setAttribute("offset", "0%");
		trailStop1.setAttribute("stop-color", "#90CDF4");
		trailStop1.setAttribute("stop-opacity", "0.8");
		
		const trailStop2 = document.createElementNS(svgNamespace, "stop");
		trailStop2.setAttribute("offset", "100%");
		trailStop2.setAttribute("stop-color", "#4299E1");
		trailStop2.setAttribute("stop-opacity", "0.2");
		
		trailGradient.appendChild(trailStop1);
		trailGradient.appendChild(trailStop2);
		
		defs.appendChild(magicGradient);
		defs.appendChild(trailGradient);
		svg.appendChild(defs);
		
		// Button base
		const buttonBg = document.createElementNS(svgNamespace, "circle");
		buttonBg.setAttribute("class", "button-bg");
		buttonBg.setAttribute("cx", "50");
		buttonBg.setAttribute("cy", "50");
		buttonBg.setAttribute("r", "40");
		svg.appendChild(buttonBg);
		
		// Magic circle
		const magicCircle = document.createElementNS(svgNamespace, "circle");
		magicCircle.setAttribute("class", "magic-circle");
		magicCircle.setAttribute("cx", "50");
		magicCircle.setAttribute("cy", "50");
		magicCircle.setAttribute("r", "42");
		svg.appendChild(magicCircle);
		
		// Runes group
		const runesGroup = document.createElementNS(svgNamespace, "g");
		runesGroup.setAttribute("class", "runes-group");
		
		// Center rune
		const centralRune = document.createElementNS(svgNamespace, "line");
		centralRune.setAttribute("class", "rune central-rune");
		centralRune.setAttribute("x1", "30");
		centralRune.setAttribute("y1", "50");
		centralRune.setAttribute("x2", "70");
		centralRune.setAttribute("y2", "50");
		centralRune.setAttribute("stroke-width", "4");
		runesGroup.appendChild(centralRune);
		
		// Top rune
		const topRune = document.createElementNS(svgNamespace, "path");
		topRune.setAttribute("class", "rune top-rune");
		topRune.setAttribute("d", "M35 35 C40 25, 60 25, 65 35");
		topRune.setAttribute("stroke-width", "4");
		runesGroup.appendChild(topRune);
		
		const topRuneDot = document.createElementNS(svgNamespace, "circle");
		topRuneDot.setAttribute("class", "top-rune-dot");
		topRuneDot.setAttribute("cx", "50");
		topRuneDot.setAttribute("cy", "35");
		topRuneDot.setAttribute("r", "3");
		runesGroup.appendChild(topRuneDot);
		
		// Bottom rune
		const bottomRune = document.createElementNS(svgNamespace, "path");
		bottomRune.setAttribute("class", "rune bottom-rune");
		bottomRune.setAttribute("d", "M35 65 L50 55 L65 65 L50 75 Z");
		bottomRune.setAttribute("stroke-width", "4");
		bottomRune.setAttribute("fill", "none");
		runesGroup.appendChild(bottomRune);
		
		svg.appendChild(runesGroup);
		
		// Attack trail
		const attackTrail = document.createElementNS(svgNamespace, "path");
		attackTrail.setAttribute("class", "attack-trail");
		attackTrail.setAttribute("d", "M50 15 C30 25, 20 45, 50 85");
		svg.appendChild(attackTrail);
		
		// Sword group
		const swordGroup = document.createElementNS(svgNamespace, "g");
		swordGroup.setAttribute("class", "sword-group");
		
		// Sword blade
		const swordBlade = document.createElementNS(svgNamespace, "line");
		swordBlade.setAttribute("class", "sword-blade");
		swordBlade.setAttribute("x1", "50");
		swordBlade.setAttribute("y1", "15");
		swordBlade.setAttribute("x2", "50");
		swordBlade.setAttribute("y2", "70");
		swordBlade.setAttribute("stroke-width", "7");
		swordBlade.setAttribute("stroke-linecap", "round");
		swordGroup.appendChild(swordBlade);
		
		// Sword guard
		const swordGuard = document.createElementNS(svgNamespace, "line");
		swordGuard.setAttribute("class", "sword-guard");
		swordGuard.setAttribute("x1", "35");
		swordGuard.setAttribute("y1", "70");
		swordGuard.setAttribute("x2", "65");
		swordGuard.setAttribute("y2", "70");
		swordGuard.setAttribute("stroke-width", "5");
		swordGuard.setAttribute("stroke-linecap", "round");
		swordGroup.appendChild(swordGuard);
		
		// Sword handle
		const swordHandle = document.createElementNS(svgNamespace, "line");
		swordHandle.setAttribute("class", "sword-handle");
		swordHandle.setAttribute("x1", "50");
		swordHandle.setAttribute("y1", "70");
		swordHandle.setAttribute("x2", "50");
		swordHandle.setAttribute("y2", "85");
		swordHandle.setAttribute("stroke-width", "6");
		swordHandle.setAttribute("stroke-linecap", "round");
		swordGroup.appendChild(swordHandle);
		
		// Sword pommel
		const swordPommel = document.createElementNS(svgNamespace, "circle");
		swordPommel.setAttribute("class", "sword-pommel");
		swordPommel.setAttribute("cx", "50");
		swordPommel.setAttribute("cy", "88");
		swordPommel.setAttribute("r", "4");
		swordGroup.appendChild(swordPommel);
		
		// Blade shine
		const swordShine = document.createElementNS(svgNamespace, "line");
		swordShine.setAttribute("class", "sword-shine");
		swordShine.setAttribute("x1", "53");
		swordShine.setAttribute("y1", "20");
		swordShine.setAttribute("x2", "53");
		swordShine.setAttribute("y2", "65");
		swordShine.setAttribute("stroke-width", "2");
		swordShine.setAttribute("stroke-linecap", "round");
		swordGroup.appendChild(swordShine);
		
		svg.appendChild(swordGroup);
		
		// Add SVG to button
		toggleButton.appendChild(svg);
		
		// Animation control
		let isAnimating = false;
		
		// Add click listener
		toggleButton.addEventListener('click', function() 
		{
			if (isAnimating) 
			{
				return;
			}
			// Get button state after click
			const isExpanded = this.getAttribute('aria-expanded') === 'true';
			if (isExpanded) 
			{
				// Menu is opening, animate the sword
				isAnimating = true;
				// Animation sequence
				setTimeout(() => {
					swordGroup.classList.add('attacking-step1');
					attackTrail.classList.add('visible');
					setTimeout(() => {
						swordGroup.classList.remove('attacking-step1');
						swordGroup.classList.add('attacking-step2');
						setTimeout(() => {
							attackTrail.classList.remove('visible');
							swordGroup.classList.remove('attacking-step2');
							swordGroup.classList.add('attacking-step3');
							setTimeout(() => {
								swordGroup.classList.remove('attacking-step3');
								isAnimating = false;
							}, 75);
						}, 75);
					}, 75);
				}, 75);
			} 
			else 
			{
				// CSS transition will handle closing
				isAnimating = false;
			}
		});
	}
}

export function createSwordButton() 
{
  return new SwordButtonComponent();
}