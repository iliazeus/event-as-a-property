import assert from "assert";
import type { EventEmitter } from "events";

export default class Event<TListener extends (...args: any[]) => void> {
  private readonly _emitter: EventEmitter;
  public readonly name: string | symbol;

  public constructor(emitter: EventEmitter, name: string | symbol = Symbol()) {
    this._emitter = emitter;
    this.name = name;
  }

  public emit(emitter: EventEmitter, ...args: Parameters<TListener>): void {
    assert(emitter === this._emitter, "wrong EventEmitter");
    emitter.emit(this.name, ...args);
  }

  public addListener(listener: TListener): void {
    this._emitter.addListener(this.name, listener);
  }

  public on(listener: TListener): void {
    this._emitter.on(this.name, listener);
  }

  public once(listener: TListener): void {
    this._emitter.once(this.name, listener);
  }

  public removeListener(listener: TListener): void {
    this._emitter.removeListener(this.name, listener);
  }

  public off(listener: TListener): void {
    this._emitter.off(this.name, listener);
  }

  public removeAllListeners(): void {
    this._emitter.removeAllListeners(this.name);
  }

  public prependListener(listener: TListener): void {
    this._emitter.prependListener(this.name, listener);
  }

  public prependOnceListener(listener: TListener): void {
    this._emitter.prependOnceListener(this.name, listener);
  }

  public promise(): Promise<Parameters<TListener>> {
    return new Promise((resolve) =>
      this._emitter.once(this.name, (...args) => resolve(args as any))
    );
  }
}
