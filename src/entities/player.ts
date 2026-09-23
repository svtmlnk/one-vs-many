import { GameObjects, Math, Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/containts";

export class Player extends Entity {
  textureKey: string;
  moveSpeed: number;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private healthText: GameObjects.Text;

  // player's actions
  private currentSide: "right" | "left";
  private isAttacking = false;
  private firstAttack = true;
  private canDash = true;
  private isAlive: boolean;
  public onDeath?: (player: Player) => void;

  // finding enemies
  enemies: Entity[];
  target: Entity;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    type?: string,
  ) {
    super(scene, x, y, texture, type);

    this.textureKey = texture;
    this.moveSpeed = 600;
    this.setSize(40, 45);
    this.currentSide = "right";
    this.isAlive = true;

    // Аналог cursors = this.input.keyboard.createCursorKeys()
    this.keys = scene.input.keyboard!.createCursorKeys();

    // for player's body working
    const body = this.body as Phaser.Physics.Arcade.Body;

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
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_JUMP, {
          start: 0,
          end: 1,
        }),
        frameRate: 5,
      });
    }

    if (!scene.anims.exists("fall")) {
      scene.anims.create({
        key: "fall",
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_FALL, {
          start: 0,
          end: 1,
        }),
        frameRate: 5,
      });
    }

    if (!scene.anims.exists("death")) {
      scene.anims.create({
        key: "death",
        frames: scene.anims.generateFrameNumbers(SPRITES.PLAYER_DEATH, {
          start: 0,
          end: 5,
        }),
        frameRate: 5,
      });
    }

    this.healthText = scene.add.text(600, 350, `${this.health}`, {
      fontSize: "32px",
      color: "#ffffff",
    });

    this.healthText.setOrigin(0.5);
    this.healthText.setScrollFactor(0);

    // attack functionality and animation
    this.scene.input.keyboard!.on("keydown-Z", () => {
      if (!this.isAlive) {
        return;
      }

      const body = this.body as Phaser.Physics.Arcade.Body;

      if (body.touching.down && !this.isAttacking) {
        this.isAttacking = true;

        // getting out target for attacking
        const target = this.findTarget(this.enemies);
        if (target) {
          this.attack(target);
        }

        if (this.firstAttack) {
          this.anims.play("attack1");
          this.firstAttack = false;
        } else {
          this.anims.play("attack2");
          this.firstAttack = true;
        }
      }
    });

    this.on("animationcomplete", (animation: Phaser.Animations.Animation) => {
      if (animation.key === "attack1" || animation.key === "attack2") {
        this.isAttacking = false;
      }
    });

    // dash functionality
    this.scene.input.keyboard!.on("keydown-SHIFT", () => {
      if (!this.isAlive) {
        return;
      }

      if (body.touching.down && !this.isAttacking && this.canDash) {
        const direction = this.currentSide === "left" ? -1 : 1;

        this.scene.tweens.add({
          targets: this,
          x: this.x + 300 * direction,
          duration: 400,
          ease: "Power2",
        });

        this.canDash = false;

        this.scene.time.delayedCall(1500, () => {
          this.canDash = true;
        });
      }
    });
  }

  // getting enemies from current scene
  setEnemies(enemies: Entity[]) {
    this.enemies = enemies;
  }

  // finding close enemy
  private findTarget(enemies: Entity[]) {
    let target = null;
    let minDistance = Infinity;

    for (const enemy of enemies) {
      const distanceToEnemy = Math.Distance.Between(
        this.x,
        this.y,
        enemy.x,
        enemy.y,
      );

      if (distanceToEnemy < minDistance) {
        minDistance = distanceToEnemy;
        target = enemy;
      }
    }
    return target;
  }

  // attack functionality
  attack(target: Entity) {
    const distanceToEnemy = Math.Distance.Between(
      this.x,
      this.y,
      target.x,
      target.y,
    );

    // если противник не далеко от нас, то он получает урон
    if (distanceToEnemy < 50) {
      target.takeDamage(35);
    }
  }

  // getting damage and death functionality
  takeDamage(damage: number) {
    super.takeDamage(damage);

    this.healthText.setText(`${this.health}`);

    if (this.health <= 0) {
      this.deactivate();
    }
  }

  deactivate() {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;

    // this.setVelocity(0, 0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.anims.play("death");
    console.log("game over");
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // death
    if (!this.isAlive) {
      this.setVelocity(0, 0);
      return;
    }

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

    // attack animation
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
