import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    this.load.on("progress", (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.spritesheet("player", "assets/player/Idle.png", {
      frameWidth: 200,
      frameHeight: 200,
    });
    this.load.spritesheet("player_run", "assets/player/Run.png", {
      frameWidth: 200,
      frameHeight: 200,
    });
    this.load.spritesheet("player_jump", "assets/player/Jump.png", {
      frameWidth: 200,
      frameHeight: 200,
    });
    this.load.spritesheet("player_fall", "assets/player/Fall.png", {
      frameWidth: 200,
      frameHeight: 200,
    });
    this.load.spritesheet("player_a1", "assets/player/Attack1.png", {
      frameWidth: 200,
      frameHeight: 200,
    });
    this.load.spritesheet("player_a2", "assets/player/Attack2.png", {
      frameWidth: 200,
      frameHeight: 200,
    });
  }

  create() {
    this.scene.start("Game");
  }
}
