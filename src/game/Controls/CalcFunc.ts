import { Scene } from "phaser";

export function moveToDone(cPoint:any, toPoint:any){
    return Math.abs(cPoint.x - toPoint.x) < 5 && Math.abs(cPoint.y - toPoint.y) < 5;
}
export function rotaDone(sprite:any){
    return (Math.round(Math.abs(sprite.rotation)*100)/100) === (Math.round(Math.abs(sprite.direction)*100)/100);
}

export function getDist(obj:any){
    let xx = Math.abs(obj.x - obj.startX);
    let yy = Math.abs(obj.y - obj.startY);
    return Math.sqrt((xx*xx)+(yy*yy));
}

export function calcDirection(scene:Scene, sprite:any, directKeyCode:any){
    if(!sprite) return;
    if(directKeyCode==='w'){
        sprite.direction = Math.atan2(0, 0 - sprite.y);
    }
    if(directKeyCode==='s'){
        sprite.direction = Math.atan2(0, (scene.game.config.height as number) - (sprite.y as number));
    }
    if(directKeyCode==='a'){
        sprite.direction = Math.atan2(0 - sprite.x, 0);
    }
    if(directKeyCode==='d'){
        sprite.direction = Math.atan2((scene.game.config.width as number) - (sprite.x as number), 0);
    }
}

export function getPlayerMatchAxist(sprite:any, sprites:Array<any>){
    for (let index = 0; index < sprites.length; index++) {
        const p1 = sprites[index];
        if(sprite == p1) continue;
        if(Math.abs(sprite.x - p1.x) < 20 || Math.abs(sprite.y - p1.y) < 20)
        {
            return p1;
        }
    }
    return null;
}