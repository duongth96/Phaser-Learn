import { Scene, Math as pMath, Cameras, GameObjects, Physics } from 'phaser';
import { EventBus } from '../EventBus';

export class Game2 extends Scene
{
    player:any;
    constructor ()
    {
        super('FishAuto');
        
    }

    preload ()
    {
        this.load.setPath('assets/tank');
        this.load.spritesheet('tank1', 'Hull_Track_01_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        this.load.image('gun2', 'Gun_02.png');
    }

    create ()
    {
        this.addPlayer();
        
        EventBus.emit('current-scene-ready', this);

    }

    update(){

    }


    addPlayer(){

        this.player = new Physics.Matter.Sprite(this.matter.world, (this.game.config.width as number)/2,(this.game.config.height as number)/2, 'tank1');
        
        this.player.setScale(.5);
        this.player.setFlip(false, true);

        this.player.preFX.addShadow();

        this.player.direction = 0;
        this.player.speed = 1;
        this.player.name = "myTank"

        this.children.add(this.player);
    }
}
