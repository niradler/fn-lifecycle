# function lifecycle

Control the before and after of running a function, can be used for validation, caching, data mutation and more.

## Usage

Basic:

```ts
const validate = (name) => {
  if (!name) throw new Error("name is missing");
};
const addGreet = (name) => `Hi, ${name}`;
const greet = lc.before(validate).after(addGreet).decorate(whatIsMyName);
const myName = "Nir";
await greet(myName);
```

Advance:

```ts
import { Lifecycle } from "fn-lifecycle";

const lc = new Lifecycle();

const plus = (amount) => (previousAmount) => previousAmount + amount; // or use function plus(amount){return this.previousValue + amount}

const amountPlus5 = lc.after(plus).decorate(() => 5);

await amountPlus5(5); // 10
```

```ts
import { Lifecycle } from "fn-lifecycle";

const config = { ttl: 10 };

const lc = new Lifecycle(config);

function addCache(...args) {
  const key = JSON.stringify(args);
  Cache.set(key, this.previousValue, this.config.ttl);
}

class Todo {
  @lc.after(invalidateCache).decorate()
  create() {}

  @lc.before(checkCache).after(addCache).decorate()
  get() {}
}
```

```ts
// running decorate create a new instance and reset the current one, to reuse the same instance
const validate = (name) => {
  if (!name) throw new Error("name is missing");
};
const addGreet = (name) => `Hi, ${name}`;
const greet = lc.before(validate).after(addGreet).exec(whatIsMyName);
const greet2 = lc.exec(whatIsMyLastName); // same before and after
const myName = "Nir";
await greet(myName);
```

check the tests folder for more complete examples.
