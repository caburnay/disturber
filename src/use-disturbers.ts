import { useEffect, useState } from 'react';
import { bus, type Disturber } from './utils';

export const useDisturbers = () => {
  const [disturbers, setDisturbers] = useState<Disturber[]>([]);

  useEffect(() => {
    const onCleanup: (() => void)[] = [];
    const removeListener = bus.listen(message => {
      switch (message.type) {
        case 'add': {
          // remove the 'closed' disturbers that is the same as the new one
          setDisturbers(items => [
            ...items.filter(d =>
              message.disturber.Component === d.Component ? d.props.open : true,
            ),
            message.disturber,
          ]);
          break;
        }
        case 'remove': {
          // set the 'open' prop to false
          setDisturbers(items =>
            items.map(d => {
              return d.id === message.id
                ? { ...d, props: { ...d.props, open: false } }
                : d;
            }),
          );
          onCleanup.push(message.onEffectCleanup);
          break;
        }
        default: {
          throw new Error('Unknown message type');
        }
      }
    });
    return () => {
      removeListener();
      onCleanup.forEach(cb => cb());
    };
  });

  return disturbers;
};
