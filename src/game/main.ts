import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { AUTO, Game, Scale } from "phaser";
import { Preloader } from "./scenes/Preloader";

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1920,
  height: 1080,
  parent: "game-container",
  backgroundColor: "#000000",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      // Vector2Like
      gravity: { y: 800 },
    },
  },
  scene: [Boot, Preloader, MainGame],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
