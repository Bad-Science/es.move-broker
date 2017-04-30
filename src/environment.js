let nextId = 1;

class Environment {
  constructor(name, connection) {
    this.name = name;
    this.id = nextId++;
    this.connection = connection;
  }
}

export default Environment;