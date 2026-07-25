const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. KHỞI TẠO WEB SERVER (Để Render không bị Kill & UptimeRobot Ping) ---
const app = express();
const PORT = process.env.PORT || 3000;

let botStatus = 'Đang khởi động...';
let lastOnline = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AFK Bot Status</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #121212; color: #fff; text-align: center; padding: 50px; }
          .card { background: #1e1e1e; padding: 20px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
          .status { font-weight: bold; color: #4caf50; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🤖 Minecraft AFK Bot Dashboard</h2>
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

// --- 2. CẤU HÌNH BOT MINEFLAYER ---
const BOT_CONFIG = {
  host: 'minhducz.play.hosting', // IP/Domain server của Đức
  port: 25565,                   // Port server (thay nếu có port riêng)
  username: 'AFK_Bot_Duc',        // Tên bot trong game
  // password: 'DucMinh2026@',   // Nếu là server Premium (Online-mode) thì mở comment dòng này
  version: '1.21.1'              // Khuyên dùng 1.21.1 để kết nối ổn định tới 1.21.11
};

function createBot() {
  console.log('[Bot] Đang kết nối tới server Minecraft...');
  botStatus = 'Đang kết nối...';

  const bot = mineflayer.createBot(BOT_CONFIG);

  // Tự động Chấp nhận Resource Pack từ Server gửi xuống
  bot.on('resourcePack', (url, hash) => {
    console.log('[Bot] Đã nhận Resource Pack từ Server -> Đang tự động Accept!');
    bot.acceptResourcePack();
  });

  // Khi bot vào game thành công
  bot.on('spawn', () => {
    console.log('[Bot] Đã vào game thành công!');
    botStatus = '🟢 Đang Online trong Server';
    lastOnline = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Chat thông báo hoặc đăng nhập (nếu server xài AuthMe)
    setTimeout(() => {
      // Nếu server offline-mode có AuthMe, bỏ comment dòng dưới:
      // bot.chat('/login DucMinh2026@'); 
      bot.chat('Bot AFK 24/7 đã kết nối!');
    }, 3000);
  });

  // Xử lý khi bị ngắt kết nối (Auto Reconnect)
  bot.on('end', (reason) => {
    console.log(`[Bot] Mất kết nối: ${reason}. Đang thử kết nối lại sau 10 giây...`);
    botStatus = `🔴 Mất kết nối (${reason})`;
    setTimeout(createBot, 10000);
  });

  // Xử lý lỗi
  bot.on('error', (err) => {
    console.error('[Bot Error]:', err.message);
    botStatus = `⚠️ Lỗi: ${err.message}`;
  });
}

// Khởi chạy bot
createBot();
