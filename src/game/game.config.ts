import Phaser from 'phaser';

export const config = {
  type: Phaser.AUTO,
  parent: 'game',
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 },
        debug: false
    }
  },
  scale: {
    width: 920,
    height: 720,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
