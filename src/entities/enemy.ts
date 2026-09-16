import { GameObjects, Math, Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/constaints";

export class Enemy extends Entity {
  textureKey: string;
  moveSpeed: number;
  interactionZone: GameObjects.Zone;
  enemyHealth: 100;
  private player: Entity;
  private isFollowing: boolean;
  private agroDistance: number;
  private attackRange: number;
  private followRange: number;
  private isAlive: boolean;
  private initialPosition: { x: number; y: number };

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    type?: string,
  ) {
    super(scene, x, y, texture, type);

    this.textureKey = texture;
    this.moveSpeed = 200;
    this.setSize(40, 45);
    this.setScale(1.5);

    this.isFollowing = false;
    this.agroDistance = 100;
    this.isAlive = true;
    this.initialPosition = { x, y };

    // радиус атаки
    this.attackRange = 40;
    // максимальное растояние, на которое противник может бежать
    this.followRange = 250;

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

    // this.cycleTween();
  }

  // cycleTween() {
  //   this.scene.tweens.add({
  //     targets: this,
  //     frames: this.scene.anims.generateFrameNumbers(SPRITES.ENEMY, {
  //       start: 0,
  //       end: 5,
  //     }),
  //     repeat: -1,
  //     yoyo: true,
  //     x: this.x + 100,
  //     onRepeat: () => {
  //       this.setFlipX(false);
  //     },
  //     onYoyo: () => {
  //       this.setFlipX(true);
  //     },
  //   });
  // }

  // stopCycleTween() {
  //   this.scene.tweens.killTweensOf(this);
  // }

  setPlayer(player: Entity) {
    this.player = player;
  }

  followToPlayer(player: Entity) {
    this.scene.physics.moveToObject(this, player, this.moveSpeed);
  }

  // returnToOriginalPosition(distanceToPosition: number) {
  //   this.setVelocity(0, 0);

  //   this.scene.tweens.add({
  //     targets: this,
  //     x: this.initialPosition.x,
  //     y: this.initialPosition.y,
  //     duration: (distanceToPosition * 1000) / this.moveSpeed,
  //     onComplete: () => {
  //       this.cycleTween();
  //     },
  //   });
  // }

  // функционал атаки противника
  attack(target: Entity) {
    const time = Math.FloorTo(this.scene.game.loop.time);

    if (time % 2000 <= 3) {
      target.takeDamage(10);
    }
  }

  // получение урона
  takeDamage(damage: number) {
    super.takeDamage(damage);

    if (this.health <= 0) {
      this.deactivate();
    }
  }

  // удаление противника со сцены
  deactivate() {
    // this.stopCycleTween();
    this.setPosition(this.initialPosition.x, this.initialPosition.y);
    this.setVisible(false);
    this.isAlive = false;
    this.destroy();
  }

  // update() {
  //   // 1 расчёт дистанции до персонажа
  //   const player = this.player;
  //   const distanceToPlayer = Math.Distance.Between(
  //     this.x,
  //     this.y,
  //     player.x,
  //     player.y,
  //   );
  //   const distanceToPosition = Math.Distance.Between(
  //     this.x,
  //     this.y,
  //     this.initialPosition.x,
  //     this.initialPosition.y,
  //   );
  //   // 2 остановка цикла, включение режима следования
  //   if (!this.isFollowing && distanceToPlayer < this.agroDistance) {
  //     this.isFollowing = true;
  //     this.stopCycleTween();
  //   }
  //   // 3 режим следования
  //   if (this.isFollowing && this.isAlive) {
  //     this.followToPlayer(player);

  //     // 3.1 начало файтинга
  //     if (distanceToPlayer < this.attackRange) {
  //       this.setVelocity(0, 0);
  //       this.attack(player);
  //     }
  //     // 3.2 возврат на исходную, если расстояние больше followRange
  //     if (distanceToPosition > this.followRange) {
  //       this.isFollowing = false;
  //       this.returnToOriginalPosition(distanceToPosition);
  //     }
  //   }
  // }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (!this.player || !this.isAlive) return;

    const distanceToPlayer = Math.Distance.Between(
      this.x,
      this.y,
      this.player.x,
      this.player.y,
    );

    // Если игрок далеко — бежим к нему
    if (distanceToPlayer > this.attackRange && body.touching.down) {
      this.followToPlayer(this.player);

      // Поворот спрайта
      if (this.player.x < this.x) {
        this.setFlipX(true);
      } else {
        this.setFlipX(false);
      }
    }
    // Если игрок рядом — атакуем
    else {
      this.setVelocity(0, 0);
      this.attack(this.player);
    }
  }
}
