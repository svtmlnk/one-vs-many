import { Math, Scene } from "phaser";

import { SPRITES } from "../../utils/containts";

import { Player } from "../../entities/player";
import { Enemy } from "../../entities/enemy";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  // entities
  player: Player;

  // Группа врагов
  enemies: Phaser.Physics.Arcade.Group;

  // Границы ground
  private groundBounds!: Phaser.Geom.Rectangle;

  // Всего врагов
  private readonly totalEnemies = 10;

  // Одновременно на сцене
  private readonly maxEnemiesOnScene = 3;

  // Сколько врагов уже создано
  private spawnedEnemies = 0;

  // Сколько врагов убито
  private killedEnemies = 0;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;

    // ==========================================
    // GROUND
    // ==========================================

    const ground = this.physics.add.staticImage(
      950,
      840,
      "ground"
    );

    ground
      .setScale(8, 15)
      .refreshBody();

    // Сохраняем границы ground
    this.groundBounds = ground.getBounds();

    // ==========================================
    // PLAYER
    // ==========================================

    this.player = new Player(
      this,
      1000,
      500,
      SPRITES.PLAYER
    );

    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(
      this.player,
      ground
    );

    // ==========================================
    // ENEMY GROUP
    // ==========================================

    this.enemies = this.physics.add.group();

    // Враги сталкиваются друг с другом
    this.physics.add.collider(
      this.enemies,
      this.enemies
    );

    // Враги сталкиваются с ground
    this.physics.add.collider(
      this.enemies,
      ground
    );

    // ==========================================
    // SPAWN FIRST 3 ENEMIES
    // ==========================================

    for (
      let i = 0;
      i < this.maxEnemiesOnScene;
      i++
    ) {
      this.spawnEnemy();
    }

    // ==========================================
    // CAMERA
    // ==========================================

    this.cameras.main.startFollow(
      this.player
    );

    this.cameras.main.setZoom(2);
  }

  update() {
    // Игрок
    this.player.update();

    // Враги
    for (const child of this.enemies.children) {
      const enemy = child as Enemy;

      if (!enemy.active) {
        continue;
      }

      enemy.update();
    }
  }

  // ==========================================
  // SPAWN ENEMY
  // ==========================================

  private spawnEnemy() {
    // Все 10 уже созданы
    if (
      this.spawnedEnemies >=
      this.totalEnemies
    ) {
      return;
    }

    const position =
      this.getEnemySpawnPosition();

    const enemy = new Enemy(
      this,
      position.x,
      position.y,
      SPRITES.ENEMY
    );

    enemy.setCollideWorldBounds(true);

    enemy.setPlayer(this.player);

    // Добавляем врага в группу
    this.enemies.add(enemy);

    this.spawnedEnemies++;

    // Событие смерти
    enemy.onDeath = (
      deadEnemy: Enemy
    ) => {
      this.handleEnemyDeath(deadEnemy);
    };

    // Обновляем врагов игрока
    this.updatePlayerEnemies();
  }

  // ==========================================
  // ENEMY DEATH
  // ==========================================

  private handleEnemyDeath(
    deadEnemy: Enemy
  ) {
    this.killedEnemies++;

    console.log(
      `Killed: ${this.killedEnemies}/${this.totalEnemies}`
    );

    // Удаляем врага из группы
    this.enemies.remove(
      deadEnemy,
      true,
      true
    );

    // Обновляем список врагов игрока
    this.updatePlayerEnemies();

    // Все убиты
    if (
      this.killedEnemies >=
      this.totalEnemies
    ) {
      console.log("win!");
      return;
    }

    // Создаём следующего
    if (
      this.spawnedEnemies <
      this.totalEnemies
    ) {
      this.spawnEnemy();
    }
  }

  // ==========================================
  // UPDATE PLAYER ENEMIES
  // ==========================================

  private updatePlayerEnemies() {
    const enemies: Enemy[] = [];

    for (const child of this.enemies.children) {
      const enemy = child as Enemy;

      if (!enemy.active) {
        continue;
      }

      enemies.push(enemy);
    }

    this.player.setEnemies(enemies);
  }

  // ==========================================
  // SPAWN POSITION
  // ==========================================

  private getEnemySpawnPosition(): {
    x: number;
    y: number;
  } {
    const bounds = this.groundBounds;

    const enemyWidth = 40;
    const enemyHeight = 45;

    // Выбираем левый или правый край
    const spawnFromLeft =
      Math.Between(0, 1) === 0;

    let x: number;

    if (spawnFromLeft) {
      x =
        bounds.left +
        enemyWidth;
    } else {
      x =
        bounds.right -
        enemyWidth;
    }

    const y =
      bounds.top -
      enemyHeight / 2 -
      10;

    return {
      x,
      y,
    };
  }
}