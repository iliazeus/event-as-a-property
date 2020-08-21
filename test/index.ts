import assert from "assert";
import EventEmitter from "events";
import Event from "../src";

describe("class Event", () => {
  it("subscribes to events", () => {
    const emitter = new EventEmitter();
    const event = new Event<[data: string]>(emitter);

    event.addListener((data) => assert(data === "foobar"));
    event.emit(emitter, "foobar");
  });

  it("unsubscribes from events", () => {
    const emitter = new EventEmitter();
    const event = new Event<[]>(emitter);
    const listener = () => assert.fail();

    event.addListener(listener);
    event.removeListener(listener);
    event.emit(emitter);
  });

  it("subscribes to event once", () => {
    const emitter = new EventEmitter();
    const event = new Event<[data: string]>(emitter);

    event.once((data) => assert(data === "foobar"));
    event.emit(emitter, "foobar");
    event.emit(emitter, "abcde");
  });

  it("awaits an event", (done) => {
    const emitter = new EventEmitter();
    const event = new Event<[data: string]>(emitter);

    event.promise().then(([data]) => assert(data === "foobar")).then(done);
    event.emit(emitter, "foobar");
    event.emit(emitter, "abcde");
  });

  it("interoperates with EventEmitter", () => {
    const emitter = new EventEmitter();
    const event = new Event<[data: string]>(emitter, "event");

    event.addListener((data) => assert(data === "foobar"));
    emitter.emit("event", "foobar");
  });

  it("rejects wrong EventEmitters", () => {
    const emitter = new EventEmitter();
    const event = new Event<[]>(emitter);

    assert.throws(() => event.emit(new EventEmitter()));
  });
});
