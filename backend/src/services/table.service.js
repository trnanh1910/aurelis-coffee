const pool = require('../config/database');
const AppError = require('../utils/AppError');

const validStatuses = new Set(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING']);

exports.list = async (query, user) => {
  const where = ["b.status<>'DELETED'"];
  const params = [];
  const requestedBranch = query.branchId || query.branch;
  const employeeScoped = ['MANAGER', 'CASHIER', 'BARISTA'].includes(user?.role);
  if (employeeScoped && user?.branch_id) {
    where.push('t.branch_id=?');
    params.push(user.branch_id);
  } else if (requestedBranch) {
    where.push('t.branch_id=?');
    params.push(Number(requestedBranch));
  }
  if (query.status) {
    where.push('t.status=?');
    params.push(query.status);
  }
  if (query.area) {
    where.push('t.area=?');
    params.push(query.area);
  }
  const [rows] = await pool.execute(
    `
    SELECT t.id,t.branch_id,t.table_code,t.area,t.capacity,t.status,t.created_at,t.updated_at,b.name AS branch_name
    FROM cafe_tables t JOIN branches b ON b.id=t.branch_id
    WHERE ${where.join(' AND ')}
    ORDER BY b.id,t.area,t.table_code
  `,
    params,
  );
  return rows;
};

exports.detail = async (id, user) => {
  const params = [id];
  let scope = '';
  if (['MANAGER', 'CASHIER', 'BARISTA'].includes(user?.role) && user?.branch_id) {
    scope = ' AND t.branch_id=?';
    params.push(user.branch_id);
  }
  const [rows] = await pool.execute(
    `SELECT t.*,b.name AS branch_name FROM cafe_tables t JOIN branches b ON b.id=t.branch_id WHERE t.id=? ${scope} LIMIT 1`,
    params,
  );
  if (!rows.length) throw new AppError('Không tìm thấy bàn', 404);
  return rows[0];
};

exports.create = async (payload, user) => {
  if (
    !Number.isInteger(Number(payload.capacity)) ||
    Number(payload.capacity) < 1 ||
    Number(payload.capacity) > 20
  )
    throw new AppError('Sức chứa cần từ 1 đến 20 chỗ', 422);
  if (payload.status && !validStatuses.has(payload.status))
    throw new AppError('Trạng thái bàn không hợp lệ', 422);
  if (user?.role === 'MANAGER' && Number(payload.branchId) !== Number(user.branch_id))
    throw new AppError('Quản lý chỉ được phép quản lý bàn thuộc chi nhánh của mình', 403);
  const [branch] = await pool.execute("SELECT id FROM branches WHERE id=? AND status='ACTIVE'", [
    payload.branchId,
  ]);
  if (!branch.length) throw new AppError('Không tìm thấy chi nhánh đang hoạt động', 404);
  const [result] = await pool.execute(
    `INSERT INTO cafe_tables(branch_id,table_code,area,capacity,status) VALUES(?,?,?,?,?)`,
    [
      payload.branchId,
      payload.tableCode,
      payload.area || 'Tầng 1',
      Number(payload.capacity),
      payload.status || 'AVAILABLE',
    ],
  );
  return exports.detail(result.insertId, user);
};

exports.update = async (id, payload, user) => {
  const current = await exports.detail(id, user);
  const nextStatus = payload.status ?? current.status;
  if (!validStatuses.has(nextStatus)) throw new AppError('Trạng thái bàn không hợp lệ', 422);
  const nextCapacity = Number(payload.capacity ?? current.capacity);
  if (!Number.isInteger(nextCapacity) || nextCapacity < 1 || nextCapacity > 20)
    throw new AppError('Sức chứa cần từ 1 đến 20 chỗ', 422);
  if (
    user?.role === 'MANAGER' &&
    (Number(current.branch_id) !== Number(user.branch_id) ||
      (payload.branchId && Number(payload.branchId) !== Number(user.branch_id)))
  )
    throw new AppError('Quản lý chỉ được phép quản lý bàn thuộc chi nhánh của mình', 403);
  const nextBranchId = Number(payload.branchId ?? current.branch_id);
  if (nextBranchId !== Number(current.branch_id)) {
    const [[open]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM orders WHERE table_id=? AND status NOT IN ('COMPLETED','CANCELLED')",
      [id],
    );
    if (Number(open.total) > 0)
      throw new AppError('Không thể chuyển chi nhánh khi bàn còn đơn đang hoạt động', 409);
    const [branches] = await pool.execute(
      "SELECT id FROM branches WHERE id=? AND status='ACTIVE'",
      [nextBranchId],
    );
    if (!branches.length)
      throw new AppError('Chỉ được chuyển bàn sang chi nhánh đang hoạt động', 422);
  }
  if (current.status === 'OCCUPIED' && nextStatus === 'AVAILABLE') {
    const [[open]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM orders WHERE table_id=? AND status NOT IN ('COMPLETED','CANCELLED')",
      [id],
    );
    if (Number(open.total) > 0)
      throw new AppError(
        'Bàn vẫn còn đơn đang hoạt động; hãy xử lý đơn trước khi trả bàn trống',
        409,
      );
  }
  await pool.execute(
    `UPDATE cafe_tables SET branch_id=?,table_code=?,area=?,capacity=?,status=? WHERE id=?`,
    [
      payload.branchId ?? current.branch_id,
      payload.tableCode ?? current.table_code,
      payload.area ?? current.area,
      nextCapacity,
      nextStatus,
      id,
    ],
  );
  return exports.detail(id, user);
};

exports.changeStatus = async (id, status, user) => {
  if (!validStatuses.has(status)) throw new AppError('Trạng thái bàn không hợp lệ', 422);
  const current = await exports.detail(id, user);
  if (current.status === 'OCCUPIED' && status === 'AVAILABLE') {
    const [[open]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM orders WHERE table_id=? AND status NOT IN ('COMPLETED','CANCELLED')",
      [id],
    );
    if (Number(open.total) > 0) throw new AppError('Bàn này vẫn còn đơn hàng đang hoạt động', 409);
  }
  await pool.execute('UPDATE cafe_tables SET status=? WHERE id=?', [status, id]);
  return exports.detail(id, user);
};
