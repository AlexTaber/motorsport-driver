import { ref } from "vue";
import { useStore } from "../../state/store";

const store = useStore("deltatime", {
  last: 0,
  elasped: 0,
});

export function useDeltatime () {
  const reset = () => store.last.value = Date.now();

  const update = () => {
    const now = Date.now();
    store.elasped.value = (now - store.last.value) / 1000;
    store.last.value = now;
  };

  return {
    elapsed: store.elasped,
    reset,
    update,
  }
}
