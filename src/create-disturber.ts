import React from 'react';
import { type Combine, type ExtraProps, bus } from './utils';

type OtherProps = {
  atTop: boolean;
};
type DisturberComponent<T, P> = React.FC<
  Combine<P, ExtraProps<T> & OtherProps>
>;
type DisturbFn<T, P> = [P] extends [never]
  ? () => Promise<T | null>
  : (props: P) => Promise<T | null>;

const getNextId = (() => {
  let id = 0;
  return () => id++;
})();

export const createDisturber = <T, P = never>(
  Component: DisturberComponent<T, P>,
) => {
  function disturb(props = {}) {
    return new Promise(resolve => {
      const id = getNextId();
      const notifyRemove = (toResolve: any) => {
        bus.notify({
          type: 'remove',
          id,
          // Resolve the promise after the effect cleanup of useDisturbers.
          // This is to ensure that the component is removed from the DOM before resolving the promise.
          onEffectCleanup: () => resolve(toResolve),
        });
      };
      bus.notify({
        type: 'add',
        disturber: {
          id,
          Component,
          props: {
            ...props,
            confirmWith: notifyRemove,
            cancel: () => notifyRemove(null),
            open: true,
          },
        },
      });
    });
  }
  return disturb as DisturbFn<T, P>;
};
