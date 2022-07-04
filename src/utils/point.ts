export function getPoint(position: { x: number, y: number}, angle: number, distance: number) {
  return {
    x: position.x + Math.cos(Phaser.Math.DegToRad(angle)) * distance,
    y: position.y - Math.sin(Phaser.Math.DegToRad(angle)) * distance,
  }
}
