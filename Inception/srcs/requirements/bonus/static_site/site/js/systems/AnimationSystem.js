
class AnimationSystem 
{
    constructor(game) 
    {
        this.game = game;
        this.entities = [];
    }

    registerEntity(entity) 
    {
        if (entity.hasComponent('Sprite') && entity.hasComponent('State')) 
        {
            this.entities.push(entity);
            
            entity.on('moved', (direction) => {entity.getComponent('State').setState('walking', direction);});
            
            entity.on('stopped', () => {entity.getComponent('State').setState('idle');});
            
            entity.on('attacked', () => {entity.getComponent('State').setState('attacking');});
            
            entity.on('damaged', () => {entity.getComponent('State').setState('hurt');});
            
            entity.on('died', () => {entity.getComponent('State').setState('dying');});
        }
    }

    update(deltaTime) 
    {
        this.entities.forEach(entity => {
        const spriteComponent = entity.getComponent('Sprite');
        spriteComponent.update(deltaTime);
        });
    }
}