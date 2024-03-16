export type Prettify<T> = { [K in keyof T]: T[K] } & unknown;

export type Combine<T, U> = [T] extends [never] ? U : Prettify<T & U>;

const createBus = <T>() => {
  const listeners = new Set<(data: T) => void>();
  return Object.freeze({
    listen: (listener: (data: T) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    notify: (data: T) => {
      listeners.forEach(listener => listener(data));
    },
  });
};

export type ExtraProps<T> = {
  confirmWith: (result: T) => void;
  cancel: () => void;
  open: boolean;
};

export type Disturber = {
  Component: React.FC<any>;
  props: ExtraProps<any>;
  id: number;
};

type Message =
  | { type: 'add'; disturber: Disturber }
  | { type: 'remove'; id: number; onEffectCleanup: () => void };

export const bus = createBus<Message>();
