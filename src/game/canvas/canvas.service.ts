import { config } from "../game.config";

export const useCanvas = () => {
  const getCenter = () => ({ x: config.scale.width / 2, y: config.scale.height / 2 });

  const getPercentageHeight = (percentage: number) => config.scale.height * (percentage / 100);

  const getPercentageWidth = (percentage: number) => config.scale.width * (percentage / 100);

  const size = { width: config.scale.width, height: config.scale.height };

  return {
    size,
    getCenter,
    getPercentageHeight,
    getPercentageWidth,
  };
}
