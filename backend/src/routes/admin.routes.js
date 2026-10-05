const router = require('express').Router();
const pool = require('../config/database');
const { protect, authorize } = require('../middlewares/auth.middleware');
const asyncHandler = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');

router.use(protect, authorize('ADMIN', 'MANAGER'));

router.get(
  '/users',
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const search = String(req.query.search || '').trim();
    const status = ['ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED'].includes(req.query.status)
      ? req.query.status
      : '';
    const where = [status ? '1=1' : "u.status<>'DELETED'"];
    const params = [];
    if (search) {
      where.push(
        '(u.username LIKE ? OR u.email LIKE ? OR e.full_name LIKE ? OR c.full_name LIKE ?)',
      );
      params.push(...Array(4).fill(`%${search}%`));
    }
    if (status) {
      where.push('u.status=?');
      params.push(status);
    }
    const condition = where.join(' AND ');
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) total FROM users u JOIN roles r ON r.id=u.role_id LEFT JOIN employees e ON e.user_id=u.id LEFT JOIN customers c ON c.user_id=u.id WHERE ${condition}`,
      params,
    );
    const [rows] = await pool.execute(
      `SELECT u.id,u.username,u.email,u.status,u.last_login,u.created_at,r.name role,e.full_name employee_name,e.phone employee_phone,c.full_name customer_name,c.phone customer_phone FROM users u JOIN roles r ON r.id=u.role_id LEFT JOIN employees e ON e.user_id=u.id LEFT JOIN customers c ON c.user_id=u.id WHERE ${condition} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit],
    );
    success(res, {
      message: 'Danh sách người dùng',
      data: rows.map((row) => ({
        ...row,
        full_name: row.employee_name || row.customer_name || row.username,
        phone: row.employee_phone || row.customer_phone,
      })),
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.max(1, Math.ceil(Number(total) / limit)),
      },
    });
  }),
);

router.post(
  '/users',
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;
    const cleanUsername = String(username || '').trim();
    const cleanEmail = String(email || '')
      .trim()
      .toLowerCase();
    const fullName = String(req.body.fullName || '').trim();
    const phone = String(req.body.phone || '').trim() || null;
    const allowedRoles = ['ADMIN', 'MANAGER', 'CASHIER', 'BARISTA', 'CUSTOMER'];
    const branchId = Number(req.body.branchId);
    const passwordValue = String(password || '');
    if (
      !/^[a-zA-Z0-9_.-]{3,80}$/.test(cleanUsername) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      passwordValue.length < 8 ||
      passwordValue.length > 100 ||
      !allowedRoles.includes(role) ||
      fullName.length < 2 ||
      fullName.length > 120 ||
      (phone && phone.length > 30)
    )
      throw new AppError('Thông tin người dùng chưa hợp lệ (mật khẩu tối thiểu 8 ký tự)', 422);
    if (role !== 'CUSTOMER' && (!Number.isInteger(branchId) || branchId < 1))
      throw new AppError('Vui lòng chọn chi nhánh cho tài khoản nhân viên', 422);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [duplicates] = await conn.execute(
        'SELECT id FROM users WHERE username=? OR email=? LIMIT 1',
        [cleanUsername, cleanEmail],
      );
      if (duplicates.length) throw new AppError('Username hoặc email đã được sử dụng', 409);
      const [roles] = await conn.execute('SELECT id FROM roles WHERE name=? LIMIT 1', [role]);
      if (!roles.length) throw new AppError('Vai trò không tồn tại', 422);
      if (role !== 'CUSTOMER') {
        const [branches] = await conn.execute(
          "SELECT id FROM branches WHERE id=? AND status='ACTIVE'",
          [branchId],
        );
        if (!branches.length)
          throw new AppError('Chi nhánh không tồn tại hoặc đã ngưng hoạt động', 422);
      }
      const [created] = await conn.execute(
        "INSERT INTO users(username,email,password_hash,role_id,status) VALUES(?,?,?,?,'ACTIVE')",
        [cleanUsername, cleanEmail, await bcrypt.hash(passwordValue, 12), roles[0].id],
      );
      if (role === 'CUSTOMER') {
        const code = `CUS${String(created.insertId).padStart(5, '0')}`;
        await conn.execute(
          'INSERT INTO customers(user_id,customer_code,full_name,phone,email) VALUES(?,?,?,?,?)',
          [created.insertId, code, fullName, phone, cleanEmail],
        );
      } else {
        const code = `EMP${String(created.insertId).padStart(5, '0')}`;
        await conn.execute(
          'INSERT INTO employees(user_id,branch_id,employee_code,full_name,phone,position) VALUES(?,?,?,?,?,?)',
          [created.insertId, branchId, code, fullName, phone, role],
        );
      }
      await conn.commit();
      success(res, {
        status: 201,
        message: 'Đã tạo người dùng',
        data: {
          id: created.insertId,
          username: cleanUsername,
          email: cleanEmail,
          role,
          status: 'ACTIVE',
          full_name: fullName,
          phone,
        },
      });
    } catch (error) {
      await conn.rollback();
      if (error.code === 'ER_DUP_ENTRY')
        throw new AppError('Username, email hoặc mã người dùng đã tồn tại', 409);
      throw error;
    } finally {
      conn.release();
    }
  }),
);

