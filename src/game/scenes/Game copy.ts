import { Scene } from "phaser";

import { SPRITES } from "../../utils/constaints";
import { Player } from "../../entities/player";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;

  private player!: Player;

  private menuContainer!: Phaser.GameObjects.Container;

  constructor() {
    super("Game");
  }

  create() {
    // Игровой фон
    // this.background = this.add.image(400, 300, "sky");

    // Игровой мир
    const platforms = this.physics.add.staticGroup();

    platforms.create(960, 720, SPRITES.GROUND).setScale(5).refreshBody();

    // Создаём меню
    this.createMenu(platforms);
  }

  private createMenu(platforms: Phaser.Physics.Arcade.StaticGroup) {
    // Затемнение
    const overlay = this.add.rectangle(
      0,
      0,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.65,
    );

    overlay.setOrigin(0);

    // Кнопка Play
    const playText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 300,
      "Click to play",
      {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ffffff",
      },
    );

    playText.setOrigin(0.5);

    this.tweens.add({
      targets: playText,
      duration: 1500,
      alpha: 0.4,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // Курсор
    overlay.setInteractive({ useHandCursor: true });

    // Запуск игры
    overlay.on("pointerdown", () => {
      this.startGame(platforms);

      // Убираем меню      
      this.tweens.add({
        targets: this.menuContainer,
        duration: 1000,
        alpha: 0,
        ease: "Sine.easeInOut",
        repeat: 0,
        onComplete: function () {
          // this.menuContainer.destroy();
        },
      });
    });

    this.menuContainer = this.add.container(0, 0, [overlay, playText]);

    // Чтобы меню было поверх игрового мира
    this.menuContainer.setDepth(100);
  }

  private startGame(platforms: Phaser.Physics.Arcade.StaticGroup) {
    // Создаём игрока
    this.player = new Player(this, 47, 20, SPRITES.PLAYER);

    this.player.setCollideWorldBounds(true);

    // Коллизия
    this.physics.add.collider(this.player, platforms);

    // Камера
    this.cameras.main.startFollow(this.player);

    this.cameras.main.setZoom(1.7);

    this.cameras.main.setBounds(0, 0, 1920, 1080);
  }

  update() {
    // Игрок существует только после Play
    if (this.player) {
      this.player.update();
    }
  }
}
