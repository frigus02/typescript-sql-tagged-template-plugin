import { PgNode } from "pg-query-native";

export const assignMap = <K, V>(
  dst: Map<K, V>,
  ...maps: Array<Map<K, V> | undefined>
) => {
  for (const map of maps) {
    if (map) {
      for (const [key, value] of map.entries()) {
        dst.set(key, value);
      }
    }
  }
};

export interface Warning {
  type: "not_supported" | "other";
  what: string;
  node?: PgNode;
}

export const notSupported = (what: string, node?: PgNode): Warning => ({
  type: "not_supported",
  what,
  node
});

export const other = (what: string, node?: PgNode): Warning => ({
  type: "other",
  what,
  node
});
