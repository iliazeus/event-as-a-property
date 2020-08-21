import assert from "assert";
import type { EventEmitter } from "events";

class  Event<TArgs extends any[] = []> {
  private readonly _emitter: EventEmitter;
  public readonly name: string | symbol;

  public constructor(emitter: EventEmitter, name: string | symbol = Symbol()) {
    this._emitter = emitter;
    this.name = name;
  }

  public emit(emitter: EventEmitter, ...args: TArgs): void {
    assert(emitter === this._emitter, "wrong EventEmitter");
    emitter.emit(this.name, ...args);
  }

  public addListener(listener: (...args: TArgs) => void): void {
    this._emitter.addListener(this.name, listener);
  }

  public on(listener: (...args: TArgs) => void): void {
    this._emitter.on(this.name, listener);
  }

  public once(listener: (...args: TArgs) => void): void {
    this._emitter.once(this.name, listener);
  }

  public removeListener(listener: (...args: TArgs) => void): void {
    this._emitter.removeListener(this.name, listener);
  }

  public off(listener: (...args: TArgs) => void): void {
    this._emitter.off(this.name, listener);
  }

  public removeAllListeners(): void {
    this._emitter.removeAllListeners(this.name);
  }

  public prependListener(listener: (...args: TArgs) => void): void {
    this._emitter.prependListener(this.name, listener);
  }

  public prependOnceListener(listener: (...args: TArgs) => void): void {
    this._emitter.prependOnceListener(this.name, listener);
  }

  public promise(): Promise<TArgs> {
    return new Promise((resolve) =>
      this._emitter.once(this.name, (...args) => resolve(args as any))
    );
  }
}

(Event as any).default = Event;
export = Event;
