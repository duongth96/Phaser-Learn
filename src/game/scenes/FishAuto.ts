import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class FishAuto extends Scene
{
    constructor ()
    {
        super('FishAuto');
    }

    preload ()
    {
        this.load.setPath('assets/fishauto');
        
        this.load.image('fish1', 'fish1.png');
        this.load.image('background', 'pond_background.jpg');
    }

    create ()
    {
        
        this.add.image(512, 384, 'background');
        this.add.sprite(100,100,"fish1");
        
        EventBus.emit('current-scene-ready', this);

    }
}
