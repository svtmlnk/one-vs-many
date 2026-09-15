import { GameObjects, Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/constaints";

export class Enemy extends Entity {
  textureKey: string;
  moveSpeed: number;
  interactionZone: GameObjects.Zone;
  enemyHealth: 100;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    type?: string,
  ) {
    super(scene, x, y, texture, type);

    this.textureKey = texture;
    this.moveSpeed = 500;
    this.setSize(40, 45);
    this.setScale(1.5);

    scene.anims.create({
      key: "enemy_idle",
      frames: scene.anims.generateFrameNumbers(SPRITES.ENEMY, {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.play("enemy_idle", true);
  }

  update() {
  }
}
