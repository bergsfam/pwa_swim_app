declare module 'uuid' {
  export interface V4Options {
    random?: Uint8Array;
    rng?: () => Uint8Array;
  }

  export function v4(options?: V4Options): string;
}
