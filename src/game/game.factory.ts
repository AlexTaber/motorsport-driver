import { config } from "./game.config";
import { GameScene } from "./game.scene";

let game: Phaser.Game | undefined = undefined;

export const useGameFactory = () => {
  const createGame = () => {
    game = new Phaser.Game(
      Object.assign(config, {
        scene: [GameScene]
      })
    );

    return game;
  }

  const getScene = () => game?.scene.getScene("GameScene") as Phaser.Scene;

  return {
    game: game as Phaser.Game,
    getScene,
    createGame,
  };
}
