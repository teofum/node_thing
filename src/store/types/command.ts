import { Changeset } from "json-diff-ts";

export type Command = {
  command: string;
  layerIdx: number;
  diff: Changeset;
};
