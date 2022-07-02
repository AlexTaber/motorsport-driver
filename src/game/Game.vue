<template>
  <IonPage>
    <div id="game" />
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage } from '@ionic/vue';

import { useGameFactory } from "./game.factory";

const { createGame } = useGameFactory();

createGame();
</script>
