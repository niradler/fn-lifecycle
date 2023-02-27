# function lifecycle

```ts
import { Lifecycle } from "fn-lifecycle";

const lc = new Lifecycle();

function whatIsMyName(myName: string) {
  return myName;
}

const validate = (name) => {
  if (!name) throw new Error("name is missing");
};

const addGreet = (name) => `Hi, ${name}`;

const greet = lc.before(validate).after(addGreet).decorate(whatIsMyName);

const myName = "Nir";

await greet(myName); // Hi, Nir
```

```ts
import { Lifecycle } from "fn-lifecycle";

const lc = new Lifecycle();

const cacheStore = {};
const checkCache = (s) => {
  if (cacheStore[s]) return cacheStore[s];
};

const addCache = (s) => (value) => {
  cacheStore[s] = value;
  return value;
};

const cache = lc.before(checkCache).after(addCache);

class Test {
  @cache.decorate()
  getGreet(s: string) {
    return `Getting ${s}`;
  }
}

const test = new Test();
await test.getGreet("key");
```

check the tests folder for more examples.
