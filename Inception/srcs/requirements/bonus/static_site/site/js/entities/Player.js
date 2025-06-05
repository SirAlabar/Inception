
class Player extends Entity 
{
    constructor(game, x, y)
    {
      super();
      this.game = game;
      
      this.addComponent(new TransformComponent(x, y));
      this.addComponent(new SpriteComponent(
        game.assetManager.getTexture('player_idle'),
        {
          idle: {
            frameWidth: 128,
            frameHeight: 128,
            frames: 12,
            animationSpeed: 0.1
          },
          walking: {
            frameWidth: 128,
            frameHeight: 128,
            frames: 6,
            animationSpeed: 0.2
          },
          attacking: {
            frameWidth: 128,
            frameHeight: 128,
            frames: 8,
            animationSpeed: 0.15
          }
        }
      ));
      this.addComponent(new StateComponent(this));
      this.addComponent(new MovementComponent(this, 3));
      this.addComponent(new HealthComponent(this, {
        maxHealth: 100,
        minDamage: 20,
        maxDamage: 30}));
      this.addComponent(new ColliderComponent(this, 40, 40));

      this.isAttacking = false;
      this.attackRange = 50;
    }
    
    attack() 
    {
      if (this.isAttacking) return;
      
      this.isAttacking = true;
      this.emit('attacked');

      setTimeout(() => {
        this.isAttacking = false;
        
        if (this.getComponent('Movement').isMoving) 
        {
          this.emit('moved', this.getComponent('Movement').direction);
        } 
        else 
        {
          this.emit('stopped');
        }
      }, 500);
    }
}