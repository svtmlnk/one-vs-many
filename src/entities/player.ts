import { GameObjects, Math, Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/constaints";
import { Enemy } from "./enemy";

export class Player extends Entity {
  textureKey: string;
  moveSpeed: number;
  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  interactionZone: GameObjects.Zone;
  private isAttacking = false;
  private currentSide: "right" | "left";
  private canDash = true;
  private firstAttack = true;
  playerHealthBar: Phaser.GameObjects.Graphics;
  enemyHealthBar: Phaser.GameObjects.Graphics;
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
    this.moveSpeed = 500;
    this.setSize(40, 45);
    this.currentSide = "right";

    // adding health bar for player (it showing like interface in current scene)
    this.drawPlayerHealthBar();

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
    this.scene.input.keyboard!.on("keydown-Z", () => {
      const body = this.body as Phaser.Physics.Arcade.Body;
      // const direction = this.currentSide === "left" ? -1 : 1;

      if (body.touching.down && !this.isAttacking) {
        this.isAttacking = true;

        // getting out target for attacking
        const target = this.findTarget(this.enemies);
        if (target) {
          console.log(target);
          this.attack(target);
          this.drawEnemyHealthBar(target);
        }

        if (this.firstAttack) {
          this.anims.play("attack1");
          this.firstAttack = false;
        } else {
          this.anims.play("attack2");
          this.firstAttack = true;
        }
      }

      // this.scene.tweens.add({
      //   targets: this,
      //   x: this.x + 20 * direction,
      //   duration: 400,
      //   ease: "Power2",
      // });

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
        console.log("no");

        setTimeout(() => {
          this.canDash = true;
          console.log("yes");
        }, 1500);
      }
    });
  }

  // creating player's health bar
  private drawPlayerHealthBar() {
    this.playerHealthBar = this.scene.add.graphics();
    this.playerHealthBar.setScrollFactor(0);
    this.drawHealthBar(this.playerHealthBar, 500, 290, this.health / 100);
  }

  private drawEnemyHealthBar(target: Entity){
    this.enemyHealthBar = this.scene.add.graphics();
    this.enemyHealthBar.setScrollFactor(0);
    this.drawHealthBar(this.enemyHealthBar, 500, 320, target.health / 100);
  }

  // drawing health bar
  private drawHealthBar(
    graphics: any,
    x: number,
    y: number,
    percentage: number,
  ) {
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(x, y, 100, 10);

    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(x, y, 100 * percentage, 10);
  }

  // getting enemies from current scene
  setEnemies(enemies: Entity[]) {
    this.enemies = enemies;
  }

  // находим ближайшего противника
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
      target.takeDamage(25);
    }
  }

  // // получение урона
  // takeDamage(damage: number) {
  //   super.takeDamage(damage);

  //   if (this.health <= 0) {
  //     this.deactivate();
  //   }
  // }

  // // удаление противника со сцены
  // deactivate() {
  //   alert('you are dead :P')
  // }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    this.drawPlayerHealthBar();

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
