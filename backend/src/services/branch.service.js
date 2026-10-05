const pool = require('../config/database');
const AppError = require('../utils/AppError');

exports.list = async () => {
  const [rows] = await pool.execute(`
    SELECT b.id,b.branch_code,b.name,b.address,b.phone,b.email,b.opening_time,b.closing_time,b.image,b.status,
           COUNT(DISTINCT t.id) AS table_count,
           COUNT(DISTINCT e.id) AS employee_count
    FROM branches b
    LEFT JOIN cafe_tables t ON t.branch_id=b.id
    LEFT JOIN employees e ON e.branch_id=b.id AND e.status='ACTIVE'
    WHERE b.status<>'DELETED'
    GROUP BY b.id
    ORDER BY b.id
  `);
  return rows;
};

exports.detail = async (id) => {
  const [rows] = await pool.execute(
    "SELECT * FROM branches WHERE id=? AND status<>'DELETED' LIMIT 1",
    [id],
  );
  if (!rows.length) throw new AppError('Không tìm thấy chi nhánh', 404);
  return rows[0];
};

exports.create = async (payload) => {
  const [result] = await pool.execute(
    `INSERT INTO branches(branch_code,name,address,phone,email,opening_time,closing_time,image,status)
     VALUES(?,?,?,?,?,?,?,?,?)`,
    [
      payload.branchCode,
      payload.name,
      payload.address,
      payload.phone || null,
      payload.email || null,
      payload.openingTime || '07:00:00',
      payload.closingTime || '23:00:00',
      payload.image || null,
      payload.status || 'ACTIVE',
    ],
  );
  return exports.detail(result.insertId);
};

exports.update = async (id, payload) => {
  const current = await exports.detail(id);
  await pool.execute(
    `UPDATE branches SET branch_code=?,name=?,address=?,phone=?,email=?,opening_time=?,closing_time=?,image=?,status=? WHERE id=?`,
    [
      payload.branchCode ?? current.branch_code,
      payload.name ?? current.name,
      payload.address ?? current.address,
      payload.phone ?? current.phone,
      payload.email ?? current.email,
      payload.openingTime ?? current.opening_time,
      payload.closingTime ?? current.closing_time,
      payload.image ?? current.image,
      payload.status ?? current.status,
      id,
    ],
  );
  return exports.detail(id);
};

exports.remove = async (id) => {
  await exports.detail(id);
  const [[counts]] = await pool.execute(
    `
    SELECT
      (SELECT COUNT(*) FROM cafe_tables WHERE branch_id=?) AS tables_count,
      (SELECT COUNT(*) FROM employees WHERE branch_id=? AND status<>'DELETED') AS employees_count,
      (SELECT COUNT(*) FROM orders WHERE branch_id=?) AS orders_count
  `,
    [id, id, id],
  );
  if (
    Number(counts.tables_count) ||
    Number(counts.employees_count) ||
    Number(counts.orders_count)
  ) {
    throw new AppError(
      'Chi nhánh đang được sử dụng. Hãy chuyển sang trạng thái ngừng hoạt động thay vì xóa.',
      409,
    );
  }
  await pool.execute("UPDATE branches SET status='DELETED' WHERE id=?", [id]);
};
