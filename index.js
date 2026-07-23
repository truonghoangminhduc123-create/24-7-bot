const mineflayer = require('mineflayer')

const config = {
  host: 'minhducz.play.hosting',
  port: 25565,
  username: 'dot',

  version: false,

  password: 'DucMinh2026@',

  autoLogin: true,
  autoRegister: false,

  reconnectDelay: 2000
}

function createBot() {

  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version
  })

  let moveTimer

  bot.once('spawn', () => {
    console.log('Joined server.')

    if (config.autoRegister)
      setTimeout(() => bot.chat(`/register ${config.password} ${config.password}`), 3000)

    if (config.autoLogin)
      setTimeout(() => bot.chat(`/login ${config.password}`), 3000)

    moveTimer = setInterval(() => {

      const forward = Math.random() > 0.5
      const left = Math.random() > 0.5
      const jump = Math.random() > 0.7

      bot.setControlState('forward', forward)
      bot.setControlState('left', left)
      bot.setControlState('jump', jump)

      setTimeout(() => {
        bot.clearControlStates()
      }, 2500)

    }, 7000)

  })

  bot.on('death', () => {
    console.log('Respawning...')
    setTimeout(() => bot.respawn(), 1000)
  })

  bot.on('kicked', console.log)

  bot.on('error', console.log)

  function reconnect() {
    clearInterval(moveTimer)
    console.log('Reconnect in 2 seconds...')
    setTimeout(createBot, config.reconnectDelay)
  }

  bot.on('end', reconnect)
}

createBot()
