const pool = require('../config/database');
const AppError = require('../utils/AppError');
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

exports.list = async () => {
  const [rows] = await pool.execute(
    "SELECT id,name,slug,description,image,display_order,status FROM categories WHERE status<>'DELETED' ORDER BY display_order,name",
  );
  return rows;
};

exports.detail = async (id) => {
  const [rows] = await pool.execute(
    "SELECT id,name,slug,description,image,display_order,status FROM categories WHERE id=? AND status<>'DELETED' LIMIT 1",
    [id],
  );
  if (!rows.length) throw new AppError('Không tìm thấy danh mục', 404);
  return rows[0];
};

exports.create = async (p) => {
  const slug = p.slug || slugify(p.name);
  const [r] = await pool.execute(
    'INSERT INTO categories(name,slug,description,image,display_order,status) VALUES(?,?,?,?,?,?)',
    [
      p.name,
      slug,
      p.description || null,
      p.image || null,
      Number(p.displayOrder || 0),
      p.status || 'ACTIVE',
    ],
  );
  return exports.detail(r.insertId);
};

exports.update = async (id, p) => {
  const old = await exports.detail(id);
  const name = p.name ?? old.name;
  const slug = p.slug || slugify(name);
  await pool.execute(
    'UPDATE categories SET name=?,slug=?,description=?,image=?,display_order=?,status=? WHERE id=?',
    [
      name,
      slug,
      p.description ?? old.description,
      p.image ?? old.image,
      Number(p.displayOrder ?? old.display_order),
      p.status ?? old.status,
      id,
    ],
  );
  return exports.detail(id);
};

exports.remove = async (id) => {
  const [used] = await pool.execute(
    "SELECT COUNT(*) total FROM products WHERE category_id=? AND status<>'DELETED'",
    [id],
  );
  if (used[0].total > 0)
    throw new AppError('Danh mục đang được sử dụng bởi sản phẩm nên chưa thể xóa', 409);
  const [r] = await pool.execute(
    "UPDATE categories SET status='DELETED' WHERE id=? AND status<>'DELETED'",
    [id],
  );
  if (!r.affectedRows) throw new AppError('Không tìm thấy danh mục', 404);
};
