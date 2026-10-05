const pool = require('../config/database');
const AppError = require('../utils/AppError');

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
const money = (n) => Math.round(Number(n || 0));
const makeCode = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

function scopedBranch(user, requested) {
  if (['MANAGER', 'CASHIER', 'BARISTA'].includes(user?.role) && user?.branch_id)
    return Number(user.branch_id);
  return requested ? Number(requested) : null;
}

async function validateVoucher(conn, code, subtotal, customerId) {
  if (!code) return { voucher: null, discount: 0 };
  const [rows] = await conn.execute(
    `
    SELECT * FROM vouchers
    WHERE code=? AND status='ACTIVE' AND NOW() BETWEEN start_date AND end_date
    LIMIT 1 FOR UPDATE
  `,
    [String(code).trim().toUpperCase()],
  );
  if (!rows.length) throw new AppError('Mã ưu đãi không hợp lệ hoặc đã hết hạn', 422);
  const voucher = rows[0];
  if (subtotal < Number(voucher.min_order_value))
    throw new AppError(
      `Giá trị đơn hàng tối thiểu để dùng mã là ${Number(voucher.min_order_value).toLocaleString('vi-VN')} ₫`,
      422,
    );
  if (voucher.usage_limit) {
    const [[usage]] = await conn.execute(
      'SELECT COUNT(*) AS total FROM voucher_usages WHERE voucher_id=?',
      [voucher.id],
    );
    if (Number(usage.total) >= Number(voucher.usage_limit))
      throw new AppError('Mã ưu đãi đã đạt giới hạn sử dụng', 422);
  }
  if (customerId && voucher.per_customer_limit) {
    const [[usage]] = await conn.execute(
      'SELECT COUNT(*) AS total FROM voucher_usages WHERE voucher_id=? AND customer_id=?',
      [voucher.id, customerId],
    );
    if (Number(usage.total) >= Number(voucher.per_customer_limit))
      throw new AppError('Bạn đã đạt giới hạn sử dụng mã ưu đãi này', 422);
  }
  let discount =
    voucher.discount_type === 'PERCENT'
      ? (subtotal * Number(voucher.discount_value)) / 100
      : Number(voucher.discount_value);
  if (voucher.max_discount !== null) discount = Math.min(discount, Number(voucher.max_discount));
  discount = Math.min(subtotal, money(discount));
  return { voucher, discount };
}

