import { GameObjects, Physics, Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/constaints";

export class Player extends Entity {
  textureKey: string;
  moveSpeed: number;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  interactionZone: GameObjects.Zone;
  private currentSide: "right" | "left";

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
        frames: [{ key: SPRITES.PLAYER, frame: 2 }],
        frameRate: 20,
      });
    }

    if (!scene.anims.exists("jump")) {
      scene.anims.create({
        key: "jump",
        frames: [{ key: SPRITES.PLAYER, frame: 5 }],
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

    this.scene.input.keyboard!.on("keydown-Z", () => {
      console.log("z");
    });

    this.scene.input.keyboard!.on("keydown-Z", () => {
      console.log("x");
    });

    // creating interaction zone for player
    this.interactionZone = this.scene.add.zone(this.x, this.y + 30, 10, 10);
    this.scene.physics.add.existing(this.interactionZone);
    (this.interactionZone.body as Physics.Arcade.Body).setAllowGravity(false);
  }

  update() {
    if (this.keys.left.isDown) {
      this.setVelocityX(-this.moveSpeed);
      this.anims.play("left", true);
      this.currentSide = "left";
    } else if (this.keys.right.isDown) {
      this.setVelocityX(this.moveSpeed);
      this.anims.play("right", true);
      this.currentSide = "right";
    } else {
      this.setVelocityX(0);
      this.anims.play("turn", true);
    }

    // switching positions for interaction zone
    switch (this.currentSide) {
      case "left":
        this.interactionZone.setPosition(this.x - 50, this.y);
        break;

      case "right":
        this.interactionZone.setPosition(this.x + 50, this.y);
        break;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.keys.space.isDown && body.touching.down) {
      this.setVelocityY(-330);
      // this.anims.play("jump", true);
    }
  }
}
