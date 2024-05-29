import { Scene, Math as pMath } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene
{
    player:any;
    pX:number;
    pY:number;
    isMove:boolean;
    fishes:Array<any> = [];

    constructor ()
    {
        super('Game');

    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('star', 'star.png');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('fish1', 'fishauto/fish1.png');
        this.load.spritesheet('tank1', 'Tank_01_Sheets.png', { frameWidth: 256, frameHeight: 256 });

        
    }

    create ()
    {
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('tank1', { start: 0, end: 1, first: 1 }),
            frameRate: 15,
            repeat: -1
        });
        
        this.add.image(512, 384, 'background');

        this.player = this.matter.add.sprite(512, 350, 'tank1')
            .setScale(.3)
            .setFlip(false, true)
            //.setOrigin(.5, 1);

        this.player.direction = 0;
        this.player.speed = 2;
        this.player.angle = 30;
        
        this.addFishes(2);
        

        this.input.on('pointerdown',()=>{
            let pt = this.game.input.mousePointer;
            this.pX = pt?.worldX??0;
            this.pY = pt?.worldY??0;
            
            this.player.direction = Math.atan2(this.pX-this.player.x, this.pY - this.player.y);
        });

        this.input.keyboard?.on('keydown-W',()=>{
            this.player.direction = Math.atan2(0, 0 - this.player.y);
            if(!this.isMove){
                this.player.play('run');
                this.isMove = true;
            }
        });
        this.input.keyboard?.on('keydown-S',()=>{
            this.player.direction = Math.atan2(0, (this.game.config.height as number) - (this.player.y as number));
            if(!this.isMove){
                this.player.play('run');
                this.isMove = true;
            }
        });
        this.input.keyboard?.on('keydown-A',()=>{
            this.player.direction = Math.atan2(0 - this.player.x, 0);
            if(!this.isMove){
                this.player.play('run');
                this.isMove = true;
            }
        });
        this.input.keyboard?.on('keydown-D',()=>{
            this.player.direction = Math.atan2((this.game.config.width as number) - (this.player.x as number), 0);
            if(!this.isMove){
                this.player.play('run');
                this.isMove = true;
            }
            
            
        });

        this.input.keyboard?.on('keyup',()=>{
            setTimeout(()=>{
                this.isMove = false;
                this.player.stop();
            }, 400);
        });
        
        
        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number): void {
        this.player.rotation = pMath.Angle.RotateTo(this.player.rotation, - this.player.direction, 0.05);

        // this.player.x += Math.sin(this.player.direction) * this.player.speed;
        // this.player.y += Math.cos(this.player.direction) * this.player.speed;

        if(this.rotaDone(this.player.rotation, - this.player.direction) && this.isMove){
            this.player.x += Math.sin(this.player.direction) * this.player.speed;
            this.player.y += Math.cos(this.player.direction) * this.player.speed;
        }
    }


    addFishes(num:integer){
        for(let i=0; i < num; i++){

            const x = Math.random()*(this.game.config.width as number);
            const y = Math.random()*(this.game.config.height as number);
            const fish = this.matter.add.sprite(x, y, "fish1")
                .setScale(.5)
                .setStatic(true);

            this.fishes.push(fish);

        }
    }

    moveToDone(cPoint:any, toPoint:any){
        return (cPoint.x - toPoint.x) < 5 && (cPoint.y - toPoint.y);
    }
    rotaDone(n1:number, n2:number){
        return (Math.round(Math.abs(n1)*100)/100) === (Math.round(Math.abs(n2)*100)/100);
    }

}
