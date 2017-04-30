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
      this._enironmentsByName[name] = {};
    }
    this._environmentsByName[name][env.id] = env;
    this._environmentsById[env.id] = env;
    return env;
  }

  getAnyEnvironment (name) {
    const allIds = Object.keys(this._environmentsByName[name]);
    const id = Math.floor(Math.random * allIds.length);
    return this._environmentsByName[name][id];
  }

  getEnvironmentFor (locator) {
    const [name, id] = locator.split(':');
    if (id) {
      return this._environmentsByName[name][id];
    } else {
      return getAnyEnvironment(name);
    }
  }
}

class Broker {

}

const broker = new Broker();
const world = new World();

io.on('connection', (socket) => {
  const name = socket.handshake.query.name;
  const environment = world.registerEnvironment(name, socket);
  socket.emit('assignId', environment.id);

  socket.on('moveAction', (locator, action) => {
    nextEnvironment = world.getEnvironmentFor(action);
    nextEnvironment.emit('receiveAction', action);
  });
});
