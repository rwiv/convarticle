export interface AppConfigs {
  storageKey: StorageKey;
}

interface StorageKey {
  temp1: string;
  temp2: string;
  stateKey: string;
  targetWords: string;
  match: string;
}

export const appConfigs: AppConfigs = {
  storageKey: {
    temp1: "temp1",
    temp2: "temp2",
    stateKey: "state",
    targetWords: "targetWords",
    match: "match",
  }
}
