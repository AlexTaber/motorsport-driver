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

    track.segments.forEach(s => drawSegment(graphics, s));

    graphics.generateTexture("Track", textureW, textureH);
    const sprite = scene.add.sprite(track.x, track.y, "Track");
    sprite.setDisplayOrigin(textureX, textureY);
    return sprite;
  }

  function drawSegment(graphics: Phaser.GameObjects.Graphics, segment: TrackSegment) {
    graphics.beginPath();

    if (segment.params.finish) {
      const startX = segment.position.x + textureX - track.x;
			const startY = segment.position.y + textureY - track.y;
			const endX = textureX;
			const endY = textureY;
			graphics.lineBetween(startX, startY, endX, endY);
    } else if (segment.isCorner) {
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
		segment.params.arc! > 0 ? drawCounterClockwiseCorner(graphics, segment) : drawClockwiseCorner(graphics, segment);
	}

  function drawCounterClockwiseCorner(graphics: Phaser.GameObjects.Graphics, segment: TrackSegment) {
    const {x, y} = getCornerDrawPosition(segment);
    const startAngle = 360 - segment.direction + 90;
    graphics.arc(
      x,
      y,
      segment.params.radius!,
      Phaser.Math.DegToRad(startAngle),
      Phaser.Math.DegToRad(startAngle - segment.params.arc!),
      segment.params.arc! > 0
    );
  }

  function drawClockwiseCorner(graphics: Phaser.GameObjects.Graphics, segment: TrackSegment) {
    const {x, y} = getCornerDrawPosition(segment);
    const startAngle = 360 - segment.direction - 90;
    graphics.arc(
      x,
      y,
      segment.params.radius!,
      Phaser.Math.DegToRad(startAngle),
      Phaser.Math.DegToRad(startAngle - segment.params.arc!),
      segment.params.arc! > 0
    );
  }

  function getCornerDrawPosition(segment: TrackSegment) {
    return {
      x: segment.drawPosition.x + textureX - track.x,
      y: segment.drawPosition.y + textureY - track.y,
    };
  }

  return {
    generate,
  };
}
