import { GameObjects, Math, Scene } from "phaser";
import { Entity } from "./entity";
import { SPRITES } from "../utils/containts";

export class Enemy extends Entity {
  textureKey: string;
  moveSpeed: number;
  private healthText: GameObjects.Text;

  private player: Entity;

  // enemy actions
  private attackRange: number;
  private isAlive: boolean;
  public onDeath?: (enemy: Enemy) => void;

  // enemy attack actions
  private attackCooldown = 1000;
  private lastAttackTime = 0;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    type?: string,
  ) {
    super(scene, x, y, texture, type);

    this.textureKey = texture;

    this.moveSpeed = 300;

    this.setSize(40, 45);
    this.setScale(1.5);

    // это как-то влияет на медленное падение врага
    this.isAlive = true;
    this.attackRange = 40;

    if (!scene.anims.exists("enemy_idle")) {
      scene.anims.create({
        key: "enemy_idle",
        frames: scene.anims.generateFrameNumbers(SPRITES.ENEMY, {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    this.anims.play("enemy_idle", true);

    this.healthText = scene.add.text(this.x, this.y - 50, `${this.health}`, {
      fontSize: "12px",
      color: "#ffffff",
    });

    this.healthText.setOrigin(0.5);
  }

  // getting player from current scene and setting his info in enemy
  setPlayer(player: Entity) {
    this.player = player;
  }

  // following to player functionality
  followToPlayer(player: Entity) {
    this.scene.physics.moveToObject(this, player, this.moveSpeed);
  }

  // attack functionality
  attack(target: Entity) {
    const distanceToPlayer = Math.Distance.Between(
      this.x,
      this.y,
      target.x,
      target.y,
    );

    // если противник не далеко от нас, то он получает урон
    if (distanceToPlayer < 50) {
      target.takeDamage(5);
    }
  }

  // getting damage and death functionality
  takeDamage(damage: number) {
    super.takeDamage(damage);

    this.healthText.setText(`${this.health}`);

    if (this.health <= 0) {
      this.deactivate();
    }
  }

  deactivate() {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;


    this.healthText.destroy();

    if (this.onDeath) {
      this.onDeath(this);
    }

    this.destroy();
  }

  update() {
    if (!this.player || !this.isAlive) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;

    const distanceToPlayer = Math.Distance.Between(
      this.x,
      this.y,
      this.player.x,
      this.player.y,
    );

    if (distanceToPlayer > this.attackRange && body.touching.down) {
      this.followToPlayer(this.player);

      if (this.player.x < this.x) {
        this.setFlipX(true);
      } else {
        this.setFlipX(false);
      }
    } else {
      this.setVelocity(0, 0);

      // attack functionality
      const currentTime = this.scene.time.now;
      if (currentTime - this.lastAttackTime >= this.attackCooldown) {
        this.attack(this.player);
        this.lastAttackTime = currentTime;
      }
      console.log(this.player.health);
    }

    if (this.healthText) {
      this.healthText.setPosition(this.x, this.y - 50);
    }
  }
}
