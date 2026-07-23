const mineflayer = require('mineflayer')
const express = require('express')

// --- WEB SERVER CHO RENDER HEALTH CHECK ---
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Bot Minecraft đang chạy 24/7!')
})

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`)
})

// --- CẤU HÌNH BOT ---
const config = {
  host: process.env.MC_HOST || 'minhducz.play.hosting',
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.MC_USERNAME || 'dot',
  password: process.env.MC_PASSWORD || 'DucMinh2026@',
  version: false, // Tự động phát hiện phiên bản
  autoLogin: true,
  autoRegister: false,
  reconnectDelay: 5000 // Tăng thời gian chờ kết nối lại lên 5 giây
}

function createBot() {
  console.log('Đang kết nối tới server Minecraft...')

  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version
  })

  let moveTimer

  bot.once('spawn', () => {
    console.log(`[+] Bot ${config.username} đã vào server thành công.`)

    if (config.autoRegister) {
      setTimeout(() => bot.chat(`/register ${config.password} ${config.password}`), 3000)
    }

    if (config.autoLogin) {
      setTimeout(() => bot.chat(`/login ${config.password}`), 3000)
    }

    // Cơ chế chống AFK
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
    }, 10000)
  })

  bot.on('death', () => {
    console.log('[!] Bot đã chết, đang hồi sinh...')
    setTimeout(() => bot.respawn(), 1000)
  })

  bot.on('kicked', (reason) => {
    console.log('[!] Bot bị kick khỏi server:', reason)
  })

  bot.on('error', (err) => {
    console.error('[X] Lỗi bot:', err)
  })

  function reconnect() {
    if (moveTimer) clearInterval(moveTimer)
    console.log(`[-] Kết nối lại sau ${config.reconnectDelay / 1000} giây...`)
    setTimeout(createBot, config.reconnectDelay)
  }

  bot.on('end', reconnect)
}

createBot()
