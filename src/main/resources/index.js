// Current implementation taken from example:
//  https://github.com/Koenkk/zigbee-herdsman/blob/master/examples/join-and-log.js
const { Controller } = require('zigbee-herdsman');
const express = require('express');
const fs = require('fs');

const SERIAL = '/dev/ttyACM0';
const DB = './devices.db';
const PORT = 8080;

process.on('uncaughtException', function (err) {
  console.error('Recovering from uncaught exception', err);
});

const coordinator = new Controller({
  serialPort: { path: SERIAL },
  databasePath: DB
});

coordinator.on('message', async (msg) => {
  console.log(`type ${msg.type}; devID ${msg.device.ID}; endpointID ${msg.endpoint.ID}; profileID ${msg.endpoint.profileID}; groupID ${msg.groupID}; cluster ${msg.groupID}; linkquality ${msg.linkquality}; data ${msg.data.toString('hex')}`);
});

coordinator.start()
  .then(async () => {
    console.log('started with device', SERIAL);
    coordinator.permitJoin(600, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });

function getDatabaseContent() {
  const rawJsonlDb = fs.readFileSync(DB, 'utf8');
  const parsedJsonlDb = rawJsonlDb.split('\n').map(line => JSON.parse(line));
  const prettyJsonDb = JSON.stringify(parsedJsonlDb, null, 4);

  return prettyJsonDb;
}

function wrapContentInPreWrap(content) {
  return `<html><body style="white-space: pre-wrap;">${content}</body></html>`;
}

const app = express();

app.get('/', function (req, res) {
  res.send(wrapContentInPreWrap(getDatabaseContent()));
});

app.get('/devices/:ieeeAddr/endpoints/:endpoint/clusters/:clusterKey/attributes/:attributes', function (req, res) {
  const ieeeAddr = req.params.ieeeAddr;
  const endpoint = parseInt(req.params.endpoint)
  const clusterKey = parseInt(req.params.clusterKey)
  const attributes = JSON.parse(req.params.attributes);

  const endpoint = coordinator
    .getDeviceByIeeeAddr(ieeeAddr)
    .getEndpoint(endpoint);

  if (Array.isArray(attributes)) {
    endpoint.read(clusterKey, attributes);
  } else if (typeof attributes === 'number') {
    endpoint.read(clusterKey, [ attributes ]);
  } else {
    endpoint.write(clusterKey, attributes);
  }

  res.send(wrapContentInPreWrap(getDatabaseContent()));
});

app.get('/devices/:ieeeAddr/endpoints/:endpoint/clusters/:clusterKey/commands/:commandKey', function (req, res) {
  const ieeeAddr = req.params.ieeeAddr;
  const endpoint = parseInt(req.params.endpoint)
  const clusterKey = parseInt(req.params.clusterKey)
  const commandKey = parseInt(req.params.commandKey)
  const payload = JSON.parse(req.query.payload);

  coordinator
    .getDeviceByIeeeAddr(ieeeAddr)
    .getEndpoint(endpoint)
    .command(clusterKey, commandKey, payload);

  res.send(wrapContentInPreWrap(getDatabaseContent()));
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
