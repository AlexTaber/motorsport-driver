import { useStore } from "../../state/store";

const store = useStore("deltatime", {
  elasped: 0,
});

export function useDeltatime () {
  const update = (delta: number) => {
    store.elasped.value = delta / 1000;
  };

  return {
    elapsed: store.elasped,
    update,
  }
}
