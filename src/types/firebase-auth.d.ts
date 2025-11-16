import "firebase/auth";

declare module "firebase/auth" {
  import type { Persistence } from "firebase/auth";

  export function getReactNativePersistence(storage: unknown): Persistence;
}
