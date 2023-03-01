// @ts-nocheck

import "jest";
import { Lifecycle } from "../src/lifecycle";

function whatIsMyName(myName: string) {
  return myName;
}

describe("Lifecycle class", () => {
  let lc: Lifecycle;

  beforeAll(async () => {
    lc = new Lifecycle({ name: 1 });
  });

  it("basic example", async () => {
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
  });

  it("get previous value", async () => {
    const plus = (amount) => (previousAmount) => previousAmount + amount;
    function minus(amount) {
      // to get parent access use function instead of an arrow function
      return this._.value - amount;
    }
    const amountPlus5 = lc
      .after(plus)
      .after(minus)
      .decorate(() => 5);
    expect(await amountPlus5(5)).toBe(5);
  });

  it("create cache decorator", async () => {
    const cacheStore = {};
    const config = { ttl: 10 };
    lc.setConfig(config);

    function addCache(...args) {
      const key = JSON.stringify(args);
      const { config, value } = this._;
      cacheStore[key] = { value, ttl: config.ttl };
    }

    function invalidateCache(...args) {
      const key = JSON.stringify(args);

      delete cacheStore[key];
    }

    function checkCache(...args) {
      const key = JSON.stringify(args);
      if (cacheStore[key]) {
        console.log("from cache");
        this.done = true;
        return cacheStore[key];
      }
    }

    class Todo {
      @lc.after(invalidateCache).decorate()
      create(title: string) {
        return title;
      }

      @lc.before(checkCache).after(addCache).decorate()
      get(title: string) {
        return title;
      }
    }

    const todo = new Todo();
    expect(await todo.get("hello")).toBe("hello");
    const key = JSON.stringify(["hello"]);
    expect(cacheStore[key]).toBeDefined();
    expect(cacheStore[key].value).toBe("hello");
  });

  it("exec for reusing the lc instance", async () => {
    // running decorate create a new instance and reset the current one, to reuse the same instance use exec
    function validate(name) {
      if (!name || (name && name.length < this._.config.name)) {
        throw new Error("name is missing");
      }
    }
    const addGreet = (name) => `Hi, ${name}`;
    const greet = lc.before(validate).after(addGreet).exec(whatIsMyName);
    const greet2 = lc.exec(whatIsMyName);
    const myName = "Nir";
    await greet(myName);
    expect(await greet(myName)).toBe(`Hi, ${myName}`);
    expect(await greet2(myName)).toBe(`Hi, ${myName}`);
  });
});
