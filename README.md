# disturb

Separate the modals from the main markup of your app.

## Getting started

### Install

```sh
$ npm install disturb
```

### Render `Disturbers`

This is the controller of the "disturbers" that will be displayed.

```tsx
// layout.tsx
import { Disturbers } from 'disturb';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
      <Disturbers /> {/* <-- HERE */}
    </html>
  )
}
```

### Create a disturber

In this example, we're creating a confirm disturber with customizable message,
and confirm and cancel labels.

```tsx
// disturbers/confirm.tsx
import { createDisturber } from 'disturb';

export const confirm = createDisturber<
  boolean,
  {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }
>(function ConfirmModal({
  confirmWith,
  cancel,
  open,
  message,
  confirmLabel,
  cancelLabel,
}) {
  confirmLabel = confirmLabel ?? 'Confirm';
  cancelLabel = cancelLabel ?? 'Cancel';
  return (
    <div>
      <div>
        <span>{message}</span>
      </div>
      <div>
        <button onClick={() => confirmWith(false)}>{cancelLabel}</button>
        <button onClick={() => confirmWith(true)}>{confirmLabel}</button>
      </div>
    </div>
  );
});
```

### Use the disturber

```tsx
// counter.tsx
import { confirm } from './disturbers/confirm';

export function Counter() {
  const [count, setCount] = useState(0);
  const onclick = async () => {
    if (await confirm({
      message: 'What do you want?',
      confirmLabel: 'inc',
      cancelLabel: 'dec'
    })) {
      setCount(count + 1);
    } else {
      setCount(count - 1);
    }
  }
  return (
    <button onClick={onclick}>Count: {count}</button>
  )
}
```

## Motivation

The modals used to ask users for confirmation or information are normally
declared in the markup of the page. This however just *pollutes* the markup. And
if we think about it, modals can actually be part of the *logic*, not markup. In
fact, I would argue that it's more ergonomic to see the use of modal in the
action handlers such as on clicking a button.

Consider the following example. It's a button that shows a number, such that
when clicked, the user is asked if he wants to increment the number, it will be
decremented otherwise.

```tsx
import { confirm } from './dialogs/confirm';

export function Counter({ start }: { start: number }) {
  const [count, setCount] = useState(start);

  const onClick = async () => {
    if (await confirm({ message: 'increment?' })) {
      setCount(count + 1);
    } else {
      setCount(count - 1);
    }
  };

  return <Button onClick={onClick}>{count}</Button>;
}
```

![Screen Recording](https://github.com/caburnay/disturber/assets/3245568/e0ce4027-7aee-4c5c-bcbc-1b15b6a167f8)

Notice that the markup of the listed component above doesn't know about the
modal, it's just showing the button with the current value of the number. Yet,
when interacting with the button, a modal will be shown confirming the action of
the user. You can see this modal-interaction feature in the click handler logic.

The goal of this library is to allow this pattern where modals (aka disturbers)
are part of action logic. As a result, we came up with the following 2 objects -
`Disturbers` and `createDisturber`.

- `Disturbers` is a component that is rendered in the root component. It
  contains the rendered disturbers.
- `createDisturber` is a function that takes a function component and returns a
  disturber. To formally define the term, disturber is a function that takes
  props to render its modal and it returns a promise that resolves to the
  response of the user. The function component receives additional props to
  properly define the behavior of the disturber.
  - Additional props:
    - `confirmWith` - is a function that when called with a value which becomes
      the user's response, then the modal closes.
    - `cancel` - is a function that requires no argument and when called, it
      closes the modal. The user's response is `null` in this case.
    - `open` - if true, then the disturber's modal is open.
    - `atTop` - if true, then the disturber's modal is over all other modals.

The `confirm` disturber in the above code example can be defined like so:

```tsx
import { createDisturber } from 'disturb';

export const confirm = createDisturber<boolean, { message: string }>(
  function ConfirmDialog({ confirmWith, cancel, open, message }) {
    return (
      <Dialog
        open={open}
        onOpenChange={open => {
          return !open && cancel();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => confirmWith(false)}>No</Button>
            <Button onClick={() => confirmWith(true)}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
```