router.put(
  '/users/:id',
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const fullName = String(req.body.fullName || '').trim();
    const phone = String(req.body.phone || '').trim() || null;
    if (
      !Number.isInteger(id) ||
      id < 1 ||
      !/^[a-zA-Z0-9_.-]{3,80}$/.test(username) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      fullName.length < 2 ||
      fullName.length > 120 ||
      (phone && phone.length > 30)
    )
      throw new AppError('Thông tin người dùng chưa hợp lệ', 422);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [users] = await conn.execute(
        "SELECT id,status FROM users WHERE id=? AND status<>'DELETED' FOR UPDATE",
        [id],
      );
      if (!users.length) throw new AppError('Không tìm thấy người dùng', 404);
      const [duplicates] = await conn.execute(
        'SELECT id FROM users WHERE (username=? OR email=?) AND id<>? LIMIT 1',
        [username, email, id],
      );
      if (duplicates.length) throw new AppError('Username hoặc email đã được sử dụng', 409);
      await conn.execute('UPDATE users SET username=?,email=? WHERE id=?', [username, email, id]);
      await conn.execute('UPDATE employees SET full_name=?,phone=? WHERE user_id=?', [
        fullName,
        phone,
        id,
      ]);
      await conn.execute('UPDATE customers SET full_name=?,phone=?,email=? WHERE user_id=?', [
        fullName,
        phone,
        email,
        id,
      ]);
      await conn.commit();
      success(res, {
        message: 'Đã cập nhật người dùng',
        data: { id, username, email, full_name: fullName, phone },
      });
    } catch (error) {
      await conn.rollback();
      if (error.code === 'ER_DUP_ENTRY')
        throw new AppError('Username hoặc email đã được sử dụng', 409);
      throw error;
    } finally {
      conn.release();
    }
  }),
);

router.delete(
  '/users/:id',
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new AppError('Người dùng không hợp lệ', 422);
    if (id === Number(req.user.id))
      throw new AppError('Bạn không thể xóa tài khoản đang đăng nhập', 422);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [users] = await conn.execute(
        "SELECT u.id,u.status,r.name role FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=? AND u.status<>'DELETED' FOR UPDATE",
        [id],
      );
      if (!users.length) throw new AppError('Không tìm thấy người dùng', 404);
      if (users[0].role === 'ADMIN' && users[0].status === 'ACTIVE') {
        const [[{ total }]] = await conn.execute(
          "SELECT COUNT(*) total FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='ADMIN' AND u.status='ACTIVE'",
        );
        if (Number(total) <= 1)
          throw new AppError('Không thể xóa quản trị viên đang hoạt động cuối cùng', 422);
      }
      await conn.execute("UPDATE users SET status='DELETED' WHERE id=?", [id]);
      await conn.execute("UPDATE employees SET status='DELETED' WHERE user_id=?", [id]);
      await conn.execute("UPDATE customers SET status='DELETED' WHERE user_id=?", [id]);
      await conn.commit();
      success(res, { message: 'Đã xóa người dùng', data: { id } });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }),
);

