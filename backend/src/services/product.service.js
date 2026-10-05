const pool = require('../config/database');
const AppError = require('../utils/AppError');
const allowed = new Set(['name', 'base_price', 'created_at']);
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
exports.list = async (q) => {
  const page = Math.max(1, Number(q.page || 1)),
    limit = Math.min(50, Math.max(1, Number(q.limit || 12))),
    offset = (page - 1) * limit,
    where = ["p.status<>'DELETED'"],
    params = [];
  if (q.search) {
    where.push('(p.name LIKE ? OR p.product_code LIKE ?)');
    params.push(`%${q.search}%`, `%${q.search}%`);
  }
  if (q.category) {
    where.push('p.category_id=?');
    params.push(Number(q.category));
  }
  if (q.status) {
    where.push('p.status=?');
    params.push(q.status);
  }
  if (q.featured === 'true') where.push('p.is_featured=1');
  if (q.bestseller === 'true') where.push('p.is_bestseller=1');
  const sort = allowed.has(q.sort) ? q.sort : 'created_at',
    order = String(q.order).toLowerCase() === 'asc' ? 'ASC' : 'DESC',
    ws = where.join(' AND ');
  const [c] = await pool.execute(`SELECT COUNT(*) total FROM products p WHERE ${ws}`, params);
  const [rows] = await pool.execute(
    `SELECT p.id,p.product_code,p.name,p.slug,p.description,p.base_price,p.image,p.status,p.is_featured,p.is_bestseller,p.created_at,c.id category_id,c.name category_name,COALESCE(AVG(r.rating),0) rating,COUNT(DISTINCT r.id) review_count FROM products p JOIN categories c ON c.id=p.category_id LEFT JOIN reviews r ON r.product_id=p.id AND r.status='APPROVED' WHERE ${ws} GROUP BY p.id ORDER BY p.${sort} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  const total = Number(c[0].total);
  return { rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
exports.detail = async (id) => {
  const [rows] = await pool.execute(
    "SELECT p.*,c.name category_name FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=? AND p.status<>'DELETED' LIMIT 1",
    [id],
  );
  if (!rows.length) throw new AppError('Không tìm thấy sản phẩm', 404);
  const [sizes] = await pool.execute(
    'SELECT id,size_name,extra_price FROM product_sizes WHERE product_id=? ORDER BY extra_price',
    [id],
  );
  const [reviews] = await pool.execute(
    "SELECT r.id,r.rating,r.comment,r.created_at,c.full_name customer_name FROM reviews r JOIN customers c ON c.id=r.customer_id WHERE r.product_id=? AND r.status='APPROVED' ORDER BY r.created_at DESC LIMIT 10",
    [id],
  );
  const [addons] = await pool.execute(
    "SELECT id,name,price FROM product_addons WHERE status='ACTIVE' ORDER BY id",
  );
  return { ...rows[0], sizes, addons, reviews };
};
exports.create = async (p, imagePath) => {
  const slug = p.slug || slugify(p.name);
  const [r] = await pool.execute(
    'INSERT INTO products(category_id,product_code,name,slug,description,base_price,image,status,is_featured,is_bestseller) VALUES(?,?,?,?,?,?,?,?,?,?)',
    [
      p.categoryId,
      p.productCode,
      p.name,
      slug,
      p.description || null,
      Number(p.basePrice),
      imagePath || p.image || null,
      p.status || 'ACTIVE',
      p.isFeatured === true || p.isFeatured === 'true' ? 1 : 0,
      p.isBestseller === true || p.isBestseller === 'true' ? 1 : 0,
    ],
  );
  return exports.detail(r.insertId);
};
exports.update = async (id, p, imagePath) => {
  const [e] = await pool.execute("SELECT * FROM products WHERE id=? AND status<>'DELETED'", [id]);
  if (!e.length) throw new AppError('Không tìm thấy sản phẩm', 404);
  const x = e[0],
    name = p.name ?? x.name,
    slug = p.slug || slugify(name);
  await pool.execute(
    'UPDATE products SET category_id=?,product_code=?,name=?,slug=?,description=?,base_price=?,image=?,status=?,is_featured=?,is_bestseller=? WHERE id=?',
    [
      p.categoryId ?? x.category_id,
      p.productCode ?? x.product_code,
      name,
      slug,
      p.description ?? x.description,
      Number(p.basePrice ?? x.base_price),
      imagePath || p.image || x.image,
      p.status ?? x.status,
      p.isFeatured !== undefined
        ? p.isFeatured === true || p.isFeatured === 'true'
          ? 1
          : 0
        : x.is_featured,
      p.isBestseller !== undefined
        ? p.isBestseller === true || p.isBestseller === 'true'
          ? 1
          : 0
        : x.is_bestseller,
      id,
    ],
  );
  return exports.detail(id);
};
exports.remove = async (id) => {
  const [r] = await pool.execute(
    "UPDATE products SET status='DELETED' WHERE id=? AND status<>'DELETED'",
    [id],
  );
  if (!r.affectedRows) throw new AppError('Không tìm thấy sản phẩm', 404);
};
