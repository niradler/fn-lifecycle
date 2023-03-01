# function lifecycle

Control the before and after of running a function, can be used for validation, caching, data mutation and more.

## Features

- Wraps functions to create a lifecycle of before and after
- Supports TypeScript
- Can be used for validation, caching, and more
- Easy to use and integrate into existing projects
- Provides a flexible and customizable solution for managing function lifecycles

## Usage

```sh
npm i fn-lifecycle
```

```ts
import { Lifecycle } from "fn-lifecycle";
const lc = new Lifecycle({ name: 1 });
function validate(name) {
  if (!name || (name && name.length < this._.config.name)) {
    throw new Error("name is missing");
  }
}
const addGreet = (name) => `Hi, ${name}`;
const greet = lc.before(validate).after(addGreet).decorate(whatIsMyName);
const myName = "Nir";
await greet(myName);
expect(await greet(myName)).toBe(`Hi, ${myName}`);
```

check the tests folder for more complete examples.

### Contributing

Contributions are always welcome! If you have any ideas or suggestions for how to improve this package, please feel free to open an issue or submit a pull request.