router.patch(
  '/users/:id/status',
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body.status || '').toUpperCase();
    if (!Number.isInteger(id) || id < 1 || !['ACTIVE', 'INACTIVE', 'LOCKED'].includes(status))
      throw new AppError('Trạng thái người dùng không hợp lệ', 422);
    if (id === Number(req.user.id))
      throw new AppError('Bạn không thể thay đổi trạng thái tài khoản đang đăng nhập', 422);
    const [result] = await pool.execute('UPDATE users SET status=? WHERE id=?', [status, id]);
    if (!result.affectedRows) throw new AppError('Không tìm thấy người dùng', 404);
    success(res, { message: 'Đã cập nhật trạng thái người dùng', data: { id, status } });
  }),
);

router.get(
  '/customers',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const search = String(req.query.search || '').trim();
    const branch =
      req.user.role === 'MANAGER' && req.user.branch_id
        ? ' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.branch_id=?)'
        : '';
    const params = [...(branch ? [req.user.branch_id] : [])];
    const searchSql = search
      ? ' AND (c.full_name LIKE ? OR c.customer_code LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)'
      : '';
    if (search) params.push(...Array(4).fill(`%${search}%`));
    const where = `c.status <> 'DELETED'${branch}${searchSql}`;
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) total FROM customers c WHERE ${where}`,
      params,
    );
    const [rows] = await pool.execute(
      `SELECT c.id,c.customer_code,c.full_name,c.phone,c.email,c.points,c.membership_level,c.total_spending,c.created_at,(SELECT COUNT(*) FROM orders o WHERE o.customer_id=c.id AND o.status='COMPLETED'${req.user.role === 'MANAGER' && req.user.branch_id ? ' AND o.branch_id=?' : ''}) order_count FROM customers c WHERE ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [
        ...params.slice(0, branch ? 1 : 0),
        ...(req.user.role === 'MANAGER' && req.user.branch_id ? [req.user.branch_id] : []),
        ...params.slice(branch ? 1 : 0),
        limit,
        (page - 1) * limit,
      ],
    );
    success(res, {
      message: 'Danh sách khách hàng',
      data: rows,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    });
  }),
);

router.get(
  '/inventory',
  asyncHandler(async (_req, res) => {
    const [ingredients] = await pool.execute(
      `SELECT i.id,i.name,i.unit,i.current_quantity,i.minimum_stock,i.status,s.name supplier_name FROM ingredients i LEFT JOIN suppliers s ON s.id=i.supplier_id WHERE i.status='ACTIVE' ORDER BY (i.current_quantity <= i.minimum_stock) DESC,i.name`,
    );
    const [suppliers] = await pool.execute(
      "SELECT id,name FROM suppliers WHERE status='ACTIVE' ORDER BY name",
    );
    const [transactions] = await pool.execute(
      `SELECT t.id,t.transaction_type,t.quantity,t.note,t.created_at,i.name ingredient_name,i.unit,s.name supplier_name FROM inventory_transactions t JOIN ingredients i ON i.id=t.ingredient_id LEFT JOIN suppliers s ON s.id=t.supplier_id ORDER BY t.created_at DESC LIMIT 12`,
    );
    success(res, { message: 'Tồn kho', data: { ingredients, suppliers, transactions } });
  }),
);

