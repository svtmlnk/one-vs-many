import { GameObjects, Math, Scene } from "phaser";

import { Entity } from "./entity";
import { SPRITES } from "../utils/containts";

export class Enemy extends Entity {
  textureKey: string;
  moveSpeed: number;

  private healthText: GameObjects.Text;

  private player?: Entity;

  // ==========================================
  // ENEMY ACTIONS
  // ==========================================

  private attackRange = 50;

  private isAlive = true;

  public onDeath?: (enemy: Enemy) => void;

  // ==========================================
  // ATTACK
  // ==========================================

  // Через сколько после входа
  // игрока в зону начинается атака
  private readonly attackDelay = 2000;

  // Интервал между атаками
  private readonly attackCooldown = 1000;

  // Время последней атаки
  private lastAttackTime = 0;

  // Начало нахождения игрока
  // внутри attackRange
  private attackStartTime = 0;

  private targetInAttackRange = false;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    type?: string,
  ) {
    super(scene, x, y, texture, type);

    this.textureKey = texture;

    this.moveSpeed = 300;

    this.setSize(40, 45);
    this.setScale(1.5);

    // ==========================================
    // ANIMATION
    // ==========================================

    if (!scene.anims.exists("enemy_idle")) {
      scene.anims.create({
        key: "enemy_idle",
        frames: scene.anims.generateFrameNumbers(SPRITES.ENEMY, {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    this.anims.play("enemy_idle", true);

    // ==========================================
    // HEALTH TEXT
    // ==========================================

    this.healthText = scene.add.text(this.x, this.y - 50, `${this.health}`, {
      fontSize: "12px",
      color: "#ffffff",
    });

    this.healthText.setOrigin(0.5);
  }

  // ==========================================
  // SET PLAYER
  // ==========================================

  setPlayer(player: Entity) {
    this.player = player;
  }

  // ==========================================
  // FOLLOW PLAYER
  // ==========================================

  followToPlayer(player: Entity) {
    if (!this.isAlive) {
      return;
    }

    this.scene.physics.moveToObject(this, player, this.moveSpeed);
  }

  // ==========================================
  // ATTACK
  // ==========================================

  attack(target: Entity) {
    // Игрок уже умер
    if (target.health <= 0) {
      return;
    }

    const distanceToPlayer = Math.Distance.Between(
      this.x,
      this.y,
      target.x,
      target.y,
    );

    // Дополнительная проверка:
    // атакуем только внутри хитбокса
    if (distanceToPlayer <= this.attackRange) {
      target.takeDamage(5);

      console.log("Enemy attacked player");
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

    if (this.healthText) {
      this.healthText.setText(`${this.health}`);
    }

    if (this.health <= 0) {
      this.deactivate();
    }
  }

  // ==========================================
  // DEATH
  // ==========================================

  deactivate() {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;

    // Останавливаем движение
    this.setVelocity(0, 0);

    // Отключаем физику
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.enable = false;

    // Удаляем HP
    if (this.healthText) {
      this.healthText.destroy();
    }

    // Сообщаем Game.ts
    if (this.onDeath) {
      this.onDeath(this);
    }

    // Удаляем врага
    this.destroy();
  }

  // ==========================================
  // UPDATE
  // ==========================================

  update() {
    // ==========================================
    // NO PLAYER / DEAD ENEMY
    // ==========================================

    if (!this.player || !this.isAlive) {
      return;
    }

    // ==========================================
    // PLAYER IS DEAD
    // ==========================================

    // Если игрок умер,
    // враг больше вообще ничего не делает
    if (this.player.health <= 0) {
      this.setVelocity(0, 0);

      this.targetInAttackRange = false;
      this.attackStartTime = 0;

      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;

    // ==========================================
    // DISTANCE TO PLAYER
    // ==========================================

    const distanceToPlayer = Math.Distance.Between(
      this.x,
      this.y,
      this.player.x,
      this.player.y,
    );

    const currentTime = this.scene.time.now;

    // ==========================================
    // PLAYER IS OUTSIDE ATTACK RANGE
    // ==========================================

    if (distanceToPlayer > this.attackRange && body.touching.down) {
      // Сбрасываем состояние атаки
      this.targetInAttackRange = false;
      this.attackStartTime = 0;

      // Идём к игроку
      if (body.touching.down) {
        this.followToPlayer(this.player);

        if (this.player.x < this.x) {
          this.setFlipX(true);
        } else {
          this.setFlipX(false);
        }
      }

      // Обновляем HP
      if (this.healthText) {
        this.healthText.setPosition(this.x, this.y - 50);
      }

      return;
    }

    // ==========================================
    // PLAYER ENTERED ATTACK RANGE
    // ==========================================

    // Враг остановился
    this.setVelocity(0, 0);

    // Поворачиваемся к игроку
    if (this.player.x < this.x) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    // Первый кадр нахождения игрока
    // внутри attackRange
    if (!this.targetInAttackRange) {
      this.targetInAttackRange = true;

      this.attackStartTime = currentTime;

      // Важно:
      // первая атака произойдёт
      // только через attackDelay
      this.lastAttackTime = currentTime;

      console.log("Player entered enemy hitbox");
    }

    // ==========================================
    // WAIT BEFORE FIRST ATTACK
    // ==========================================

    const timeInsideAttackRange = currentTime - this.attackStartTime;

    if (timeInsideAttackRange < this.attackDelay) {
      if (this.healthText) {
        this.healthText.setPosition(this.x, this.y - 50);
      }

      return;
    }

    // ==========================================
    // ATTACK
    // ==========================================

    if (currentTime - this.lastAttackTime >= this.attackCooldown) {
      // Последняя проверка перед атакой
      if (this.player.health > 0 && distanceToPlayer <= this.attackRange) {
        this.attack(this.player);
      }

      this.lastAttackTime = currentTime;
    }

    // ==========================================
    // HEALTH TEXT
    // ==========================================

    if (this.healthText) {
      this.healthText.setPosition(this.x, this.y - 50);
    }
  }
}
