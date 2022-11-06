// Current implementation taken from example:
//  https://github.com/Koenkk/zigbee-herdsman/blob/master/examples/join-and-log.js
const { Controller } = require('zigbee-herdsman')

const SERIAL = '/dev/ttyACM0'
const DB = './devices.db'

const coordinator = new Controller({
  serialPort: { path: SERIAL },
  databasePath: DB
})

function switchLight(ieeeAddr, state) {
  const lightSwitch = coordinator.getDeviceByIeeeAddr(ieeeAddr)
  console.log('Light Switch: ' + JSON.stringify(lightSwitch))

  const endpoint = lightSwitch.getEndpoint(1)
  console.log('Light Switch endpoint: ' + JSON.stringify(endpoint))

  if (state) {
    endpoint.command(6, 1)
  } else {
    endpoint.command(6, 0)
  }
}

var state = false
setInterval(function() { switchLight('0xa4c1389f36bcf406', state); state = !state }, 4000)

coordinator.on('message', async (msg) => {
  console.log(msg)
})

coordinator
  .start((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
  .then(async () => {
    console.log('started with device', SERIAL)
    coordinator.permitJoin(600, (err) => {
      if (err) {
        console.error(err)
      }
    })
  })

