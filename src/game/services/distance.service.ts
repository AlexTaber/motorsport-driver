export function useDistance() {
  const meter = 0.1;
  const kilometer = meter * 1000;

  const kphToPixelsPerSecond = (kph: number) => {
    return (kph * kilometer) / 60 / 60;
  }

  return {
    meter,
    kilometer,
    kphToPixelsPerSecond,
  };
}
