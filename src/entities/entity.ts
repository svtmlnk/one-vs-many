import { Physics, Scene } from "phaser";

// GameObjects is using for objects-decorations, not for creating player. We should use Physics.Arcade
// parent class for other entity objects
export class Entity extends Physics.Arcade.Sprite {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    type?: string,
  ) {
    super(scene, x, y, texture, type);
    this.scene = scene;

    // adding two types of entity existing (visual and physical)
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }
}
