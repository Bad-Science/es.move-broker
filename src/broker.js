import Registry from './registry';

export default class Broker {
  constructor (registry) {
    this.registry = registry;
  }

  listen (io) {
    io.on('connection', (socket) => {
      const name = socket.handshake.query.name;
      console.log(`BROKER: Registering new Envrionemt with name: ${name}`);
      const environment = this.registry.registerEnvironment(name, socket);
      socket.emit('environment_register', environment.id);

      socket.on('agent_move', (locator, action) => {
        this.registry.getEnvironmentAsync(locator).then((destination) => {
          destination.connection.emit('agent_move', action);
        });
      });

      socket.on('agent_away', (locator, action, callback) => {
        this.registry.getEnvironmentAsync(locator).then((destination) => {
          destination.connection.emit('agent_away', action, function (response) {
            callback(response);
          });
        });
      });

      socket.on('disconnect', () => {
        this.registry.unregisterEnvironment(name, environment.id);
      });
    });
  }
}