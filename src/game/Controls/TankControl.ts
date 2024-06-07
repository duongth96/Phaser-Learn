import { Scene, GameObjects, Math as pMath } from "phaser";
import { Tank } from "../models/Tank";
import { moveToDone, rotaDone } from "./CalcFunc";

export function addTank(scene:Scene, container: GameObjects.Container, x:number, y:number, texture: string, tanks:Array<Tank>){
    const tank = new Tank(scene,x,y,texture);
    tank.setDirection(0);
    tanks.push(tank);
    container.add(tank);
    return tank;
}

export function updateTank(time:number, tanks:Array<Tank>){
    for (let index = 0; index < tanks.length; index++) {
        const tank = tanks[index];
        tank.rotation = pMath.Angle.RotateTo(tank.rotation, - tank.direction, 0.05);
        if(rotaDone(tank) && tank.isMoving){
            tank.x = Math.sin(tank.direction) * tank.speed;
            tank.y = Math.cos(tank.direction) * tank.speed;
        }
    }
}