# functions lifecycle

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

check the tests folder for more examples.
