interface Cycles {
  beforeCallbacks: Function[];
  afterCallbacks: Function[];
}

export class Lifecycle {
  config: unknown;
  cycles!: Cycles;

  constructor(config?: unknown) {
    this.setConfig(config);
    this.setCycles({});
  }

  setConfig(config?: unknown) {
    this.config = config;
  }

  setCycles(cycles: Cycles | object = {}) {
    this.cycles = {
      beforeCallbacks: [],
      afterCallbacks: [],
      ...cycles,
    };
  }

  before(callback: Function) {
    this.cycles.beforeCallbacks.push(callback);
    return this;
  }

  after(callback: Function) {
    this.cycles.afterCallbacks.push(callback);
    return this;
  }

  inject(callback: Function) {
    return callback(this);
  }

  mutate(oldValue: unknown, newValue: unknown) {
    if (newValue === undefined) return oldValue;

    if (typeof newValue === "function") {
      return newValue(oldValue);
    }

    return newValue;
  }

  *getNextCB(cb: Function, self: Lifecycle) {
    for (const callback of [
      ...self.cycles.beforeCallbacks,
      cb,
      ...self.cycles.afterCallbacks,
    ]) {
      yield callback;
    }

    return;
  }

  exec<R>(cb: Function, value: unknown = undefined) {
    const self = this;
    return async function (...args: unknown[]): Promise<R> {
      // @ts-ignore
      const ctx = this || {};

      const callbacks = self.getNextCB(cb, self);
      let nextCB = callbacks.next();
      while (nextCB.done !== true && nextCB.value && ctx.done !== true) {
        ctx.previousValue = value;
        ctx.config = self.config;
        value = await self.mutate(value, nextCB.value.apply(ctx, [...args]));

        nextCB = callbacks.next();
      }
      // @ts-ignore
      return value;
    };
  }

  decorate<R>(callback?: Function) {
    const instance = new Lifecycle(this.config);
    instance.setCycles(this.cycles);
    this.setCycles({});

    if (callback) return instance.exec(callback);

    return function decorator(
      target: unknown,
      key: string,
      descriptor: PropertyDescriptor
    ) {
      callback = descriptor.value;
      descriptor.value = instance.exec<R>(callback as Function);
    };
  }
}

export default Lifecycle;
