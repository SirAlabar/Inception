// // Entity.js - Base class for all game entities
// class Entity extends PIXI.utils.EventEmitter {
//     constructor(id) {
//         super();
//         this.id = id || crypto.randomUUID();
//         this.components = new Map();
//     }
    
//     addComponent(name, component) {
//         this.components.set(name, component);
//         return this;
//     }
    
//     getComponent(name) {
//         return this.components.get(name);
//     }
    
//     removeComponent(name) {
//         this.components.delete(name);
//     }
    
//     hasComponent(name) {
//         return this.components.has(name);
//     }
    
//     update(deltaTime) {
//         // Update all components
//         this.components.forEach(component => {
//             if (component.update) {
//                 component.update(deltaTime);
//             }
//         });
//     }
// }