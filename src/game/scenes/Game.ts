import { Scene, Math as pMath, Cameras, GameObjects, Physics } from 'phaser';
import { EventBus } from '../EventBus';
import internal from 'stream';

export class Game extends Scene
{
    
    zCamera:Cameras.Scene2D.Camera;
    zCamZoom:number = 2;
    gamePartW:number;
    gamePartH:number;

    players:Array<any> =[];
    player:any;
    pX:number;
    pY:number;
    isMove:boolean;
    staticObjects:Array<any> = [];
    shells:Array<any> = [];
    autosetInterval:any

    staticNames = ["cont1","cont2","cont3","cont4"];
    directCodes = ['w','s','a','d'];

    // game layers
    decorContainer:GameObjects.Container;
    staticContainer:GameObjects.Container;
    playerContainer:GameObjects.Container;
    enemyContainer:GameObjects.Container;
    aminsContainer:GameObjects.Container;

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

        // static object
        this.load.image('cont1', 'Container_A.png');
        this.load.image('cont2', 'Container_B.png');
        this.load.image('cont3', 'Container_C.png');
        this.load.image('cont4', 'Container_D.png');

        this.load.spritesheet('tank1', 'Tank_01_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('tank1_tr2', 'Tank_01_TR2_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('boom1', 'bomb_01.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('explosion1', 'explosion_01.png', { frameWidth: 256, frameHeight: 256 });

        this.load.spritesheet('hull1', 'tank/Hull_Track_01_Sheets.png', { frameWidth: 256, frameHeight: 256 });
        this.load.image('gun2', 'tank/Gun_02.png');
    }

    create ()
    {
        this.initAnims();
        this.pX=this.gamePartW = (this.game.config.width as number)/2;
        this.pY=this.gamePartH = (this.game.config.height as number)/2;
        
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0);

        this.decorContainer = this.add.container();
        this.staticContainer = this.add.container();
        this.playerContainer = this.add.container();
        this.enemyContainer = this.add.container();
        this.aminsContainer = this.add.container();

        this.onKeyboardControl();
        this.zCamera = this.cameras.main
            .setSize((this.game.config.width as number), (this.game.config.height as number))
            .setZoom(this.zCamZoom);
        

        this.addPlayer();
        //this.addPlayerMode2();
        this.addMPlayers(1);
        this.addStaticSolid(5);

        // world inpact
        this.matter.world.on('collisionstart', (event:any)=>{
            //console.log(event);
            //let { bodies} = event.source.detector;
            if(event.pairs[0].bodyA.gameObject.name === "shell"){
                this.children.remove(event.pairs[0].bodyA.gameObject);
                this.matter.world.remove(event.pairs[0].bodyA);
            }
            if(event.pairs[0].bodyB.gameObject.name === "shell"){
                this.children.remove(event.pairs[0].bodyB.gameObject);
                this.matter.world.remove(event.pairs[0].bodyB);
            }
        });

        this.matter.world.on('collisionend', (event:any)=>{
            if(
                (event.pairs[0].bodyA.gameObject.name === "shell" && event.pairs[0].bodyB.gameObject.name === "cont") ||
                (event.pairs[0].bodyA.gameObject.name === "cont" && event.pairs[0].bodyB.gameObject.name === "shell")
            ){
                this.addBoom(event.pairs[0].bodyB.position.x, event.pairs[0].bodyB.position.y);
            }
            
            if(
                (event.pairs[0].bodyA.gameObject.name === "shell" && event.pairs[0].bodyB.gameObject.name === "otherTank") ||
                (event.pairs[0].bodyA.gameObject.name === "otherTank" && event.pairs[0].bodyB.gameObject.name === "shell")
            ){

                let tankBody = (event.pairs[0].bodyA.gameObject.name == "otherTank"?event.pairs[0].bodyA:event.pairs[0].bodyB);
                let index = this.players.indexOf(tankBody.gameObject);
                this.players.splice(index, 1);
                this.playerContainer.remove(tankBody.gameObject, true);
                this.matter.world.remove(tankBody);
                this.addExplosion(tankBody.position.x, tankBody.position.y); 
            }
        });

        var sGrid = new GameObjects.Grid(this);
        sGrid.width = 256;
        sGrid.height = 256;
        this.children.add(sGrid);

        
        (window as any).zCam = this.zCamera;
        (window as any).pler = this.player;

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number): void {
        
        this.updatePlayer(time);
        this.updateMPlayers(time);
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
        // this.input.on('pointermove',(event:any)=>{
        //     let {worldX, worldY}=event;
        //     this.player.gun.direction = Math.atan2(worldX-this.player.x, worldY - this.player.y);
        // });
        // this.input.on('pointerdown',()=>{
        //     let pt = this.game.input.mousePointer;
        //     this.pX = pt?.worldX??0;
        //     this.pY = pt?.worldY??0;
            
        //     this.player.direction = Math.atan2(this.pX-this.player.x, this.pY - this.player.y);
        //     if(!this.isMove){
        //         this.player.play('anim_run2');
        //         this.isMove = true;
        //     }
            
        // });

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

                console.log(this.player.direction);
                
            }
            
        });
    }

    initAnims(){
        this.anims.create({
            key: 'anim_run1',
            frames: this.anims.generateFrameNumbers('tank1_tr2', { start: 0, end: 1}),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: 'anim_run2',
            frames: this.anims.generateFrameNumbers('hull1', { start: 0, end: 1}),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'anim_explosion1',
            frames: this.anims.generateFrameNumbers('explosion1', { start: 0, end: 8}),
            frameRate: 15,
            repeat: 0
        });
        this.anims.create({
            key: 'anim_boom1',
            frames: this.anims.generateFrameNumbers('boom1', { start: 0, end: 5}),
            frameRate: 15,
            repeat: 0
        });
    }

    addStaticSolid(num:integer){
        for(let i=0; i < num; i++){

            var sptName = this.staticNames[Math.floor(Math.random()*this.staticNames.length)]

            const x = Math.random()*(this.game.config.width as number);
            const y = Math.random()*(this.game.config.height as number);

            const cont = new Physics.Matter.Sprite(this.matter.world, x, y, sptName)
                .setScale(.3)
                .setStatic(true)
                .setName("cont");

            cont.preFX?.addShadow();

            //this.staticObjects.push(cont);
            this.staticContainer.add(cont);
            
        }
    }

    

    addPlayerMode2(){

        this.player = new Physics.Matter.Sprite(this.matter.world, (this.game.config.width as number)/2,(this.game.config.height as number)/2, 'hull1');
        this.player.setScale(.15);
        this.player.setFlip(false, true);
        this.player.preFX.addShadow();
        this.player.direction = 0;
        this.player.speed = 1;
        this.player.name = "myTank";

        //add gun;
        this.player.gun = new GameObjects.Sprite(this, this.player.x, this.player.y, "gun2");
        this.player.gun.setScale(.15);
        this.player.gun.setFlip(false, true);
        this.player.gun.setOrigin(.5, .3);
        this.player.gun.direction = this.player.direction;
        this.player.turnSpeed = .5;

        this.playerContainer.add(this.player);
        this.playerContainer.add(this.player.gun);
    }

    addPlayer(){

        this.player = new Physics.Matter.Sprite(this.matter.world, (this.game.config.width as number)/2,(this.game.config.height as number)/2, 'tank1_tr2');
        
        this.player.setScale(.15);
        this.player.setFlip(false, true);

        this.player.preFX.addShadow();

        this.player.direction = 0;
        this.player.speed = 1;
        this.player.name = "myTank"

        this.playerContainer.add(this.player);
    }

    addMPlayers(num:integer){
        

        for (let index = 0; index < num; index++) {
            const x = Math.random()*(this.game.config.width as number);
            const y = Math.random()*(this.game.config.height as number);
            const mPlayer : any = new Physics.Matter.Sprite(this.matter.world, x, y, 'tank1');

            mPlayer.setScale(.15);
            mPlayer.setFlip(false, true);

            mPlayer.preFX.addShadow();

            mPlayer.direction = 0;
            mPlayer.speed = 1;
            mPlayer.name = "otherTank";
            mPlayer.isMove = true;
            this.calcDirection(mPlayer, this.directCodes[Math.floor(Math.random()*this.directCodes.length)]);

            this.playerContainer.add(mPlayer);
            this.players.push(mPlayer);
        }

        this.autosetInterval = setInterval(()=>{
            
            for (let index = 0; index < this.players.length; index++) {
                this.calcDirection(this.players[index], this.directCodes[Math.floor(Math.random()*this.directCodes.length)]);
            }
        },2000);
    }
    updatePlayer(time:number){
        this.player.rotation = pMath.Angle.RotateTo(this.player.rotation, - this.player.direction, 0.05);

        // // cách di chuyển 1
        // if(this.rotaDone(this.player) && !this.moveToDone({x:this.player.x, y:this.player.y},{x:this.pX, y:this.pY})){
        //     this.player.x += Math.sin(this.player.direction) * this.player.speed;
        //     this.player.y += Math.cos(this.player.direction) * this.player.speed;
        //     this.player.gun.x = this.player.x;
        //     this.player.gun.y = this.player.y;
            
        //     this.updateMainCameraFollow(this.player);
        // }

        // cách di chuyển 2
        if(this.rotaDone(this.player) && this.isMove){
            this.player.x += Math.sin(this.player.direction) * this.player.speed;
            this.player.y += Math.cos(this.player.direction) * this.player.speed;
            this.updateMainCameraFollow(this.player);
        }
    }
    updateMPlayers(time:number){
        for (let index = 0; index < this.players.length; index++) {
            const mPlayer = this.players[index];
            mPlayer.rotation = pMath.Angle.RotateTo(mPlayer.rotation, - mPlayer.direction, 0.05);
            if(this.rotaDone(mPlayer) && mPlayer.isMove){
                mPlayer.x += Math.sin(mPlayer.direction) * mPlayer.speed;
                mPlayer.y += Math.cos(mPlayer.direction) * mPlayer.speed;
            }

            var matchP = this.getPlayerMatchAxist(mPlayer, this.players);
            if(matchP!=null){
                this.addShell(matchP);
            }
        }
    }




    addShell(player:any){
        if(!this.rotaDone(player)) return;
        if(player.lastShell && (Date.now()-player.lastShell)<2000) return;
        var x = 0;
        var y = 0;
        var margin = 40;
        
        player.lastShell = Date.now();
        if(player.direction == 0)//s
        {
            x = player.x;
            y = player.y+margin;
        }
        if(Math.round(player.direction) == -2)//a
        {
            x = player.x-margin;
            y = player.y;
        }
        if(Math.round(player.direction) == 3)//w
        {
            x = player.x;
            y = player.y-margin;
        }
        if(Math.round(player.direction) == 2)//d
        {
            x = player.x+margin;
            y = player.y;
        }

        const shell:any = this.matter.add.sprite(x, y, 'shell1')
            .setScale(.5)
            .setCircle(5)
            .setFlip(false, true);

        shell.direction = player.direction;
        shell.speed = 4;
        shell.rotation = - shell.direction;
        shell.startX = shell.x;
        shell.startY = shell.y;
        shell.name="shell";

        this.shells.push(shell);
    }
    updateShells(time:number){
        for (let index = 0; index < this.shells.length; index++) {
            const shell = this.shells[index];

            if(this.getDist(shell)>200)
            {
                this.children.remove(shell);
                this.matter.world.remove(shell.body);
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
        this.decorContainer.add(
            new GameObjects.Sprite(this, x, y, "explosion1")
                .setScale(.2)
                .play('anim_explosion1')
        );
    }
    addBoom(x:number, y:number){
        this.aminsContainer.add(
            new GameObjects.Sprite(this, x, y, "boom1")
                .setScale(.2)
                .play('anim_boom1')
        );
    }

    //#region calc method

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

    calcDirection(player:any, directKeyCode:any){
        if(directKeyCode==='w'){
            player.direction = Math.atan2(0, 0 - player.y);
        }
        if(directKeyCode==='s'){
            player.direction = Math.atan2(0, (this.game.config.height as number) - (player.y as number));
        }
        if(directKeyCode==='a'){
            player.direction = Math.atan2(0 - player.x, 0);
        }
        if(directKeyCode==='d'){
            player.direction = Math.atan2((this.game.config.width as number) - (player.x as number), 0);
        }
    }

    getPlayerMatchAxist(player:any, players:Array<any>){
        for (let index = 0; index < players.length; index++) {
            const p1 = players[index];
            if(player == p1) continue;
            if(Math.abs(player.x - p1.x) < 20 || Math.abs(player.y - p1.y) < 20)
            {
                console.log('pos',{xx:Math.abs(player.x - p1.x), yy:Math.abs(player.y - p1.y)});
                
                return p1;
            }
        }
        return null;
    }

    
    //#endregion
}
