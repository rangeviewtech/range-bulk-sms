import { ReactNode } from 'react';

export type WithClassName<T = unknown> = T & {
  className?: string;
};

export type WithChildren<T = unknown> = T & {
  children: ReactNode;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Nullable<T> = T | null;

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type ValueOf<T> = T[keyof T];
