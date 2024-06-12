import { Game as MainGame } from './scenes/Game';
import { Game2 } from './scenes/Game2';
import { AUTO, Game, Types } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1020,
    height: 768,
    physics: { 
        default: 'matter',
        matter:{
            debug:false,
            gravity:{x:0,y:0}
        }
    },
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        MainGame,
        Game2,
    ]
};

const StartGame = (parent: any) => {
    return new Game({ ...config, parent });
}

export default StartGame;

