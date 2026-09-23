import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
  info: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.info = this.add
      .text(
        950,
        530,
        "Please, touch the screen to enable Full Screen mode\nand rotate your device to Landscape mode.",
        {
          fontSize: 42,
          color: "#bfbfbf",
          stroke: "#000000",
          align: "center",
        },
      )
      .setOrigin(0.5);

    this.input.on("pointerdown", () => {
      if (!this.scale.isFullscreen) {
        this.scale.startFullscreen();
        this.scene.start("Game");
    }
    else{
        this.scene.start("Game");
      }
    });
  }
}
