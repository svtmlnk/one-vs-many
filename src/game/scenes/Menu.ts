import { GameObjects, Scene } from "phaser";

export class Menu extends Scene {
  info: GameObjects.Text;

  constructor() {
    super("Menu");
  }

  init() {
    this.info = this.add
      .text(
        1000,
        500,
        "Please, touch the screen to enable Full Screen mode and rotate your device to Landscape mode.",
        {
          fontSize: 23,
          color: "#bfbfbf",
          stroke: "#000000",
          align: "center",
        },
      )
      .setOrigin(0.5);
  }

  preload() {}

  create() {
    this.input.on("pointerdown", () => {
      if (!this.scale.isFullscreen) {
        this.scale.startFullscreen();
        this.scene.start("Game");
      }
    });
  }
}
