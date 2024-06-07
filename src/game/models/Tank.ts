import { GameObjects, Physics, Scene } from "phaser";
export class Tank extends Physics.Matter.Sprite{
    scene: Scene;
    direction:number =0;
    speed:number =2;
    rotationSpeed:number = 0.05;
    bulletType:string;
    _isMe: boolean=false;
    isMoving:boolean=true;

    constructor(scene:Scene, x:number, y:number , texture:string, isMe: boolean = false){
        super(scene.matter.world, x, y, texture);
        this.scene = scene;
        this._isMe = isMe;
    }
    
    setDirection(derection:number){
        this.direction = derection;
    }
    setSpeed(speed:number){
        this.speed = speed;
    }

    setBullet(bulletType:string){
        this.bulletType = bulletType;
    }
    
    remove(layer: GameObjects.Container){
        layer.remove(this);
        this.scene.matter.world.remove(this.body as any);
    }

    shot(): Bullet{
        return new Bullet(this.scene, this, this.bulletType);
    }

    isMe=()=>this._isMe;
}


export class Bullet extends Physics.Matter.Sprite{
    tank:Physics.Matter.Sprite;
    direction:number;
    speed:number;

    constructor(scene:Scene, tank:Tank, texture:string){
        super(scene.matter.world ,tank.x, tank.y, texture);
        this.direction = tank.direction;
        this.speed = 4;
    }
}