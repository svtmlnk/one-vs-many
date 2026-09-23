import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.add.image(512, 384, "background");
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);
    this.load.on("progress", (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets");

    this.load.image("logo", "logo.png");
    this.load.image("ground", "ground.png");

    // for new player sprite
    // this.load.spritesheet("player", "assets/player/Idle.png", {
    //   frameWidth: 200,
    //   frameHeight: 200,
    // });

    // for old player sprite
    const frames = {
      frameWidth: 200,
      frameHeight: 200,
    };

    const playerData = [
      { key: "player", file: "Idle" },
      { key: "player_run", file: "Run" },
      { key: "player_jump", file: "Jump" },
      { key: "player_fall", file: "Fall" },
      { key: "player_a1", file: "Attack1" },
      { key: "player_a2", file: "Attack2" },
      { key: "player_death", file: "Death" },
    ];

    playerData.forEach((item) => {
      this.load.spritesheet(item.key, `player/${item.file}.png`, frames);
    });

    // for enemy sprite
    this.load.spritesheet("enemy", "enemy/NightBorne.png", {
      frameWidth: 80,
      frameHeight: 80,
    });
  }

  create() {
    this.scene.start("Game");
  }
}
