import { GameScene } from "../game.scene";
import { useDistance } from "../services/distance.service";
import { TrackSegment } from "../track-segments/track-segment.model";
import type { Track } from "./track.model";

export function useTrackSpriteGenerator(track: Track, scene: GameScene) {
  const distanceService = useDistance();

  const textureW = 2048;
  const textureH = 2048;
  const textureX = textureW * 0.5;
  const textureY = textureH - (distanceService.meter * 5);

  const generate = () => {
    const graphics = scene.make.graphics({x: track.x, y: track.y, add: false});
    graphics.lineStyle(distanceService.meter * 2, 0xff00ff, 1);
    graphics.beginPath();

    // track.segments.forEach(s => drawSegment(graphics, s));
    graphics.arc(textureX, textureY, 100, 0, 180);
    
    graphics.closePath();
    graphics.strokePath();
    graphics.generateTexture("Track", textureW, textureH);
    const sprite = scene.add.sprite(track.x, track.y, "Track");
    sprite.setDisplayOrigin(textureX, textureY);
    return sprite;
  }

  function drawSegment(graphics: Phaser.GameObjects.Graphics, segment: TrackSegment) {
    if (segment.isCorner) {
      // graphics.lineTo(segment.endPosition.x, segment.endPosition.y);
      // graphics.moveTo(segment.endPosition.x, segment.endPosition.y);
    } else {
      const startX = segment.position.x + textureX - track.x;
			const startY = segment.position.y + textureY - track.y;
			const endX = segment.endPosition.x + textureX - track.x;
			const endY = segment.endPosition.y + textureY - track.y;
			graphics.lineBetween(startX, startY, endX, endY);
    }
  }

  return {
    generate,
  };
}
