import { Scene } from "phaser";

import { SPRITES } from "../../utils/constaints";
import { Player } from "../../entities/player";
import { Enemy } from "../../entities/enemy";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

  private player!: Player;
  private enemy!: Enemy;

  constructor() {
    super("Game");
  }

  create() {
    // Игровой фон
    // this.background = this.add.image(400, 300, "sky");

    // Игровой мир
    const platforms = this.physics.add.staticGroup();

    platforms.create(960, 720, SPRITES.GROUND).setScale(5).refreshBody();

    // Создаём игрока
    this.player = new Player(this, 1000, 500, SPRITES.PLAYER);
    this.player.setCollideWorldBounds(true);
    
    // Создаём противника
    this.enemy = new Enemy(this, 1200, 500, SPRITES.ENEMY);
    this.enemy.setCollideWorldBounds(true);

    // Коллизия
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemy, platforms);
    this.physics.world.setBounds(0, 0, 1920, 1080)

    // Камера
    this.cameras.main.startFollow(this.player);

    this.cameras.main.setZoom(2);
  }

  update() {
    // Игрок существует только после Play
    if (this.player) {
      this.player.update();
    }
  }
}
