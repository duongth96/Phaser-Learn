import { Scene, Math as pMath, Cameras } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene
{
    player:any;
    pX:number;
    pY:number;
    isMove:boolean;
    fishes:Array<any> = [];
    zCamera:Cameras.Scene2D.Camera;
    zCamZoom:number = 2;

    constructor ()
    {
        super('Game');

    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('star', 'star.png');
        this.load.image('background', 'bg.png');
        this.load.image('background2', 'sand.jpg');
        this.load.image('logo', 'logo.png');
        this.load.image('fish1', 'fishauto/fish1.png');
        this.load.spritesheet('tank1', 'Tank_01_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('tank1_tr2', 'Tank_01_TR2_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        
    }

    create ()
    {
        this.initAnims();
        
        this.add.image(0, 0, 'background2')
            .setOrigin(0, 0)
            .setScale(.2)

        this.addPlayer();
        
        this.addFishes(2);
        this.onKeyboardControl()
       
        this.zCamera = this.cameras.add(0, 0, (this.game.config.width as number), (this.game.config.height as number))
            .setZoom(this.zCamZoom)
            //.setOrigin(0)
            .startFollow(this.player, true);
        //this.zCamera.setFollowOffset(0, 0);

        (window as any).zCam = this.zCamera;
        (window as any).pler = this.player;

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number): void {
        this.player.rotation = pMath.Angle.RotateTo(this.player.rotation, - this.player.direction, 0.05);

        if(this.rotaDone(this.player.rotation, - this.player.direction) && this.isMove){
            this.player.x += Math.sin(this.player.direction) * this.player.speed;
            this.player.y += Math.cos(this.player.direction) * this.player.speed;

            // this.zCamera.scrollX = this.player.x*this.zCamZoom;
            // this.zCamera.scrollY = this.player.y*this.zCamZoom;
        }
        

        
    }

    onKeyboardControl(){
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
            this.isMove = false;
            this.player.stop();
        });
    }

    initAnims(){
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('tank1_tr2', { start: 0, end: 1, first: 1 }),
            frameRate: 15,
            repeat: -1
        });
    }

    addFishes(num:integer){
        for(let i=0; i < num; i++){

            const x = Math.random()*(this.game.config.width as number);
            const y = Math.random()*(this.game.config.height as number);
            const fish = this.matter.add.sprite(x, y, "fish1")
                .setScale(.2)
                .setStatic(true);
            fish.preFX?.addShadow();

            this.fishes.push(fish);

        }
    }

    addPlayer(){
        this.player = this.matter.add.sprite(100, 100, 'tank1_tr2')
            .setScale(.2)
            .setFlip(false, true)
            //.setOrigin(.5, 1);

        this.player.preFX.addShadow();

        this.player.direction = 0;
        this.player.speed = 4;
        this.player.angle = 30;
    }

    moveToDone(cPoint:any, toPoint:any){
        return (cPoint.x - toPoint.x) < 5 && (cPoint.y - toPoint.y);
    }
    rotaDone(n1:number, n2:number){
        return (Math.round(Math.abs(n1)*100)/100) === (Math.round(Math.abs(n2)*100)/100);
    }

}