exports.list = async (query, user) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(query.limit || 15)));
  const offset = (page - 1) * limit;
  const where = ['1=1'];
  const params = [];
  const branchId = scopedBranch(user, query.branchId || query.branch);
  if (branchId) {
    where.push('o.branch_id=?');
    params.push(branchId);
  }
  if (user?.role === 'CUSTOMER') {
    if (!user.customer_id)
      return { rows: [], pagination: { page, limit, total: 0, totalPages: 1 } };
    where.push('o.customer_id=?');
    params.push(user.customer_id);
  }
  if (query.status) {
    where.push('o.status=?');
    params.push(query.status);
  }
  if (query.orderType) {
    where.push('o.order_type=?');
    params.push(query.orderType);
  }
  if (query.search) {
    where.push('(o.order_code LIKE ? OR c.full_name LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.dateFrom) {
    where.push('DATE(o.created_at)>=?');
    params.push(query.dateFrom);
  }
  if (query.dateTo) {
    where.push('DATE(o.created_at)<=?');
    params.push(query.dateTo);
  }
  const ws = where.join(' AND ');
  const [[count]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM orders o LEFT JOIN customers c ON c.id=o.customer_id WHERE ${ws}`,
    params,
  );
  const [rows] = await pool.execute(
    `
    SELECT o.id,o.order_code,o.branch_id,o.order_type,o.status,o.subtotal,o.discount_amount,o.total_amount,o.note,o.created_at,o.updated_at,
           b.name AS branch_name,t.table_code,c.full_name AS customer_name,e.full_name AS employee_name,
           (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id=o.id) AS item_lines,
           (SELECT GROUP_CONCAT(CONCAT(oi.quantity,'x ',p2.name) ORDER BY oi.id SEPARATOR '||') FROM order_items oi JOIN products p2 ON p2.id=oi.product_id WHERE oi.order_id=o.id) AS item_summary,
           (SELECT p.payment_status FROM payments p WHERE p.order_id=o.id ORDER BY p.id DESC LIMIT 1) AS payment_status,
           (SELECT p.payment_method FROM payments p WHERE p.order_id=o.id ORDER BY p.id DESC LIMIT 1) AS payment_method
    FROM orders o
    JOIN branches b ON b.id=o.branch_id
    LEFT JOIN cafe_tables t ON t.id=o.table_id
    LEFT JOIN customers c ON c.id=o.customer_id
    LEFT JOIN employees e ON e.id=o.employee_id
    WHERE ${ws}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `,
    [...params, limit, offset],
  );
  const total = Number(count.total);
  return {
    rows,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
};

exports.detail = async (id, user) => {
  const params = [id];
  let scope = '';
  if (['MANAGER', 'CASHIER', 'BARISTA'].includes(user?.role) && user?.branch_id) {
    scope = ' AND o.branch_id=?';
    params.push(user.branch_id);
  }
  if (user?.role === 'CUSTOMER' && user?.customer_id) {
    scope = ' AND o.customer_id=?';
    params.push(user.customer_id);
  }
  const [rows] = await pool.execute(
    `
    SELECT o.*,b.name AS branch_name,b.address AS branch_address,t.table_code,c.full_name AS customer_name,c.phone AS customer_phone,
           e.full_name AS employee_name,v.code AS voucher_code
    FROM orders o JOIN branches b ON b.id=o.branch_id
    LEFT JOIN cafe_tables t ON t.id=o.table_id LEFT JOIN customers c ON c.id=o.customer_id
    LEFT JOIN employees e ON e.id=o.employee_id LEFT JOIN vouchers v ON v.id=o.voucher_id
    WHERE o.id=? ${scope} LIMIT 1
  `,
    params,
  );
  if (!rows.length) throw new AppError('Không tìm thấy đơn hàng', 404);
  const [items] = await pool.execute(
    `
    SELECT oi.id,oi.product_id,p.name AS product_name,p.image,oi.size_id,ps.size_name,oi.quantity,oi.unit_price,oi.total_price,oi.sugar_level,oi.ice_level,oi.note
    FROM order_items oi JOIN products p ON p.id=oi.product_id LEFT JOIN product_sizes ps ON ps.id=oi.size_id
    WHERE oi.order_id=? ORDER BY oi.id
  `,
    [id],
  );
  for (const item of items) {
    const [addons] = await pool.execute(
      'SELECT addon_id,addon_name,addon_price FROM order_item_addons WHERE order_item_id=? ORDER BY id',
      [item.id],
    );
    item.addons = addons;
  }
  const [payments] = await pool.execute(
    'SELECT id,payment_method,amount,payment_status,transaction_code,paid_at,created_at FROM payments WHERE order_id=? ORDER BY id DESC',
    [id],
  );
  return { ...rows[0], items, payments };
};

exports.create = async (payload, user) => {
  if (!Array.isArray(payload.items) || !payload.items.length)
    throw new AppError('Đơn hàng phải có ít nhất một sản phẩm', 422);
  const branchId = scopedBranch(user, payload.branchId);
  if (!branchId) throw new AppError('Vui lòng chọn chi nhánh', 422);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [branchRows] = await conn.execute(
      "SELECT id FROM branches WHERE id=? AND status='ACTIVE' FOR UPDATE",
      [branchId],
    );
    if (!branchRows.length) throw new AppError('Không tìm thấy chi nhánh đang hoạt động', 404);

    const orderType = payload.orderType || 'DINE_IN';
    let tableId = payload.tableId ? Number(payload.tableId) : null;
    if (orderType === 'DINE_IN') {
      if (!tableId) throw new AppError('Đơn tại bàn bắt buộc phải chọn bàn', 422);
      const [tables] = await conn.execute(
        'SELECT id,branch_id,status FROM cafe_tables WHERE id=? FOR UPDATE',
        [tableId],
      );
      if (!tables.length || Number(tables[0].branch_id) !== branchId)
        throw new AppError('Bàn không thuộc chi nhánh đã chọn', 422);
      if (tables[0].status !== 'AVAILABLE')
        throw new AppError('Bàn đã chọn hiện không còn trống', 409);
    } else tableId = null;

    let customerId = payload.customerId ? Number(payload.customerId) : null;
    if (user?.role === 'CUSTOMER') customerId = user.customer_id;
    let subtotal = 0;
    const computedItems = [];

    for (const raw of payload.items) {
      const quantity = Math.max(1, Number(raw.quantity || 1));
      const [products] = await conn.execute(
        "SELECT id,name,base_price,status FROM products WHERE id=? AND status='ACTIVE' FOR UPDATE",
        [raw.productId],
      );
      if (!products.length)
        throw new AppError(`Sản phẩm mã ${raw.productId} hiện không khả dụng`, 422);
      const product = products[0];
      let size = null;
      let unitPrice = Number(product.base_price);
      if (raw.sizeId) {
        const [sizes] = await conn.execute(
          'SELECT id,size_name,extra_price FROM product_sizes WHERE id=? AND product_id=?',
          [raw.sizeId, product.id],
        );
        if (!sizes.length)
          throw new AppError(`Kích cỡ đã chọn không hợp lệ cho ${product.name}`, 422);
        size = sizes[0];
        unitPrice += Number(size.extra_price);
      }
      const addonRows = [];
      const addonIds = Array.isArray(raw.addonIds) ? [...new Set(raw.addonIds.map(Number))] : [];
      for (const addonId of addonIds) {
        const [addons] = await conn.execute(
          "SELECT id,name,price FROM product_addons WHERE id=? AND status='ACTIVE'",
          [addonId],
        );
        if (!addons.length) throw new AppError('Một món thêm đã chọn hiện không khả dụng', 422);
        addonRows.push(addons[0]);
        unitPrice += Number(addons[0].price);
      }
      const totalPrice = money(unitPrice * quantity);
      subtotal += totalPrice;
      computedItems.push({
        raw,
        product,
        size,
        addonRows,
        quantity,
        unitPrice: money(unitPrice),
        totalPrice,
      });
    }

    const { voucher, discount } = await validateVoucher(
      conn,
      payload.voucherCode,
      subtotal,
      customerId,
    );
    const total = Math.max(0, subtotal - discount);
    const orderCode = makeCode('ORD');
    const employeeId = user?.employee_id || payload.employeeId || null;
    const [orderResult] = await conn.execute(
      `
      INSERT INTO orders(order_code,branch_id,customer_id,employee_id,table_id,order_type,status,subtotal,discount_amount,total_amount,voucher_id,note)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
    `,
      [
        orderCode,
        branchId,
        customerId,
        employeeId,
        tableId,
        orderType,
        'PENDING',
        subtotal,
        discount,
        total,
        voucher?.id || null,
        payload.note || null,
      ],
    );

    for (const item of computedItems) {
      const [itemResult] = await conn.execute(
        `
        INSERT INTO order_items(order_id,product_id,size_id,quantity,unit_price,total_price,sugar_level,ice_level,note)
        VALUES(?,?,?,?,?,?,?,?,?)
      `,
        [
          orderResult.insertId,
          item.product.id,
          item.size?.id || null,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          item.raw.sugarLevel || '100',
          item.raw.iceLevel || 'NORMAL',
          item.raw.note || null,
        ],
      );
      for (const addon of item.addonRows) {
        await conn.execute(
          'INSERT INTO order_item_addons(order_item_id,addon_id,addon_name,addon_price) VALUES(?,?,?,?)',
          [itemResult.insertId, addon.id, addon.name, addon.price],
        );
      }
    }
    if (tableId)
      await conn.execute("UPDATE cafe_tables SET status='OCCUPIED' WHERE id=?", [tableId]);
    await conn.commit();
    return exports.detail(orderResult.insertId, user);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

exports.update = async (id, payload, user) => {
  await exports.detail(id, user);
  await pool.execute('UPDATE orders SET note=? WHERE id=?', [payload.note || null, id]);
  return exports.detail(id, user);
};

exports.changeStatus = async (id, nextStatus, user) => {
  if (!ORDER_STATUSES.includes(nextStatus))
    throw new AppError('Trạng thái đơn hàng không hợp lệ', 422);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const params = [id];
    let scope = '';
    if (['MANAGER', 'CASHIER', 'BARISTA'].includes(user?.role) && user?.branch_id) {
      scope = ' AND branch_id=?';
      params.push(user.branch_id);
    }
    const [rows] = await conn.execute(
      `SELECT * FROM orders WHERE id=? ${scope} FOR UPDATE`,
      params,
    );
    if (!rows.length) throw new AppError('Không tìm thấy đơn hàng', 404);
    const order = rows[0];
    if (nextStatus === 'COMPLETED')
      throw new AppError('Hãy thực hiện thanh toán để hoàn tất đơn hàng', 422);
    if (!TRANSITIONS[order.status]?.includes(nextStatus))
      throw new AppError('Không thể chuyển đơn hàng sang trạng thái đã chọn', 409);
    if (user?.role === 'BARISTA' && !['PREPARING', 'READY'].includes(nextStatus))
      throw new AppError('Nhân viên pha chế chỉ được cập nhật trạng thái pha chế', 403);
    await conn.execute('UPDATE orders SET status=? WHERE id=?', [nextStatus, id]);
    if (nextStatus === 'CANCELLED' && order.table_id)
      await conn.execute("UPDATE cafe_tables SET status='AVAILABLE' WHERE id=?", [order.table_id]);
    await conn.commit();
    return exports.detail(id, user);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

exports.pay = async (id, payload, user) => {
  const method = payload.paymentMethod || 'CASH';
  if (!['CASH', 'QR', 'BANK_TRANSFER'].includes(method))
    throw new AppError('Phương thức thanh toán không hợp lệ', 422);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const params = [id];
    let scope = '';
    if (['MANAGER', 'CASHIER'].includes(user?.role) && user?.branch_id) {
      scope = ' AND branch_id=?';
      params.push(user.branch_id);
    }
    const [rows] = await conn.execute(
      `SELECT * FROM orders WHERE id=? ${scope} FOR UPDATE`,
      params,
    );
    if (!rows.length) throw new AppError('Không tìm thấy đơn hàng', 404);
    const order = rows[0];
    if (['COMPLETED', 'CANCELLED'].includes(order.status))
      throw new AppError('Đơn hàng đã kết thúc hoặc đã bị hủy', 409);
    const [paid] = await conn.execute(
      "SELECT id FROM payments WHERE order_id=? AND payment_status='PAID' LIMIT 1 FOR UPDATE",
      [id],
    );
    if (paid.length) throw new AppError('Đơn hàng đã được thanh toán', 409);
    const expected = money(order.total_amount);
    if (payload.amount !== undefined && money(payload.amount) !== expected)
      throw new AppError('Số tiền thanh toán phải bằng tổng tiền đơn hàng', 422);
    const transactionCode = payload.transactionCode || makeCode(method === 'CASH' ? 'CASH' : 'TXN');
    await conn.execute(
      `INSERT INTO payments(order_id,payment_method,amount,payment_status,transaction_code,paid_at) VALUES(?,?,?,?,?,NOW())`,
      [id, method, expected, 'PAID', transactionCode],
    );
    await conn.execute("UPDATE orders SET status='COMPLETED' WHERE id=?", [id]);
    if (order.table_id)
      await conn.execute("UPDATE cafe_tables SET status='CLEANING' WHERE id=?", [order.table_id]);

    let earnedPoints = 0;
    if (order.customer_id) {
      earnedPoints = Math.floor(expected / 10000);
      const [customers] = await conn.execute(
        'SELECT points,total_spending FROM customers WHERE id=? FOR UPDATE',
        [order.customer_id],
      );
      if (customers.length) {
        const newPoints = Number(customers[0].points) + earnedPoints;
        const newSpending = Number(customers[0].total_spending) + expected;
        const tier =
          newPoints >= 3000
            ? 'PLATINUM'
            : newPoints >= 1500
              ? 'GOLD'
              : newPoints >= 500
                ? 'SILVER'
                : 'MEMBER';
        await conn.execute(
          'UPDATE customers SET points=?,membership_level=?,total_spending=? WHERE id=?',
          [newPoints, tier, newSpending, order.customer_id],
        );
        if (earnedPoints > 0)
          await conn.execute(
            `INSERT INTO loyalty_transactions(customer_id,order_id,transaction_type,points,note) VALUES(?,?,?,?,?)`,
            [order.customer_id, id, 'EARN', earnedPoints, `Points earned from ${order.order_code}`],
          );
      }
    }
    if (order.voucher_id) {
      await conn.execute(
        'INSERT IGNORE INTO voucher_usages(voucher_id,customer_id,order_id) VALUES(?,?,?)',
        [order.voucher_id, order.customer_id, id],
      );
    }
    await conn.commit();
    const result = await exports.detail(id, user);
    result.earned_points = earnedPoints;
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
