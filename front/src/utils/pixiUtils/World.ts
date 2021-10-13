import { Player } from "./Player";
import { Stuff } from "./Stuff";

export interface World {
  startPosition: { x: number; y: number };
  // stuffs: Stuff[];
  // player: Player;
}
