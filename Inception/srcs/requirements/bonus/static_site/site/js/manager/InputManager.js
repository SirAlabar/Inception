
class InputManager 
{
		constructor(game) 
		{
			this.game = game;
			this.keys = {
				ArrowUp: false,
				ArrowDown: false,
				ArrowLeft: false,
				ArrowRight: false,
				w: false,
				s: false,
				a: false,
				d: false,
				e: false,
				E: false
			};
			
			this.setupListeners();
		}
		
		setupListeners() 
		{
			document.addEventListener('keydown', (e) => {
				if (this.keys.hasOwnProperty(e.key)) 
				{
					this.keys[e.key] = true;
					this.processInput();
				}
			});
			
			document.addEventListener('keyup', (e) => {
				if (this.keys.hasOwnProperty(e.key)) 
				{
					this.keys[e.key] = false;
					this.processInput();
				}
			});
		}
		
		processInput() 
		{
				const player = this.game.player;
				
				if (!player)
				{
						return;
				}
				if (this.keys.e || this.keys.E)
				{
						player.attack();
						return;
				}
				
				const movement = player.getComponent('Movement');
				
				let direction = null;
				if (this.keys.ArrowUp || this.keys.w || this.keys.W) direction = 'up';
				if (this.keys.ArrowDown || this.keys.s || this.keys.S) direction = 'down';
				if (this.keys.ArrowLeft || this.keys.a || this.keys.A) direction = 'left';
				if (this.keys.ArrowRight || this.keys.d || this.keys.D) direction = 'right';
				
				if (direction) 
				{
					movement.move(deltaTime, direction);
				} 
				else 
				{
						movement.stop();
				}
		}

		update(deltaTime) 
		{
				this.processInput(deltaTime);
		}
}