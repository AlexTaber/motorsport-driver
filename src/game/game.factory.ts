import { config } from "./game.config";
import { GameScene } from "./game.scene";
import { InputNodesScene } from "./input-nodes/input-nodes.scene";

let game: Phaser.Game | undefined = undefined;

export const useGameFactory = () => {
  const createGame = () => {
    game = new Phaser.Game(
      Object.assign(config, {
        scene: [GameScene, InputNodesScene]
      })
    );

    return game;
  }

  const getScene = () => game?.scene.getScene("GameScene") as GameScene;

  return {
    game: game as Phaser.Game,
    getScene,
    createGame,
  };
}
