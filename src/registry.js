import Environment from './Environment';

export default class Registry {
  constructor () {
    this._environmentsByName = {};
  }

  registerEnvironment (name, connection) {
    const env = new Environment(name, connection);
    if (this._environmentsByName[name] === undefined) {
      this._environmentsByName[name] = {};
    }
    this._environmentsByName[name][env.id] = env;
    return env;
  }

  unregisterEnvironment (name, id) {
    delete this._environmentsByName[name][id];
  }

  getAnyEnvironment (name) {
    if (!(this._environmentsByName[name])) {
      return null;
    }
    const allIds = Object.keys(this._environmentsByName[name]);
    if (allIds.length == 0) {
      return null;
    }
    const id = allIds[Math.floor(Math.random() * allIds.length)];
    return this._environmentsByName[name][id];
  }

  getEnvironment (name, id) {
    if (id) {
      return this._environmentsByName[name][id];
    } else {
      return this.getAnyEnvironment(name);
    }
  }

  getEnvironmentAsync (locator) {
    const [name, id] = locator.split(':');
    return new Promise((resolve, reject) => {
      let retry = () => {
        let environment = this.getEnvironment(name, id);
        if (environment !== null) {
          resolve(environment);
        } else {
          setTimeout(retry, 500);
        };
      }
      retry();
    });
  }
}
