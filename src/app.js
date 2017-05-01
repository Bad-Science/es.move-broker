import SocketIO from 'socket.io';
import express from 'express';
import http from 'http';

import Environment from './environment';

let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = process.env.PORT || 3000;
let users = [];
let sockets = {};

class World {
  constructor () {
    this._environmentsByName = {};
    this._environmentsById = {};
  }

  registerEnvironment (name, connection) {
    const env = new Environment(name, connection);
    if (this._environmentsByName[name] === undefined) {
      this._environmentsByName[name] = {};
    }
    this._environmentsByName[name][env.id] = env;
    this._environmentsById[env.id] = env;
    return env;
  }

  unregisterEnvironment (name, id) {
    delete this._environmentsByName[name][id];
    delete this._environmentsById[id];
  }

  getAnyEnvironment (name) {
    const allIds = Object.keys(this._environmentsByName[name]);
    // console.log(allIds);
    const id = allIds[Math.floor(Math.random() * allIds.length)];
    // console.log(this._environmentsByName);
    // console.log(id);
    // console.log(this._environmentsByName[name][id]);
    return this._environmentsByName[name][id];
  }

  getEnvironmentFor (locator) {
    const [name, id] = locator.split(':');
    if (id) {
      return this._environmentsByName[name][id];
    } else {
      return this.getAnyEnvironment(name);
    }
  }
}

class Broker {

}

const broker = new Broker();
const world = new World();

io.on('connection', (socket) => {
  const name = socket.handshake.query.name;
  console.log(`BROKER: Registering new Envrionemt with name: ${name}`);
  const environment = world.registerEnvironment(name, socket);
  socket.emit('environment_register', environment.id);

  socket.on('agent_move', (locator, action) => {
    const nextEnvironment = world.getEnvironmentFor(locator);
    nextEnvironment.connection.emit('agent_move', action);
  });

  socket.on('agent_away', (locator, action, callback) => {
    const nextEnvironment = world.getEnvironmentFor(locator);
    nextEnvironment.connection.emit('agent_away', action, function (response) {
      callback(response);
    });
  });

  socket.on('disconnect', () => {
    world.unregisterEnvironment(name, environment.id);
  });
});

server.listen(port, () => {
    console.log(`BROKER: Listening on port ${port}`);
});
