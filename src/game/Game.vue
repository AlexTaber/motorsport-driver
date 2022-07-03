<template>
  <IonPage>
    <Player v-if="scene" />

    <div id="game" />
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage } from '@ionic/vue';

import { useGameFactory } from "./game.factory";
import Player from './player/Player.vue';
import { scene } from "./game.scene";

const { createGame } = useGameFactory();

createGame();
</script>
