import Phaser from "phaser";
import { PlayerService } from "./services/player.service";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class MainScene extends Phaser.Scene {

  green: any;
  blue: any;
  greenKeys: any;
  blueKeys: any;


  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: any;
  private platforms!: any;
  private stars!: any;

//player variables used for later
  private isKnockedDown: boolean = false; //is our player knocked down?
  private isAttacking: boolean = false; //is our player attacking?
  private lastDirection: string = "down";//what was the last direction our player was facing?
  private playerVelocity = new Phaser.Math.Vector2(); //track player velocity in a 2d vector
  constructor(private createAnimationPlayerService: PlayerService) {
    super({key: 'MainScene'});
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 100, stepX: 70 }
    });

    this.createPlayer(this);

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(600, 17, 'ground');
    this.platforms.create(200, 17, 'ground');
    this.platforms.create(150, 200, 'ground');
    this.platforms.create(750, 50, 'ground').setScale(2).refreshBody();

    this.player.setBounce(0.3);
    this.physics.add.collider(this.player, this.platforms, object1 => console.log("platforms"));
    this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);

  }

  preload() {
    this.load.image('star', 'assets/star.png');
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet("player", "assets/characters/player.png", {
      frameWidth: 48,
      frameHeight: 48
    });
  }

  override update() {
    //================================
    //  first priority, set default:
    //================================
    //if No input set to standing still
    if (this.keys.up.isUp && this.keys.down.isUp && this.keys.left.isUp && this.keys.right.isUp && this.keys.space.isUp && !this.isKnockedDown) {
      this.player.anims.play('stand_' + this.lastDirection, true);
    }

    //================================
    //  Next set important variables
    //================================
    //set attacking flag if currently attacking
    this.isAttacking = this.keys.space.isDown;
    //set isKnockedDown to false if we are no longer in the knocked down animation
    if (this.player.anims.currentAnim.key == 'stand_' + this.lastDirection) {
      this.isKnockedDown = false;
    }

    //================================
    //  Game Logic
    //================================
    //we can't do anything if we are currently knocked down/incapacitated
    if (!this.isKnockedDown) {
      //set the isKnockedDown flag if conditions are met and run the appropriate animation
      // if (this.keys.s1.isDown) {
      //   this.player.setVelocity(0, this.playerVelocity.y);
      //   this.isKnockedDown = true;
      //   this.player.anims.play('dead');
      //   this.player.anims.stopAfterRepeat(0);
      //   this.player.anims.chain('laying');
      //   this.player.anims.chain('stand_' + this.lastDirection);
      //   return; //skip the rest of the update
      // }
    }

    if (this.isAttacking) {
      this.playerVelocity.x = 0;
      this.playerVelocity.y = 0;
      this.player.anims.play('attack_' + this.lastDirection, true);
    } else { //not attacking, check movement
      if (this.keys.up.isDown) {  // Move up

        this.playerVelocity.y = -1;
        // this.player.setVelocityY(-160);
        if (this.playerVelocity.x == 0) {
          this.player.anims.play('up', true);
        }
        this.lastDirection = "up";
      } else if (this.keys.down.isDown) {   // Move down
        this.playerVelocity.y = 1;
        if (this.playerVelocity.x == 0) {
          this.player.anims.play('down', true);
        }
        this.lastDirection = "down";
      } else {
        // Stop vertical movement
        this.playerVelocity.y = 0;
      }

      if (this.keys.left.isDown) { // Move left
        this.player.setFlipX(true);
        this.playerVelocity.x = -1;
        this.player.anims.play('move_x', true); //only do the x animation if we are not moving diag
        this.lastDirection = "left";
      } else if (this.keys.right.isDown) {  // Move right
        this.playerVelocity.x = 1;
        this.player.anims.play('move_x', true);
        this.player.setFlipX(false);
        this.lastDirection = "right";
      } else {
        // Stop horizontal movement
        this.playerVelocity.x = 0;
      }

    }
    this.playerVelocity.normalize();
    this.playerVelocity.scale(1.2);
    this.player.setVelocityX(this.playerVelocity.x * 100);
    this.player.setVelocityY(this.playerVelocity.y * 100);
  }

  createPlayer(that: any) {
    this.load.scenePlugin({
      key: 'ArcadePhysics',
      sceneKey: 'physics',
      url: Phaser.Physics.Arcade.ArcadePhysics
    });
    this.player = that.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(1, 1);
    this.player.setScale(1.3, 1.3);
    this.keys = this.input.keyboard.createCursorKeys();

    that.anims.create({
      key: 'attack_down',
      frames: that.anims.generateFrameNumbers('player', {start: 36, end: 39}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'attack_right',
      frames: that.anims.generateFrameNumbers('player', {start: 42, end: 45}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'attack_left',
      frames: that.anims.generateFrameNumbers('player', {start: 42, end: 45}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'attack_up',
      frames: that.anims.generateFrameNumbers('player', {start: 48, end: 51}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'move_x',
      frames: that.anims.generateFrameNumbers('player', {start: 24, end: 29}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'up',
      frames: that.anims.generateFrameNumbers('player', {start: 30, end: 35}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'down',
      frames: that.anims.generateFrameNumbers('player', {start: 18, end: 23}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'stand_down',
      frames: that.anims.generateFrameNumbers('player', {start: 0, end: 5}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'stand_up',
      frames: that.anims.generateFrameNumbers('player', {start: 12, end: 17}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'stand_left',
      frames: that.anims.generateFrameNumbers('player', {start: 6, end: 11}),
      frameRate: 10,
      repeat: -1
    });
    that.anims.create({
      key: 'stand_right',
      frames: that.anims.generateFrameNumbers('player', {start: 6, end: 11}),
      frameRate: 10,
      repeat: -1
    });

    that.anims.create({
      key: 'dead',
      frames: that.anims.generateFrameNumbers('player', {start: 54, end: 56}),
      frameRate: 4,
      repeat: -1,
    });
    that.anims.create({
      key: 'laying',
      frames: that.anims.generateFrameNumbers('player', {start: 56, end: 56}),
      frameRate: 10,
      repeat: 10,
    });
  }

  collectStar (player: any, star: any)
  {
    star.disableBody(true, true);
  }

}
