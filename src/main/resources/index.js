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

try {
  coordinator.start()
    .then(async () => {
      console.log('started with device', SERIAL);
      coordinator.permitJoin(600, (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
} catch (error) {
  console.error(`Failure happened on coordinator start`, error)
}

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

app.get('/device/:ieeeAddr/endpoint/:endpoint/cluster/:clusterKey/attribute/:attributeId', function (req, res) {
  const ieeeAddr = req.params.ieeeAddr;
  const endpoint = parseInt(req.params.endpoint)
  const clusterKey = parseInt(req.params.clusterKey)
  const attributes = [ parseInt(req.params.attributeId) ];

  try {
    coordinator
      .getDeviceByIeeeAddr(ieeeAddr)
      .getEndpoint(endpoint)
      .read(clusterKey, attributes);
  } catch(error) {
    console.error(`Failed to write attribute`, error);
  }

  res.send(wrapContentInPreWrap(getDatabaseContent()));
});

app.get('/device/:ieeeAddr/endpoint/:endpoint/cluster/:clusterKey/attribute/:attributeId/value/:attributeValue', function (req, res) {
  const ieeeAddr = req.params.ieeeAddr;
  const endpoint = parseInt(req.params.endpoint)
  const clusterKey = parseInt(req.params.clusterKey)
  const attributeId = parseInt(req.params.attributeId)
  const attributes = {};
  attributes[attributeId] = parseInt(req.params.attributeValue);

  try {
    coordinator
      .getDeviceByIeeeAddr(ieeeAddr)
      .getEndpoint(endpoint)
      .write(clusterKey, attributes);
  } catch(error) {
    console.error(`Failed to write attribute`, error);
  }

  res.send(wrapContentInPreWrap(getDatabaseContent()));
});

app.get('/device/:ieeeAddr/endpoint/:endpoint/cluster/:clusterKey/command/:commandKey', function (req, res) {
  const ieeeAddr = req.params.ieeeAddr;
  const endpoint = parseInt(req.params.endpoint)
  const clusterKey = parseInt(req.params.clusterKey)
  const commandKey = parseInt(req.params.commandKey)
  const payload = JSON.parse(req.query.payload);

  try {
    coordinator
      .getDeviceByIeeeAddr(ieeeAddr)
      .getEndpoint(endpoint)
      .command(clusterKey, commandKey, payload);
  } catch(error) {
    console.error(`Failed to send command`, error);
  }

  res.send(wrapContentInPreWrap(getDatabaseContent()));
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
