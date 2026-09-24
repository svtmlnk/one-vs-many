// import { Scene } from 'phaser';

// export class Game extends Scene
// {
//     camera: Phaser.Cameras.Scene2D.Camera;
//     background: Phaser.GameObjects.Image;
//     msg_text : Phaser.GameObjects.Text;

//     constructor ()
//     {
//         super('Game');
//     }

//     create ()
//     {
//         this.camera = this.cameras.main;
//         // this.camera.setBackgroundColor(0x00ff00);

//         this.background = this.add.image(512, 384, 'background');
//         this.background.setAlpha(0.5);
//         this.background.setScale(5)

//         this.msg_text = this.add.text(950, 530, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
//             fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
//             stroke: '#000000', strokeThickness: 8,
//             align: 'center'
//         });
//         this.msg_text.setOrigin(0.5);
//     }
// }


import { Scene } from "phaser";
import { SPRITES } from "../../utils/containts";
import { Player } from "../../entities/player";
import { Enemy } from "../../entities/enemy";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  // entities
  player: Player;
  enemy: Enemy;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;

    const ground = this.physics.add.staticImage(950, 840, "ground");
    ground.setScale(8, 15).refreshBody();

    // creating player
    this.player = new Player(this, 1000, 500, SPRITES.PLAYER);
    // ответ на вопрос почему игрок не выходит за границы
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    // creating enemy
    this.enemy = new Enemy(this, 1200, 500, SPRITES.ENEMY);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setPlayer(this.player);
    this.physics.add.collider(this.enemy, ground);

    // getting all enemies for player interaction
    this.player.setEnemies([this.enemy]);

    // отсюда начинаются вопросы по поводу границы поверхности
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
  }

  update() {
    this.player.update();
    this.enemy.update();
  }
}
