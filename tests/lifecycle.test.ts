// @ts-nocheck

import "jest";
import { Lifecycle } from "../src/lifecycle";

function whatIsMyName(myName: string) {
  return myName;
}

describe("Lifecycle class", () => {
  let lc: Lifecycle;

  beforeAll(async () => {
    lc = new Lifecycle();
  });

  it("decorate a function", async () => {
    const validate = (name) => {
      if (!name) throw new Error("name is missing");
    };
    const addGreet = (name) => `Hi, ${name}`;
    const greet = lc.before(validate).after(addGreet).decorate(whatIsMyName);
    const myName = "Nir";
    expect(await greet(myName)).toBe(`Hi, ${myName}`);
  });

  it("class function decorator", async () => {
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
    expect(cacheStore["key"]).toBe(`Getting key`);
  });
});
