import { Scene, Math as pMath, Cameras, GameObjects, Physics } from 'phaser';
import { EventBus } from '../EventBus';
import { config } from 'process';
import { log } from 'console';

export class Game extends Scene
{
    
    zCamera:Cameras.Scene2D.Camera;
    zCamZoom:number = 2;
    gamePartW:number;
    gamePartH:number;

    player:any;
    pX:number;
    pY:number;
    isMove:boolean;
    fishes:Array<any> = [];
    shells:Array<any> = [];

    decorContainer:GameObjects.Container;
    playerContainer:GameObjects.Container;

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

        this.load.image('shell1', 'Medium_Shell.png');

        this.load.spritesheet('tank1', 'Tank_01_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('tank1_tr2', 'Tank_01_TR2_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        //this.load.spritesheet('bomb1', 'bomb_01.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('explosion1', 'explosion_01.png', { frameWidth: 256, frameHeight: 256 });
    }

    create ()
    {
        this.initAnims();
        this.gamePartW = (this.game.config.width as number)/2;
        this.gamePartH = (this.game.config.height as number)/2;
        
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0);

        this.decorContainer = this.add.container();
        this.playerContainer = this.add.container();

        this.onKeyboardControl();
        this.zCamera = this.cameras.main
            .setSize((this.game.config.width as number), (this.game.config.height as number))
            .setZoom(this.zCamZoom);

        // (window as any).zCam = this.zCamera;
        // (window as any).pler = this.player;

        this.addPlayer();
        this.addFishes(2);

        

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number): void {
        this.player.rotation = pMath.Angle.RotateTo(this.player.rotation, - this.player.direction, 0.05);

        // // cách di chuyển 1
        // if(this.rotaDone(this.player) && !this.moveToDone({x:this.player.x, y:this.player.y},{x:this.pX, y:this.pY})){
        //     this.player.x += Math.sin(this.player.direction) * this.player.speed;
        //     this.player.y += Math.cos(this.player.direction) * this.player.speed;
        //     this.updateMainCameraFollow(this.player);
        // }

        // cách di chuyển 2
        if(this.rotaDone(this.player) && this.isMove){
            this.player.x += Math.sin(this.player.direction) * this.player.speed;
            this.player.y += Math.cos(this.player.direction) * this.player.speed;
            this.updateMainCameraFollow(this.player);
        }

        
        this.updateShells(time);
    }

    updateMainCameraFollow(sprite:any){
        var camPaddingW = this.zCamera.worldView.width / this.zCamZoom;
        var camPaddingH = this.zCamera.worldView.height / this.zCamZoom

        if(sprite.x > camPaddingW && sprite.x < (this.game.config.width as number) - camPaddingW)
            this.zCamera.scrollX += Math.sin(sprite.direction) * sprite.speed;
        if(sprite.y > camPaddingH && sprite.y < (this.game.config.height as number) - camPaddingH)
            this.zCamera.scrollY += Math.cos(sprite.direction) * sprite.speed;
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
                this.player.play('anim_run1');
                this.isMove = true;
            }
        });
        this.input.keyboard?.on('keydown-S',()=>{
            this.player.direction = Math.atan2(0, (this.game.config.height as number) - (this.player.y as number));
            if(!this.isMove){
                this.player.play('anim_run1');
                this.isMove = true;
            }
        });
        this.input.keyboard?.on('keydown-A',()=>{
            this.player.direction = Math.atan2(0 - this.player.x, 0);
            if(!this.isMove){
                this.player.play('anim_run1');
                this.isMove = true;
            }
        });
        this.input.keyboard?.on('keydown-D',()=>{
            this.player.direction = Math.atan2((this.game.config.width as number) - (this.player.x as number), 0);
            if(!this.isMove){
                this.player.play('anim_run1');
                this.isMove = true;
            }
        });

        this.input.keyboard?.on('keydown-SPACE',()=>{
            this.addShell(this.player);
            //this.addExplosion(Math.random()*(this.game.config.width as number), Math.random()*(this.game.config.height as number));
        });

        this.input.keyboard?.on('keyup',(event:any)=>{
            console.log(event);
            

            if(
                event.code=='KeyW' ||
                event.code=='KeyS' ||
                event.code=='KeyA' ||
                event.code=='KeyD'
            ){
                setTimeout(()=>{
                    this.isMove = false;
                    this.player.stop();
                }, 400);
            }
            
        });
    }

    initAnims(){
        this.anims.create({
            key: 'anim_run1',
            frames: this.anims.generateFrameNumbers('tank1_tr2', { start: 0, end: 1, first: 1 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'anim_explosion1',
            frames: this.anims.generateFrameNumbers('explosion1', { start: 0, end: 9}),
            frameRate: 15,
            repeat: 0
        });
    }

    addFishes(num:integer){
        for(let i=0; i < num; i++){

            const x = Math.random()*(this.game.config.width as number);
            const y = Math.random()*(this.game.config.height as number);

            const fish = new Physics.Matter.Sprite(this.matter.world, x, y, "fish1")
                .setScale(.2)
                .setStatic(true);
            fish.preFX?.addShadow();

            this.fishes.push(fish);
            this.playerContainer.add(fish);
        }
    }
    updateFishes(time:number){
        for (let index = 0; index < this.fishes.length; index++) {
            const fish = this.fishes[index];

        }
    }

    addPlayer(){

        this.player = new Physics.Matter.Sprite(this.matter.world, (this.game.config.width as number)/2,(this.game.config.height as number)/2, 'tank1_tr2');
        
        this.player.setScale(.2);
        this.player.setFlip(false, true);

        this.player.preFX.addShadow();

        this.player.direction = 0;
        this.player.speed = 2;
        this.player.angle = 30;

        this.playerContainer.add(this.player);
    }

    addShell(player:any){
        if(!this.rotaDone(player)) return;

        const shell:any = this.add.sprite((player.x as number), (player.y as number), 'shell1')
            .setScale(.5)
            .setFlip(false, true);

        shell.direction = player.direction;
        shell.speed = 4;
        shell.rotation = - shell.direction;
        shell.startX = shell.x;
        shell.startY = shell.y;

        this.shells.push(shell);
    }
    updateShells(time:number){
        for (let index = 0; index < this.shells.length; index++) {
            const shell = this.shells[index];

            if(this.getDist(shell)>200)
            {
                this.children.remove(shell);
                //this.addExplosion(shell.x, shell.y);
            }
            else
            {
                shell.x += Math.sin(shell.direction) * shell.speed;
                shell.y += Math.cos(shell.direction) * shell.speed;
            }
            
        }
    }

    addExplosion(x:number, y:number){
        this.decorContainer.add(new GameObjects.Sprite(this, x, y, "explosion1")
            .setScale(.2)
            .play('anim_explosion1'));
    }

    moveToDone(cPoint:any, toPoint:any){
        return Math.abs(cPoint.x - toPoint.x) < 5 && Math.abs(cPoint.y - toPoint.y) < 5;
    }
    rotaDone(player:any){
        return (Math.round(Math.abs(player.rotation)*100)/100) === (Math.round(Math.abs(player.direction)*100)/100);
    }

    getDist(obj:any){
        let xx = Math.abs(obj.x - obj.startX);
        let yy = Math.abs(obj.y - obj.startY);
        return Math.sqrt((xx*xx)+(yy*yy));
    }
}
