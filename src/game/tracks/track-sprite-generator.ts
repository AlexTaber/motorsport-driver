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
    // const graphics = scene.make.graphics({x: track.x, y: track.y, add: false});
    // graphics.lineStyle(distanceService.meter * 2, 0xff00ff, 1);
    // graphics.beginPath();
    // graphics.lineBetween(0, 0, 180, 0);
    // graphics.closePath();
    // graphics.strokePath();
    // graphics.generateTexture("Track", 200, 200);
    // const sprite = scene.add.image(track.x, track.y, "Track");
    // sprite.setOrigin(0.1, 0.1);
    // return sprite;

    const graphics = scene.make.graphics({x: track.x, y: track.y, add: false});
    graphics.lineStyle(distanceService.meter * 2, 0xff00ff, 1);
    graphics.beginPath();

    track.segments.forEach(s => drawSegment(graphics, s));
    
    graphics.generateTexture("Track", textureW, textureH);
    const sprite = scene.add.sprite(0, track.y, "Track");
    sprite.setDisplayOrigin(textureX, textureY);
    return sprite;
  }

  function drawSegment(graphics: Phaser.GameObjects.Graphics, segment: TrackSegment) {
    graphics.beginPath();

    if (segment.isCorner) {
      drawCorner(graphics, segment);
    } else {
      const startX = segment.position.x + textureX - track.x;
			const startY = segment.position.y + textureY - track.y;
			const endX = segment.endPosition.x + textureX - track.x;
			const endY = segment.endPosition.y + textureY - track.y;
			graphics.lineBetween(startX, startY, endX, endY);
    }

    graphics.strokePath();
  }

  function drawCorner(graphics: Phaser.GameObjects.Graphics, segment: TrackSegment) {
		const x = segment.drawPosition.x + textureX - track.x;
		const y = segment.drawPosition.y + textureY - track.y;
    graphics.arc(
      x,
      y,
      segment.params.radius!,
      Phaser.Math.DegToRad(segment.direction - 270),
      Phaser.Math.DegToRad(segment.direction - 270 - segment.params.arc!),
      segment.params.arc! > 0
    );
	}

  return {
    generate,
  };
}
