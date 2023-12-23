import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  create(scene: any, x: number, y: number, collision: any) {

     var player = scene.physics.add.image(x, y, "player");
    player.setCollideWorldBounds(true);
    scene.physics.add.collider(player, collision);
  }

}
