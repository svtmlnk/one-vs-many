import { Scene } from "phaser";
import { SPRITES } from "../../utils/constaints";
import { Player } from "../../entities/player";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  private player: Player;

  constructor() {
    super("Game");
  }

  create() {
    this.add.image(400, 300, "sky");

    const platforms = this.physics.add.staticGroup();

    platforms.create(960, 720, SPRITES.GROUND).setScale(5).refreshBody();

    // adding player in this world: scene, position x y, texture name, side and callback function
    this.player = new Player(this, 47, 20, SPRITES.PLAYER);

    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, platforms);

    // adding camera for player
    this.cameras.main.startFollow(this.player);
    // camera zoom
    this.cameras.main.setZoom(1.7);
    // adding bounds for this camera
    this.cameras.main.setBounds(0, 0, 1920, 720);
  }

  update(): void {
    this.player.update();
  }
}
