import { InputNodeType } from "../input-nodes/input-node.model";
import { useDistance } from "../utils/distance.service";

interface InputNodeParams {
  type: InputNodeType;
  distance: number;
}

export class Track {
  private distanceService = useDistance();

  public distance = this.distanceService.kilometer * 0.2;
  public nodeIndex = 0;
  public nodes: InputNodeParams[] = [
    {
      type: "brake",
      distance: this.distance * 0.03,
    },

    {
      type: "steer",
      distance: this.distance * 0.08,
    },

    {
      type: "throttle",
      distance: this.distance * 0.14,
    },

    {
      type: "brake",
      distance: this.distance * 0.18,
    },

    {
      type: "steer",
      distance: this.distance * 0.30,
    },

    {
      type: "throttle",
      distance: this.distance * 0.35,
    },

    {
      type: "brake",
      distance: this.distance * 0.47,
    },

    {
      type: "steer",
      distance: this.distance * 0.55,
    },

    {
      type: "throttle",
      distance: this.distance * 0.62,
    },

    {
      type: "steer",
      distance: this.distance * 0.8,
    }
  ]
}
