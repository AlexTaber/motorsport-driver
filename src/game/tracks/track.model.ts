import { useDistance } from "../utils/distance.service";

export class Track {
  private distanceService = useDistance();

  public distance = this.distanceService.kilometer * 0.2;
  public nodeIndex = 0;
  public nodes = [
    {
      distance: this.distance * 0.03,
    },

    {
      distance: this.distance * 0.08,
    },

    {
      distance: this.distance * 0.14,
    },

    {
      distance: this.distance * 0.18,
    },

    {
      distance: this.distance * 0.30,
    },

    {
      distance: this.distance * 0.35,
    },

    {
      distance: this.distance * 0.47,
    },

    {
      distance: this.distance * 0.70,
    },

    {
      distance: this.distance * 0.92,
    },

    {
      distance: this.distance * 0.96,
    }
  ]
}
