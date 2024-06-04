import { GameObjects, Physics, Scene } from "phaser";
export class Tank extends Physics.Matter.Sprite{

    _layer: GameObjects.Container;
    _scene: Scene;
    _direction:number;
    _speed:number;
    _ammoType:string;

    constructor(name:string, texture:string, container:GameObjects.Container, scene:Scene){
        super(scene.matter.world, (container.width as number)/2, (container.height as number)/2, texture);
        this._layer = container;
        this._scene = scene;
        container.add(this);
    }
    
    move(derection:number){
        this._direction = derection;
    }

    shot(){

    }

    upgradeSpeed(speed:number){
        this._speed = speed;
    }

    upgradeAmmo(ammoType:string){
        this._ammoType = ammoType;
    }

    remove(){
        this._layer.remove(this);
        this._scene.matter.world.remove(this.body as any);
    }   

}


export class Bullet extends Physics.Matter.Sprite{
    tank:Physics.Matter.Sprite;
    _direction:number;
    _speed:number;

    constructor(tank:Tank, texture:string, scene:Scene){
        super(scene.matter.world ,tank.x, tank.y, texture);
        this._direction = tank._direction;
        this._speed = 4;
        tank._layer.add(this);
    }
}