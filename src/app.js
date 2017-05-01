import SocketIO from 'socket.io';
import express from 'express';
import http from 'http';

import Registry from './registry';
import Broker from './broker';

let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = process.env.PORT || 4815;

const registry = new Registry();
const broker = new Broker(registry);

broker.listen(io);

server.listen(port, () => {
    console.log(`BROKER: Up on port ${port}`);
});
