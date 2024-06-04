<script setup lang="ts">
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';
import PhaserGame from './game/PhaserGame.vue';
import { Game } from './game/scenes/Game';

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

const addSprite = () => {

    const scene = toRaw(phaserRef.value.scene) as Phaser.Scene;

    if (scene)
    {

        // Add a new sprite to the current scene at a random position
        const x = Phaser.Math.Between(64, scene.scale.width - 64);
        const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
        // `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
        scene.add.sprite(x, y, 'star');

    }

}
const addMoreTank = ()=>{
    const scene = toRaw(phaserRef.value.scene) as Game;

    if (scene)
    {
        scene.addMPlayers(5);
    }
}

</script>

<template>
    <PhaserGame ref="phaserRef" />
    <div>
        <div>
            
            <button class="button" @click="addMoreTank">Add More Tank</button> <br/>
            <button class="button" @click="addSprite">Add New Sprite</button>
            
        </div>
    </div>
</template>
