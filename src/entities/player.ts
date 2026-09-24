import { GameObjects, Math as PhaserMath, Scene } from "phaser";

import { Entity } from "./entity";
import { SPRITES } from "../utils/containts";

export class Player extends Entity {
  textureKey: string;
  moveSpeed: number;

  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private healthText: GameObjects.Text;

  // ==========================================
  // PLAYER ACTIONS
  // ==========================================

  private currentSide: "right" | "left";
  private isAttacking = false;
  private firstAttack = true;
  private canDash = true;
  private isAlive: boolean;

  public onDeath?: (player: Player) => void;

  // ==========================================
  // ENEMIES
  // ==========================================

  enemies: Entity[] = [];
  target: Entity;

  // ==========================================
  // HEALTH REGENERATION
  // ==========================================

  private readonly healthRegenDelay = 3000;
  private readonly healthRegenAmount = 5;
  private readonly healthRegenInterval = 1000;

  private healthRegenTimer?: Phaser.Time.TimerEvent;

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

    // ==========================================
    // KEYBOARD
    // ==========================================

    this.keys = scene.input.keyboard!.createCursorKeys();

    // ==========================================
    // ANIMATIONS
    // ==========================================

    if (!scene.anims.exists("run")) {
      scene.anims.create({
        key: "run",
        frames: scene.anims.generateFrameNumbers(
          SPRITES.PLAYER_RUN,
          {
            start: 0,
            end: 7,
          },
        ),
        frameRate: 15,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("idle")) {
      scene.anims.create({
        key: "idle",
        frames: scene.anims.generateFrameNumbers(
          SPRITES.PLAYER,
          {
            start: 0,
            end: 6,
          },
        ),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("attack1")) {
      scene.anims.create({
        key: "attack1",
        frames: scene.anims.generateFrameNumbers(
          SPRITES.PLAYER_A1,
          {
            start: 0,
            end: 5,
          },
        ),
        frameRate: 20,
        repeat: 0,
      });
    }

    if (!scene.anims.exists("attack2")) {
      scene.anims.create({
        key: "attack2",
        frames: scene.anims.generateFrameNumbers(
          SPRITES.PLAYER_A2,
          {
            start: 0,
            end: 5,
          },
        ),
        frameRate: 20,
        repeat: 0,
      });
    }

    if (!scene.anims.exists("jump")) {
      scene.anims.create({
        key: "jump",
        frames: scene.anims.generateFrameNumbers(
          SPRITES.PLAYER_JUMP,
          {
            start: 0,
            end: 1,
          },
        ),
        frameRate: 5,
      });
    }

    if (!scene.anims.exists("fall")) {
      scene.anims.create({
        key: "fall",
        frames: scene.anims.generateFrameNumbers(
          SPRITES.PLAYER_FALL,
          {
            start: 0,
            end: 1,
          },
        ),
        frameRate: 5,
      });
    }

    if (!scene.anims.exists("death")) {
      scene.anims.create({
        key: "death",
        frames: scene.anims.generateFrameNumbers(
          SPRITES.PLAYER_DEATH,
          {
            start: 0,
            end: 5,
          },
        ),
        frameRate: 5,
      });
    }

    // ==========================================
    // HEALTH TEXT
    // ==========================================

    this.healthText = scene.add.text(
      600,
      350,
      `${this.health}`,
      {
        fontSize: "32px",
        color: "#ffffff",
      },
    );

    this.healthText.setOrigin(0.5);
    this.healthText.setScrollFactor(0);

    // ==========================================
    // PLAYER ATTACK
    // ==========================================

    this.scene.input.keyboard!.on("keydown-Z", () => {
      if (!this.isAlive) {
        return;
      }

      const body =
        this.body as Phaser.Physics.Arcade.Body;

      if (
        body.touching.down &&
        !this.isAttacking
      ) {
        this.isAttacking = true;

        const target = this.findTarget(
          this.enemies,
        );

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

    // ==========================================
    // ATTACK ANIMATION COMPLETE
    // ==========================================

    this.on(
      "animationcomplete",
      (
        animation: Phaser.Animations.Animation,
      ) => {
        if (
          animation.key === "attack1" ||
          animation.key === "attack2"
        ) {
          this.isAttacking = false;
        }
      },
    );

    // ==========================================
    // DASH
    // ==========================================

    this.scene.input.keyboard!.on(
      "keydown-SHIFT",
      () => {
        if (!this.isAlive) {
          return;
        }

        const body =
          this.body as Phaser.Physics.Arcade.Body;

        if (
          body.touching.down &&
          !this.isAttacking &&
          this.canDash
        ) {
          const direction =
            this.currentSide === "left"
              ? -1
              : 1;

          this.scene.tweens.add({
            targets: this,
            x:
              this.x +
              300 * direction,
            duration: 400,
            ease: "Power2",
          });

          this.canDash = false;

          this.scene.time.delayedCall(
            1500,
            () => {
              this.canDash = true;
            },
          );
        }
      },
    );
  }

  // ==========================================
  // ENEMIES
  // ==========================================

  setEnemies(enemies: Entity[]) {
    this.enemies = enemies;
  }

  // ==========================================
  // FIND TARGET
  // ==========================================

  private findTarget(
    enemies: Entity[],
  ): Entity | null {
    let target: Entity | null = null;

    let minDistance = Infinity;

    for (const enemy of enemies) {
      if (!enemy.active) {
        continue;
      }

      if (enemy.health <= 0) {
        continue;
      }

      const distanceToEnemy =
        PhaserMath.Distance.Between(
          this.x,
          this.y,
          enemy.x,
          enemy.y,
        );

      if (
        distanceToEnemy <
        minDistance
      ) {
        minDistance = distanceToEnemy;
        target = enemy;
      }
    }

    return target;
  }

  // ==========================================
  // PLAYER ATTACK
  // ==========================================

  attack(target: Entity) {
    if (!this.isAlive) {
      return;
    }

    const distanceToEnemy =
      PhaserMath.Distance.Between(
        this.x,
        this.y,
        target.x,
        target.y,
      );

    if (distanceToEnemy < 50) {
      target.takeDamage(35);
    }
  }

  // ==========================================
  // TAKE DAMAGE
  // ==========================================

  takeDamage(damage: number) {
    if (!this.isAlive) {
      return;
    }

    super.takeDamage(damage);

    this.healthText.setText(
      `${this.health}`,
    );

    // Каждый раз после получения
    // урона начинаем отсчёт регенерации заново
    this.startHealthRegeneration();

    if (this.health <= 0) {
      this.deactivate();
    }
  }

  // ==========================================
  // HEALTH REGENERATION
  // ==========================================

  private startHealthRegeneration() {
    // Удаляем старый таймер
    if (this.healthRegenTimer) {
      this.healthRegenTimer.remove();
    }

    // Новый таймер:
    // сначала ждём 3 секунды,
    // потом восстанавливаем HP каждую секунду
    this.healthRegenTimer =
      this.scene.time.addEvent({
        delay: this.healthRegenDelay,
        callback: () => {
          if (!this.isAlive) {
            return;
          }

          if (
            this.health >=
            this.maxHealth
          ) {
            this.healthRegenTimer?.remove();
            return;
          }

          this.health = Math.min(
            this.maxHealth,
            this.health +
              this.healthRegenAmount,
          );

          this.healthText.setText(
            `${this.health}`,
          );
        },
        callbackScope: this,
        loop: false,
      });

    // После задержки запускаем
    // постоянное восстановление
    this.scene.time.delayedCall(
      this.healthRegenDelay,
      () => {
        if (!this.isAlive) {
          return;
        }

        if (this.health >= this.maxHealth) {
          return;
        }

        if (this.healthRegenTimer) {
          this.healthRegenTimer.remove();
        }

        this.healthRegenTimer =
          this.scene.time.addEvent({
            delay: this.healthRegenInterval,
            callback: () => {
              if (!this.isAlive) {
                this.healthRegenTimer?.remove();
                return;
              }

              if (
                this.health >=
                this.maxHealth
              ) {
                this.healthRegenTimer?.remove();
                return;
              }

              this.health = Math.min(
                this.maxHealth,
                this.health +
                  this.healthRegenAmount,
              );

              this.healthText.setText(
                `${this.health}`,
              );
            },
            callbackScope: this,
            loop: true,
          });
      },
    );
  }

  // ==========================================
  // DEATH
  // ==========================================

  deactivate() {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;

    // Останавливаем регенерацию
    if (this.healthRegenTimer) {
      this.healthRegenTimer.remove();
      this.healthRegenTimer = undefined;
    }

    // Останавливаем физическое тело
    const body =
      this.body as Phaser.Physics.Arcade.Body;

    body.enable = false;

    this.setVelocity(0, 0);

    this.anims.play("death");

    console.log("game over");

    if (this.onDeath) {
      this.onDeath(this);
    }
  }

  // ==========================================
  // UPDATE
  // ==========================================

  update() {
    const body =
      this.body as Phaser.Physics.Arcade.Body;

    // ==========================================
    // DEATH
    // ==========================================

    if (!this.isAlive) {
      this.setVelocity(0, 0);
      return;
    }

    // ==========================================
    // MOVEMENT
    // ==========================================

    if (
      this.keys.left.isDown &&
      !this.isAttacking
    ) {
      this.setVelocityX(
        -this.moveSpeed,
      );

      this.setFlipX(true);

      this.currentSide = "left";
    } else if (
      this.keys.right.isDown &&
      !this.isAttacking
    ) {
      this.setVelocityX(
        this.moveSpeed,
      );

      this.setFlipX(false);

      this.currentSide = "right";
    } else {
      this.setVelocityX(0);
    }

    // ==========================================
    // JUMP
    // ==========================================

    if (
      this.keys.space.isDown &&
      body.touching.down
    ) {
      this.setVelocityY(-330);
    }

    // ==========================================
    // ATTACK
    // ==========================================

    if (this.isAttacking) {
      return;
    }

    // ==========================================
    // ANIMATIONS
    // ==========================================

    if (!body.touching.down) {
      if (body.velocity.y < 0) {
        this.anims.play("jump", true);
      } else {
        this.anims.play("fall", true);
      }
    } else if (
      this.keys.left.isDown ||
      this.keys.right.isDown
    ) {
      this.anims.play("run", true);
    } else {
      this.anims.play("idle", true);
    }
  }
}