import { GameScene } from "../game.scene";
import { useStore } from "../../state/store";
import { arrayLast } from "../../state/utils";
import { CarBattle } from "../cars/car-battle.model";

export interface PublicCar {
  id: string;
  pace: number;
  targetPace: number;
  mistakes: number;
  crashed: boolean;
  lastLap?: number;
  fastestLap?: number;
  battle?: number;
}

const store = useStore("PublicGameState", {
  cars: [] as PublicCar[],
  playerCar: undefined as PublicCar | undefined,
});

export const usePublicApi = () => {
  const updateFromGame = (game: GameScene) => {
    const publicCars = getPublicCarsFromGame(game);
    store.patch({
      cars: publicCars,
      playerCar: publicCars.find(c => c.id === game.playerCar.id),
    });
  };

  const getPublicCarsFromGame = (game: GameScene): PublicCar[] => {
    return game.cars.map((c) => ({
      id: c.id,
      pace: c.pace,
      mistakes: c.mistakes,
      crashed: c.crashed,
      lastLap: arrayLast(c.laps)?.time,
      fastestLap: [ ...c.laps ].sort((l1, l2) => l1.time > l2.time ? 1 : -1)[0]?.time,
      targetPace: c.targetPace,
      battle: c.battle?.progress,
    }));
  }

  return {
    ...store,
    updateFromGame,
  };
};
