A strongly typed event-as-a-property wrapper for Node's `EventEmitter`.

## Synopsis

All methods delegate to the `EventEmitter` passed in the constructor.
Their semantics are identical, except the event name is implicit, and the return type is `void`.

```ts
export default class Event<TListener extends (...args: any[]) => void> {
  readonly name: string | symbol;

  constructor(emitter: EventEmitter, name?: string | symbol = Symbol()) {}

  /** has to be the same `EventEmitter` from which it was constructed */
  emit(emitter: EventEmitter, ...args: Parameters<TListener>): void;

  addListener(listener: TListener): void;
  on(listener: TListener): void;

  once(listener: TListener): void;

  removeListener(listener: TListener): void;
  off(listener: TListener): void;

  removeAllListeners(): void;

  prependListener(listener: TListener): void;
  prependOnceListener(listener: TListener): void;

  promise(): Promise<Parameters<TListener>>;
}
```

## Usage

```ts
import { EventEmitter } from "events";
import Event from "event-as-a-property";

class Publisher {
  /** create an `EventEmitter` for the event source */
  private _emitter = new EventEmitter();

  /** declare the event as a property on the event source */
  onPublish = new Event<(date: Date, text: string) => void>(this.emitter);

  publish(date: Date, text: string): void {
    /** emit the event using the `EventEmitter` */
    this.emitter.emit(this.onPublish.name, date, text);

    /** or use a typed wrapper */
    this.onPublish.emit(this._emitter, date, text);
  }
}

const publisher = new Publisher();

/** subscribe to an event using the event propery */
publisher.onPublish.addListener((date, text) => console.log(date, text));

/** or add a listener that fires only once */
publisher.onPublish.once((date, text) => console.log(date, text));

/** or await the next event */
const [date, text] = await publisher.onPublish.promise();
```

## Why?

### self-documenting code

```ts
/**
 * What events does `Bad` have?
 * You need to either document it textually,
 * or provide _seven_ method overloads per event.
 */
interface Bad extends EventEmitter {
  addListener(event: "exit", listener: (status: number) => void): void;
  on(event: "exit", listener: (status: number) => void): void;
  once(event: "exit", listener: (status: number) => void): void;
  prependListener(event: "exit", listener: (status: number) => void): void;
  prependOnceListener(event: "exit", listener: (status: number) => void): void;
  removeListener(event: "exit", listener: (status: number) => void): void;
  off(event: "exit", listener: (status: number) => void): void;
}

/**
 * `Good` has an `exit` event with a `status` parameter.
 */
interface Good {
  readonly exit: Event<(status: number) => void>;
}
```

### separation of concerns

```ts
/**
 * Why should clients be able to emit events?
 */
let bad: Bad;
/* ... */
bad.addListener("exit", console.log);
bad.emit("exit", 0);

/**
 * Have to have the right EventEmitter to emit events.
 */
let good: Good;
/* ... */
good.exit.addListener(console.log);
good.exit.emit(new EventEmitter(), 0); // error: wrong EventEmitter
```

### easy to navigate and refactor

```ts
/**
 * To rename the event, you have to somehow find all subscribers
 * and change the `"exit"` literal in each of them
 */
let bad: Bad;
/* ... */
bad.addListener("exit", console.log);

/**
 * To rename the event, you just have to rename the property with an IDE.
 * To find subscribers, you can just `Find All Usages` with an IDE.
 */
let good: Good;
/* ... */
good.exit.addListener(console.log);
```

### easier to use with documentation generators

```ts
/**
 * You can use JSDoc.
 * @event exit
 */
interface Bad extends EventEmitter {
  /**
   * Whoops! Event has been renamed, but the docs are not updated.
   */
  addListener(event: "stop", listener: (status: number) => void): void;
}

interface Good {
  /**
   * Event docs are inseparable from the event property.
   */
  readonly exit: Event<(status: number) => void>;
}
```

### easy to migrate from `EventEmitter`

```ts
/**
 * @event start
 * @event exit
 */
class Bad extends EventEmitter {
  /* ... */
}

/**
 * First, add the event properties.
 * Then, deprecate the methods inherited from `EventEmitter`
 */
class Better extends EventEmitter {
  readonly start = new Event<() => void>(this, "start");
  readonly exit = new Event<(status: number) => void>(this, "exit");
}

/**
 * Finally, move `EventEmitter` to an implementation detail.
 */
class Best {
  private readonly _emitter = new EventEmitter();

  readonly start = new Event<() => void>(this._emitter);
  readonly exit = new Event<(status: number) => void>(this._emitter);
}
```
