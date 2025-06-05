
class CombatSystem 
{
    constructor(game) 
    {
        this.game = game;
        this.entities = [];
    }

    registerEntity(entity) 
    {
        if (entity.hasComponent('Health')) 
        {
            this.entities.push(entity);
        }
    }

    checkAttacks() 
    {
        const player = this.game.player;
        if (!player.isAttacking) return;

        this.entities.forEach(entity => {
            if (entity !== player && !entity.getComponent('Health').isDead) 
            {
                const distance = this.getDistance(player, entity);
                if (distance <= player.attackRange) 
                {
                    const damage = this.calculateDamage(player);
                    entity.getComponent('Health').takeDamage(damage);
                }
            }
        });
    }

    calculateDamage(attacker) 
    {
        const config = attacker.config;
        return Math.floor(Math.random() * (config.maxDamage - config.minDamage + 1)) + config.minDamage;
    }

    getDistance(entity1, entity2) 
    {
        const pos1 = entity1.getComponent('Transform').position;
        const pos2 = entity2.getComponent('Transform').position;

        return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
    }
}