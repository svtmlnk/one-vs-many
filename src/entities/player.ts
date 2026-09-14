import { GameObjects, Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/constaints";

export class Player extends Entity {
  textureKey: string;
  moveSpeed: number;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  interactionZone: GameObjects.Zone;
  private isAttacking = false;
  private currentSide: "right" | "left";
  private canDash = true;

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
    this.currentSide = "right";

    // Аналог cursors = this.input.keyboard.createCursorKeys()
    this.keys = scene.input.keyboard!.createCursorKeys();

    scene.anims.create({
      key: "run",
      frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_RUN, {
        start: 0,
        end: 7,
      }),
      frameRate: 15,
      repeat: -1,
    });

    scene.anims.create({
      key: "idle",
      frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER, {
        start: 0,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: "attack1",
      frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_A1, {
        start: 0,
        end: 5,
      }),
      frameRate: 20,
      repeat: 0,
    });

    scene.anims.create({
      key: "attack2",
      frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_A2, {
        start: 0,
        end: 5,
      }),
      frameRate: 20,
      repeat: 0,
    });

    scene.anims.create({
      key: "jump",
      frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_JUMP, {
        start: 0,
        end: 1,
      }),
      frameRate: 5,
    });

    scene.anims.create({
      key: "fall",
      frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_FALL, {
        start: 0,
        end: 1,
      }),
      frameRate: 5,
    });

    // attack functionality and animation
    // в будущем нужно реализовать анимацию атак во время бега
    this.scene.input.keyboard!.on("keydown-Z", () => {
      const body = this.body as Phaser.Physics.Arcade.Body;

      if (body.touching.down && !this.isAttacking) {
        this.isAttacking = true;
        this.anims.play("attack1");
      }
    });

    this.scene.input.keyboard!.on("keydown-X", () => {
      const body = this.body as Phaser.Physics.Arcade.Body;

      if (body.touching.down && !this.isAttacking) {
        this.isAttacking = true;
        this.anims.play("attack2");
      }
    });

    this.on("animationcomplete", (animation: Phaser.Animations.Animation) => {
      if (animation.key === "attack1" || animation.key === "attack2") {
        this.isAttacking = false;
      }
    });

    // dash functionality
    // в будущем нужно добавить анимацию уворота
    this.scene.input.keyboard!.on("keydown-SHIFT", () => {
      const body = this.body as Phaser.Physics.Arcade.Body;

      if (body.touching.down && !this.isAttacking && this.canDash) {
        const direction = this.currentSide === "left" ? -1 : 1;

        this.scene.tweens.add({
          targets: this,
          x: this.x + 300 * direction,
          duration: 400,
          ease: "Power2",
        });

        this.canDash = false;
        console.log('no')
        
        setTimeout(() => {
          this.canDash = true;
          console.log('yes')
        }, 1500);
      }
    });
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // moving
    if (this.keys.left.isDown && !this.isAttacking) {
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true);
      this.currentSide = "left";
    } else if (this.keys.right.isDown && !this.isAttacking) {
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
      this.currentSide = "right";
    } else {
      this.setVelocityX(0);
    }

    // jump
    if (this.keys.space.isDown && body.touching.down) {
      this.setVelocityY(-330);
    }

    // animation
    if (this.isAttacking) {
      // Во время атаки ничего не меняем
      return;
    }

    if (!body.touching.down) {
      // В воздухе
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
      this.anims.play("idle", true);
    }
  }
}
