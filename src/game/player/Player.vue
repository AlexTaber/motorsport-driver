<template>
  <div>
    <h4>
      Pace (Mistakes): {{ playerCar?.pace }} ({{ playerCar?.mistakes }})
    </h4>

    <h4>
      Last Lap (Fastest): {{ playerCar?.lastLap }} ({{ playerCar?.fastestLap }})
    </h4>

    <h4>
      Target Pace: {{ playerCar?.targetPace }}
    </h4>

    <h1 v-if="playerCar?.crashed">
      CRASHED
    </h1>
  </div>
</template>

<script setup lang="ts">
import { usePublicApi } from "../services/public-api.service";

const { playerCar } = usePublicApi();
</script>
