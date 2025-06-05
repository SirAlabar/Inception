
class HealthComponent 
{
		constructor(entity, config) 
		{
			this.entity = entity;
			this.health = config.maxHealth;
			this.maxHealth = config.maxHealth;
			this.isInvulnerable = false;
			this.isDead = false;
		}
		
		takeDamage(damage) 
		{
				if (this.isInvulnerable || this.isDead) return;
			
				this.health -= damage;
				
				this.entity.emit('damaged', damage);
			
				if (this.health <= 0) 
				{
						this.die();
				} 
				else 
				{
						this.makeInvulnerable(500);
				}
				}
		
		die() 
		{
			this.isDead = true;
			this.health = 0;
			this.entity.emit('died');
		}
	}