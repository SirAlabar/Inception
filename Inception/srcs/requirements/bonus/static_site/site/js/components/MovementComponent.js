
class MovementComponent 
{
		constructor(entity, speed) 
		{
			this.entity = entity;
			this.speed = speed || 3;
			this.direction = 'down';
			this.isMoving = false;
		}
		
		move(deltaTime, direction) 
		{
				const directionVector = {
						up: { x: 0, y: -1 },
						down: { x: 0, y: 1 },
						left: { x: -1, y: 0 },
						right: { x: 1, y: 0 }
				}[direction];
			
				if (directionVector) 
				{
						this.direction = direction;
						this.isMoving = true;
						
						const position = this.entity.getComponent('Transform').position;
						position.x += directionVector.x * this.speed * deltaTime;
						position.y += directionVector.y * this.speed * deltaTime;
						
						this.entity.emit('moved', direction);
				}
		}
		
		stop() 
		{
			this.isMoving = false;
			this.entity.emit('stopped');
		}
}