
class Slime extends Entity 
{
    constructor(game, x, y, id) 
    {
      super();
      this.game = game;
      this.id = id;
      
      this.addComponent(new TransformComponent(x, y));
      this.addComponent(new SpriteComponent(
        game.assetManager.getTexture('slime_idle'),
        {
          idle: {
            frameWidth: 64,
            frameHeight: 64,
            frames: 6,
            animationSpeed: 0.1
          },
          walking: {
            frameWidth: 64,
            frameHeight: 64,
            frames: 8,
            animationSpeed: 0.15
          },
          attacking: {
            frameWidth: 64,
            frameHeight: 64,
            frames: 10,
            animationSpeed: 0.2
          },
          hurt: {
            frameWidth: 64,
            frameHeight: 64,
            frames: 5,
            animationSpeed: 0.2
          },
          dying: {
            frameWidth: 64,
            frameHeight: 64,
            frames: 5,
            animationSpeed: 0.15,
            loop: false
          }
        }
      ));
      this.addComponent(new StateComponent(this));
      this.addComponent(new MovementComponent(this, 0.25));
      this.addComponent(new HealthComponent(this, {
        maxHealth: 50,
        minDamage: 10,
        maxDamage: 15}));
      this.addComponent(new ColliderComponent(this, 32, 32));
      this.addComponent(new AIComponent(this));
    }
  }