interface FacadeOptions {
  key?: () => any;
}

/**
 * Create a static-like interface to an object, most useful with AsyncLocalStorage wrapper such as getRequestEvent
 * @see https://laravel.com/docs/12.x/facades
 * we should add some DI container and a bit of TypeORM, boom, we got laravel
 */
export function createFacade<T extends object>(getInstance: () => T, options?: FacadeOptions): T {
  let instance: T;
  let key: any = Symbol("no");

  function get() {
    if (options?.key) {
      const newKey = options?.key();
      if (newKey === key) {
        return instance;
      }
      key = newKey;
    }
    instance = getInstance();
    return instance;
  }

  return new Proxy({}, {
    getOwnPropertyDescriptor(target, p) {
      return Reflect.getOwnPropertyDescriptor(get(), p);
    },
    defineProperty(target, property, attributes) {
      return Reflect.defineProperty(get(), property, attributes);
    },
    has(target, p) {
      return Reflect.has(get(), p);
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(get());
    },
    get(target, p) {
      return Reflect.get(get(), p);
    },
    set(target, p, newValue) {
      return Reflect.set(get(), p, newValue);
    },
    deleteProperty(target, p) {
      return Reflect.deleteProperty(get(), p);
    },
    ownKeys(target) {
      return Reflect.ownKeys(get());
    },
    
  }) as T;
}
