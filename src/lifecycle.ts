interface Cycles {
  beforeCallbacks: Function[];
  afterCallbacks: Function[];
}

export class Lifecycle {
  _config: unknown;
  _cycles!: Cycles;

  constructor(config?: unknown) {
    this._config = config;
    this.setCycles({});
  }

  setCycles(_cycles: Cycles | object = {}) {
    this._cycles = {
      beforeCallbacks: [],
      afterCallbacks: [],
      ..._cycles,
    };
  }

  // listener(obj: object) {
  //   return new Proxy(obj, {
  //     get(target: unknown, prop: string) {
  //       // @ts-ignore
  //       return target[prop];
  //     },
  //   });
  // }

  before(callback: Function) {
    this._cycles.beforeCallbacks.push(callback);
    return this;
  }

  after(callback: Function) {
    this._cycles.afterCallbacks.push(callback);
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

  *getNextCB(type: string, self: Lifecycle) {
    switch (type) {
      case "before":
        for (const cb of self._cycles.beforeCallbacks) {
          yield cb;
        }
        break;

      case "after":
        for (const cb of self._cycles.afterCallbacks) {
          yield cb;
        }
        break;
    }

    return;
  }

  exec(cb: Function) {
    const self = this;
    return async function (...args: unknown[]) {
      // @ts-ignore
      const ctx = this;
      let value;

      const beforeCallbacks = self.getNextCB("before", self);
      let nextCB = beforeCallbacks.next();
      while (nextCB.done !== true && nextCB.value) {
        value = await self.mutate(value, nextCB.value.apply(ctx, [...args]));
        nextCB = beforeCallbacks.next();
      }

      value = await cb.apply(ctx, args);

      const afterCallbacks = self.getNextCB("after", self);
      nextCB = afterCallbacks.next();
      while (nextCB.done !== true && nextCB.value) {
        value = await self.mutate(value, nextCB.value.apply(ctx, [...args]));
        nextCB = afterCallbacks.next();
      }

      return value;
    };
  }

  decorate(callback?: Function) {
    const instance = new Lifecycle(this._config);
    instance.setCycles(this._cycles);
    this.setCycles({});

    if (callback) return instance.exec(callback);

    return function decorator(
      target: unknown,
      key: string,
      descriptor: PropertyDescriptor
    ) {
      callback = descriptor.value;
      descriptor.value = instance.exec(callback as Function);
    };
  }
}

export default Lifecycle;
