const pool = require('../config/database');
const ah = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');
exports.overview = ah(async (req, res) => {
  const bf = req.user.role === 'MANAGER' && req.user.branch_id ? ' AND o.branch_id=?' : '',
    params = bf ? [req.user.branch_id] : [];
  const [k] = await pool.execute(
    `SELECT COALESCE(SUM(CASE WHEN DATE(o.created_at)=CURDATE() AND o.status='COMPLETED' THEN o.total_amount ELSE 0 END),0) todayRevenue,SUM(CASE WHEN DATE(o.created_at)=CURDATE() THEN 1 ELSE 0 END) todayOrders,COALESCE(AVG(CASE WHEN DATE(o.created_at)=CURDATE() AND o.status='COMPLETED' THEN o.total_amount END),0) averageOrderValue FROM orders o WHERE 1=1 ${bf}`,
    params,
  );
  const [c] = await pool.execute('SELECT COUNT(*) customers FROM customers');
  const [tp] = await pool.execute(
    `SELECT p.name,SUM(oi.quantity) quantity FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' ${bf} GROUP BY p.id ORDER BY quantity DESC LIMIT 5`,
    params,
  );
  const [ro] = await pool.execute(
    `SELECT o.id,o.order_code,o.order_type,o.status,o.total_amount,o.created_at,b.name branch_name,COALESCE(c.full_name,'Khách vãng lai') customer_name FROM orders o JOIN branches b ON b.id=o.branch_id LEFT JOIN customers c ON c.id=o.customer_id WHERE 1=1 ${bf} ORDER BY o.created_at DESC LIMIT 6`,
    params,
  );
  success(res, {
    message: 'Lấy dữ liệu tổng quan thành công',
    data: { ...k[0], customers: c[0].customers, topProducts: tp, recentOrders: ro },
  });
});
exports.revenue = ah(async (req, res) => {
  const days = Math.min(365, Math.max(7, Number(req.query.days || 7))),
    bf = req.user.role === 'MANAGER' && req.user.branch_id ? ' AND branch_id=?' : '',
    params = [days, ...(bf ? [req.user.branch_id] : [])];
  const [rows] = await pool.execute(
    `SELECT DATE(created_at) date,SUM(total_amount) revenue,COUNT(*) orders FROM orders WHERE status='COMPLETED' AND created_at>=DATE_SUB(CURDATE(),INTERVAL ? DAY) ${bf} GROUP BY DATE(created_at) ORDER BY DATE(created_at)`,
    params,
  );
  success(res, { message: 'Lấy dữ liệu doanh thu thành công', data: rows });
});
