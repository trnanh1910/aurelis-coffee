const success = (
  res,
  { status = 200, message = 'Thành công', data = null, pagination = undefined },
) => {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
};
module.exports = { success };
