const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. WEB SERVER DÙNG CHO UPTIMEROBOT & RENDER ---
const app = express();
const PORT = process.env.PORT || 8080;

let botStatus = 'Đang khởi động...';
let lastOnline = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bot dot Status</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #121212; color: #fff; text-align: center; padding: 50px; }
          .card { background: #1e1e1e; padding: 20px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
          .status { font-weight: bold; color: #4caf50; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🤖 Bot "dot" AFK Dashboard</h2>
          <p>Trạng thái: <span class="status">${botStatus}</span></p>
          <p>Lần cập nhật cuối: <strong>${lastOnline}</strong></p>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`[Web Server] Đang chạy tại port ${PORT}`);
});

// --- 2. CẤU HÌNH BOT "dot" ---
const BOT_CONFIG = {
  host: 'minhducz.play.hosting', // IP Server của Đức
  port: 25565,                   // Port server
  username: 'dot',               // Tên bot
  version: '26.1'             // Set đúng version 1.21.11
};

function createBot() {
  console.log('[Bot] Đang kết nối tới server Minecraft...');
  botStatus = 'Đang kết nối...';

  const bot = mineflayer.createBot(BOT_CONFIG);

  // 1. Tự động Chấp nhận Resource Pack
  bot.on('resourcePack', () => {
    console.log('[Bot] Đã nhận Resource Pack -> Tự động Accept!');
    bot.acceptResourcePack();
  });

  // 2. Khi vào game thành công & Xử lý AuthMe + Chống GrimAC Timeout
  bot.on('spawn', () => {
    console.log('[Bot dot] Đã vào game thành công!');
    botStatus = '🟢 Đang Online trong Server';
    lastOnline = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Tự động Login / Register AuthMe sau 2 giây
    setTimeout(() => {
      bot.chat('/login DucMinh2026@');
      bot.chat('/register DucMinh2026@ DucMinh2026@');
    }, 2000);

    // Chống GrimAC kick (Lắc đầu nhẹ mỗi 2 giây để gửi Packet Ticks liên tục)
    if (bot.grimInterval) clearInterval(bot.grimInterval);
    bot.grimInterval = setInterval(() => {
      if (bot && bot.entity) {
        const yaw = bot.entity.yaw + 0.1;
        const pitch = bot.entity.pitch;
        bot.look(yaw, pitch, true);
      }
    }, 2000);
  });

  // 3. AUTO RESPAWN (Tự động hồi sinh khi chết)
  bot.on('death', () => {
    console.log('[Bot dot] Đã bị ngỏm -> Đang tự động hồi sinh (Respawn)...');
    botStatus = '🟡 Đang tự động hồi sinh...';
    // Mineflayer tự hỗ trợ respawn mặc định nhưng ta có thể gọi lệnh dự phòng nếu cần
    setTimeout(() => {
      try {
        bot.respawn();
      } catch (e) {}
    }, 1000);
  });

  // 4. AUTO REJOIN (Kết nối lại sau 10s khi bị Kick/Disconnect/Limbo)
  bot.on('end', (reason) => {
    console.log(`[Bot dot] Mất kết nối: ${reason}. Đang đợi 10 giây để kết nối lại...`);
    botStatus = `🔴 Mất kết nối (${reason}) - Đang chờ 10s...`;
    
    // Xóa interval chống lag khi mất kết nối
    if (bot.grimInterval) clearInterval(bot.grimInterval);

    // Đợi đúng 10 giây (10000ms) rồi gọi lại hàm createBot
    setTimeout(createBot, 10000);
  });

  // 5. Xử lý lỗi hệ thống
  bot.on('error', (err) => {
    console.error('[Bot Error]:', err.message);
    botStatus = `⚠️ Lỗi: ${err.message}`;
  });
}

// Khởi chạy bot
createBot();
