import { GameObjects, Physics, Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/constaints";

export class Player extends Entity {
  textureKey: string;
  moveSpeed: number;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  interactionZone: GameObjects.Zone;
  // private currentSide: "right" | "left";

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

    // Аналог cursors = this.input.keyboard.createCursorKeys()
    this.keys = scene.input.keyboard!.createCursorKeys();

    // Анимации лучше создавать через scene.anims
    if (!scene.anims.exists("run")) {
      scene.anims.create({
        key: "run",
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_RUN, {
          start: 0,
          end: 7,
        }),
        frameRate: 15,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("idle")) {
      scene.anims.create({
        key: "idle",
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER, {
          start: 0,
          end: 6,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("attack1")) {
      scene.anims.create({
        key: "attack1",
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_A1, {
          start: 0,
          end: 5,
        }),
        frameRate: 20,
        repeat: 0,
      });
    }

    if (!scene.anims.exists("attack2")) {
      scene.anims.create({
        key: "attack2",
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_A2, {
          start: 0,
          end: 5,
        }),
        frameRate: 20,
        repeat: 0,
      });
    }

    if (!scene.anims.exists("jump")) {
      scene.anims.create({
        key: "jump",
        frames: [{ key: SPRITES.PLAYER_JUMP, frame: 0 }],
        frameRate: 20,
      });
    }

    if (!scene.anims.exists("fall")) {
      scene.anims.create({
        key: "fall",
        frames: [{ key: SPRITES.PLAYER_FALL, frame: 0 }],
        frameRate: 20,
      });
    }

    this.scene.input.keyboard!.on("keydown-Z", () => {
      console.log("z");
      this.anims.play("attack1", true);
    });
    
    this.scene.input.keyboard!.on("keydown-X", () => {
      console.log("x");
      this.anims.play("attack2", true);
    });

    // // creating interaction zone for player
    // this.interactionZone = this.scene.add.zone(this.x, this.y + 30, 10, 10);
    // this.scene.physics.add.existing(this.interactionZone);
    // (this.interactionZone.body as Physics.Arcade.Body).setAllowGravity(false);
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // moving
    if (this.keys.left.isDown) {
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true);
      // this.currentSide = "left";
    } else if (this.keys.right.isDown) {
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
      // this.currentSide = "right";
    } else {
      this.setVelocityX(0);
    }

    // jump
    if (this.keys.space.isDown && body.touching.down) {
      this.setVelocityY(-330);
    }

    // animation
    if (!body.touching.down) {
      // В воздухе всегда jump
      if (body.velocity.y < 0) {
        this.anims.play("jump", true);
      } else {
        this.anims.play("fall", true);
      }
    } else if (this.keys.left.isDown || this.keys.right.isDown) {
      // На земле и движемся
      this.anims.play("run", true);
    } else {
      // На земле и стоим
      // this.anims.play("idle", true);
      this.anims.play("attack1", true);
    }

    // // switching positions for interaction zone
    // switch (this.currentSide) {
    //   case "left":
    //     this.interactionZone.setPosition(this.x - 50, this.y);
    //     break;
    //   case "right":
    //     this.interactionZone.setPosition(this.x + 50, this.y);
    //     break;
    // }
  }
}
