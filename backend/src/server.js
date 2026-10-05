require('dotenv').config();
const app = require('./app'),
  pool = require('./config/database'),
  port = Number(process.env.PORT || 5000);
(async () => {
  try {
    const c = await pool.getConnection();
    await c.ping();
    c.release();
    app.listen(port, () =>
      console.log(`Máy chủ API Aurelis Coffee đang chạy tại http://localhost:${port}`),
    );
  } catch (e) {
    console.error('Không thể kết nối tới MySQL:', e.message);
    process.exit(1);
  }
})();
