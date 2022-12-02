// Current implementation taken from example:
//  https://github.com/Koenkk/zigbee-herdsman/blob/master/examples/join-and-log.js
const { Controller } = require('zigbee-herdsman')

const SERIAL = '/dev/ttyACM0'
const DB = './devices.db'

const coordinator = new Controller({
  serialPort: { path: SERIAL },
  databasePath: DB
})

coordinator.on('message', async (msg) => {
  console.log(`type ${msg.type}; devID ${msg.device.ID}; endpointID ${msg.endpoint.ID}; profileID ${msg.endpoint.profileID}; groupID ${msg.groupID}; cluster ${msg.groupID}; linkquality ${msg.linkquality}; data ${msg.data.toString('hex')}`)
})

coordinator.start()
  .then(async () => {
    console.log('started with device', SERIAL)
    coordinator.permitJoin(600, (err) => {
      if (err) {
        console.error(err)
      }
    })
  })