router.post(
  '/inventory/ingredients',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const unit = String(req.body.unit || '').trim();
    const minimumStock = Number(req.body.minimumStock || 0);
    if (
      !name ||
      !unit ||
      name.length > 120 ||
      unit.length > 30 ||
      !Number.isFinite(minimumStock) ||
      minimumStock < 0
    )
      throw new AppError('Tên, đơn vị và mức tồn tối thiểu chưa hợp lệ', 422);
    const supplierId = req.body.supplierId ? Number(req.body.supplierId) : null;
    if (supplierId) {
      const [suppliers] = await pool.execute(
        "SELECT id FROM suppliers WHERE id=? AND status='ACTIVE'",
        [supplierId],
      );
      if (!suppliers.length) throw new AppError('Không tìm thấy nhà cung cấp đang hoạt động', 422);
    }
    const [result] = await pool.execute(
      'INSERT INTO ingredients(name,unit,minimum_stock,supplier_id) VALUES(?,?,?,?)',
      [name, unit, minimumStock, supplierId],
    );
    const [[ingredient]] = await pool.execute(
      'SELECT id,name,unit,current_quantity,minimum_stock FROM ingredients WHERE id=?',
      [result.insertId],
    );
    success(res, { status: 201, message: 'Đã thêm nguyên liệu', data: ingredient });
  }),
);

router.post(
  '/inventory/receive',
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const ingredientId = Number(req.body.ingredientId),
      quantity = Number(req.body.quantity);
    if (
      !Number.isInteger(ingredientId) ||
      ingredientId < 1 ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    )
      throw new AppError('Nguyên liệu và số lượng nhập chưa hợp lệ', 422);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.execute(
        "SELECT id,supplier_id FROM ingredients WHERE id=? AND status='ACTIVE' FOR UPDATE",
        [ingredientId],
      );
      if (!rows.length) throw new AppError('Không tìm thấy nguyên liệu', 404);
      await conn.execute('UPDATE ingredients SET current_quantity=current_quantity+? WHERE id=?', [
        quantity,
        ingredientId,
      ]);
      await conn.execute(
        "INSERT INTO inventory_transactions(ingredient_id,supplier_id,transaction_type,quantity,note) VALUES(?,?,'IN',?,?)",
        [
          ingredientId,
          req.body.supplierId || rows[0].supplier_id || null,
          quantity,
          String(req.body.note || '').slice(0, 255) || null,
        ],
      );
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
    success(res, { message: 'Đã ghi nhận nhập kho' });
  }),
);

router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    const days = Math.min(90, Math.max(7, Number(req.query.days || 30)));
    const branchFilter =
      req.user.role === 'MANAGER' && req.user.branch_id ? ' AND branch_id=?' : '';
    const params = [days, ...(branchFilter ? [req.user.branch_id] : [])];
    const [daily] = await pool.execute(
      `SELECT DATE(created_at) date,COUNT(*) orders,SUM(total_amount) revenue FROM orders WHERE status='COMPLETED' AND created_at >= DATE_SUB(CURDATE(),INTERVAL ? DAY)${branchFilter} GROUP BY DATE(created_at) ORDER BY date`,
      params,
    );
    const [topProducts] = await pool.execute(
      `SELECT p.name,SUM(oi.quantity) quantity,SUM(oi.total_price) revenue FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id WHERE o.status='COMPLETED' AND o.created_at >= DATE_SUB(CURDATE(),INTERVAL ? DAY)${branchFilter.replaceAll('branch_id', 'o.branch_id')} GROUP BY p.id ORDER BY quantity DESC LIMIT 8`,
      params,
    );
    const [summary] = await pool.execute(
      `SELECT COUNT(*) orders,COALESCE(SUM(total_amount),0) revenue,COALESCE(AVG(total_amount),0) average_order FROM orders WHERE status='COMPLETED' AND created_at >= DATE_SUB(CURDATE(),INTERVAL ? DAY)${branchFilter}`,
      params,
    );
    success(res, {
      message: 'Báo cáo hoạt động',
      data: { days, daily, topProducts, summary: summary[0] },
    });
  }),
);

module.exports = router;
