const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const AppError = require('../utils/AppError');

const publicUser = (row) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  role: row.role,
  employeeId: row.employee_id || null,
  customerId: row.customer_id || null,
  branchId: row.branch_id || null,
  fullName: row.employee_name || row.customer_name || row.username,
  phone: row.phone || null,
  customerCode: row.customer_code || null,
  points: Number(row.points || 0),
  membershipLevel: row.membership_level || null,
  totalSpending: Number(row.total_spending || 0),
  createdAt: row.created_at || null,
});

const userSelect = `SELECT u.id,u.username,u.email,u.status,u.created_at,r.name AS role,
 e.id AS employee_id,e.branch_id,e.full_name AS employee_name,e.phone AS employee_phone,
 c.id AS customer_id,c.full_name AS customer_name,c.phone AS customer_phone,c.customer_code,
 c.points,c.membership_level,c.total_spending
 FROM users u JOIN roles r ON r.id=u.role_id
 LEFT JOIN employees e ON e.user_id=u.id LEFT JOIN customers c ON c.user_id=u.id`;

exports.login = async (email, password) => {
  const [[credential]] = await pool.execute(
    'SELECT id,password_hash,status FROM users WHERE email=? LIMIT 1',
    [email],
  );
  if (!credential || credential.status !== 'ACTIVE')
    throw new AppError('Email hoặc mật khẩu không chính xác', 401);
  if (!(await bcrypt.compare(password, credential.password_hash)))
    throw new AppError('Email hoặc mật khẩu không chính xác', 401);
  const [[user]] = await pool.execute(`${userSelect} WHERE u.id=? LIMIT 1`, [credential.id]);
  await pool.execute('UPDATE users SET last_login=NOW() WHERE id=?', [user.id]);
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  user.phone = user.customer_phone || user.employee_phone;
  return { token, user: publicUser(user) };
};

exports.getUserById = async (userId) => {
  const [rows] = await pool.execute(`${userSelect} WHERE u.id=? LIMIT 1`, [userId]);
  if (!rows[0]) throw new AppError('Tài khoản hiện không khả dụng', 401);
  rows[0].phone = rows[0].customer_phone || rows[0].employee_phone;
  return publicUser(rows[0]);
};

exports.registerCustomer = async ({ fullName, email, phone, password }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [exists] = await conn.execute('SELECT id FROM users WHERE email=? LIMIT 1', [email]);
    if (exists.length) throw new AppError('Email đã tồn tại', 409);
    const [roles] = await conn.execute("SELECT id FROM roles WHERE name='CUSTOMER' LIMIT 1");
    if (!roles.length) throw new AppError('Hệ thống chưa có vai trò khách hàng', 500);
    const hash = await bcrypt.hash(password, 12);
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'customer';
    const username = `${base}_${Date.now().toString().slice(-5)}`;
    const [ur] = await conn.execute(
      "INSERT INTO users(username,email,password_hash,role_id,status) VALUES(?,?,?,?,'ACTIVE')",
      [username, email, hash, roles[0].id],
    );
    const code = `CUS${String(ur.insertId).padStart(5, '0')}`;
    const [cr] = await conn.execute(
      "INSERT INTO customers(user_id,customer_code,full_name,phone,email,points,membership_level,total_spending) VALUES(?,?,?,?,?,0,'MEMBER',0)",
      [ur.insertId, code, fullName, phone || null, email],
    );
    await conn.commit();
    return { userId: ur.insertId, customerId: cr.insertId, customerCode: code };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

exports.updateCustomerProfile = async (userId, { fullName, phone }) => {
  const [existing] = await pool.execute(
    "SELECT id FROM customers WHERE user_id=? AND status='ACTIVE' LIMIT 1",
    [userId],
  );
  if (!existing.length) throw new AppError('Không tìm thấy hồ sơ khách hàng', 404);
  await pool.execute(
    "UPDATE customers SET full_name=?,phone=? WHERE user_id=? AND status='ACTIVE'",
    [fullName, phone || null, userId],
  );
  const [rows] = await pool.execute(`${userSelect} WHERE u.id=? LIMIT 1`, [userId]);
  return publicUser(rows[0]);
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id=? LIMIT 1', [userId]);
  if (!rows[0] || !(await bcrypt.compare(currentPassword, rows[0].password_hash)))
    throw new AppError('Mật khẩu hiện tại không chính xác', 400);
  await pool.execute('UPDATE users SET password_hash=? WHERE id=?', [
    await bcrypt.hash(newPassword, 12),
    userId,
  ]);
};
