import { Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/constaints";

export class Player extends Entity {
  textureKey: string;
  moveSpeed: number;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;

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

    // Аналог cursors = this.input.keyboard.createCursorKeys()
    this.keys = scene.input.keyboard!.createCursorKeys();

    // Анимации лучше создавать через scene.anims
    if (!scene.anims.exists("left")) {
      scene.anims.create({
        key: "left",
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER, {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("turn")) {
      scene.anims.create({
        key: "turn",
        frames: [{ key: SPRITES.PLAYER, frame: 4 }],
        frameRate: 20,
      });
    }

    if (!scene.anims.exists("right")) {
      scene.anims.create({
        key: "right",
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER, {
          start: 5,
          end: 8,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  update() {
    if (this.keys.left.isDown) {
      this.setVelocityX(-this.moveSpeed);
      this.anims.play("left", true);
    } else if (this.keys.right.isDown) {
      this.setVelocityX(this.moveSpeed);
      this.anims.play("right", true);
    } else {
      this.setVelocityX(0);
      this.anims.play("turn", true);
    }

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.keys.space.isDown && body.touching.down) {
      this.setVelocityY(-330);
    }
  }
}