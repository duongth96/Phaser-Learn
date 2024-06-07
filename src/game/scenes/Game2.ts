import { Scene, Math as pMath, Cameras, GameObjects, Physics } from 'phaser';
import { EventBus } from '../EventBus';
import { Tank } from '../models/Tank';

export class Game2 extends Scene
{
    player:Tank;
    players:Array<Tank> = [];

    // layers
    decorGrContainer:GameObjects.Container;
    playerContainer:GameObjects.Container;

    constructor ()
    {
        super('Game2');
    }

    preload ()
    {
        this.load.setPath('assets/tank');
        this.load.spritesheet('tank1', 'Hull_Track_01_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        this.load.image('gun2', 'Gun_02.png');
    }

    create ()
    {
        let gameWidth = (this.game.config.width as number);
        let gameHeight = (this.game.config.height as number);
        var grid = this.add.grid(0, 0, gameWidth, gameHeight, gameWidth/20, gameHeight/10);
        grid.outlineFillColor = 0xE74C3C;

        // layers 
        this.decorGrContainer = this.add.container();
        this.playerContainer = this.add.container();

        this.addPlayer();
        
        EventBus.emit('current-scene-ready', this);

    }

    update(){
        
    }


    addPlayer(){

        this.player = new Tank(this, 100, 100, 'tank1', true);
        
        this.player.setScale(.5);
        this.player.setFlip(false, true);
        this.player.setBullet('bull1');

        this.playerContainer.add(this.player);
    }


    changeScene ()
    {
        this.scene.start('Game');
    }
}
