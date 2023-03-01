// @ts-nocheck

import "jest";
import { Lifecycle } from "../src/lifecycle";

function whatIsMyName(myName: string) {
  return myName;
}

describe("Lifecycle class", () => {
  let lc: Lifecycle;

  beforeAll(async () => {
    lc = new Lifecycle({ name: "config" });
  });

  it("exec reuse lc", async () => {
    const validate = (name) => {
      if (!name) throw new Error("name is missing");
    };
    const addGreet = (name) => `Hi, ${name}`;
    const greet = lc.before(validate).after(addGreet).exec(whatIsMyName);
    const greet2 = lc.exec(whatIsMyName);
    const myName = "Nir";
    expect(await greet2(myName)).toBe(`Hi, ${myName}`);
  });

  it("decorate a function", async () => {
    const validate = (name) => {
      if (!name) throw new Error("name is missing");
    };
    const addGreet = (name) => `Hi, ${name}`;
    const greet = lc.before(validate).after(addGreet).decorate(whatIsMyName);
    const myName = "Nir";
    try {
      await greet();
    } catch (error) {
      expect(error).toBeDefined();
    }
    expect(await greet(myName)).toBe(`Hi, ${myName}`);
  });

  it("class function decorator", async () => {
    const cacheStore = {};
    function checkCache(s) {
      if (cacheStore[s]) {
        console.log("from cache");
        this.done = true;
        return cacheStore[s];
      }
    }

    function addCache(s) {
      cacheStore[s] = this._.value;
    }

    const cache = lc.before(checkCache).after(addCache);

    class Test {
      config: object;
      constructor() {
        this.config = { name: "test" };
      }
      log(s: string) {
        console.log("getGreet running", s, this._.config);
      }

      @cache.decorate()
      async getGreet(s: string) {
        this.log(s);
        return `Getting ${s}`;
      }
    }

    const test = new Test();
    await test.getGreet("key");
    expect(cacheStore["key"]).toBe(`Getting key`);
    expect(await test.getGreet("key")).toBe(`Getting key`);
  });
});
