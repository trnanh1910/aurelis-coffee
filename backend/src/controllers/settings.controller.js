const fs = require('fs/promises');
const path = require('path');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');

const logoPath = path.join(__dirname, '../../uploads/brand-logo.svg');
const heroImagePath = path.join(__dirname, '../../uploads/hero-background.webp');
const managedImages = {
  story: path.join(__dirname, '../../uploads/story-image.webp'),
  closing: path.join(__dirname, '../../uploads/closing-image.webp'),
  menuHero: path.join(__dirname, '../../uploads/menu-hero.webp'),
  storyHero: path.join(__dirname, '../../uploads/story-hero.webp'),
  storyCraft: path.join(__dirname, '../../uploads/story-craft.webp'),
  storesHero: path.join(__dirname, '../../uploads/stores-hero.webp'),
  reservationHero: path.join(__dirname, '../../uploads/reservation-hero.webp'),
};

const getManagedImagePath = (slot) => {
  if (!Object.hasOwn(managedImages, slot)) throw new AppError('Vị trí ảnh không hợp lệ.', 404);
  return managedImages[slot];
};

exports.getManagedImage = asyncHandler(async (req, res) => {
  const imagePath = getManagedImagePath(req.params.slot);
  try {
    const file = await fs.stat(imagePath);
    return success(res, {
      message: 'Đã tải ảnh',
      data: { url: `/uploads/${path.basename(imagePath)}?v=${file.mtimeMs}` },
    });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return success(res, { message: 'Chưa có ảnh tùy chỉnh', data: { url: null } });
  }
});

exports.uploadManagedImage = asyncHandler(async (req, res) => {
  const imagePath = getManagedImagePath(req.params.slot);
  if (!req.file) throw new AppError('Vui lòng chọn ảnh.', 400);
  const buffer = req.file.buffer;
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new AppError('Tệp ảnh WEBP không hợp lệ.', 400);
  }
  await fs.mkdir(path.dirname(imagePath), { recursive: true });
  await fs.writeFile(imagePath, buffer);
  const file = await fs.stat(imagePath);
  return success(res, {
    message: 'Đã cập nhật ảnh',
    data: { url: `/uploads/${path.basename(imagePath)}?v=${file.mtimeMs}` },
  });
});

exports.removeManagedImage = asyncHandler(async (req, res) => {
  const imagePath = getManagedImagePath(req.params.slot);
  await fs.rm(imagePath, { force: true });
  return success(res, { message: 'Đã khôi phục ảnh mặc định', data: { url: null } });
});

const heroImageUrl = (mtimeMs) => `/uploads/hero-background.webp?v=${mtimeMs}`;

exports.getHeroImage = asyncHandler(async (_req, res) => {
  try {
    const file = await fs.stat(heroImagePath);
    return success(res, {
      message: 'Đã tải ảnh nền Hero',
      data: { url: heroImageUrl(file.mtimeMs) },
    });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return success(res, { message: 'Chưa có ảnh nền Hero tùy chỉnh', data: { url: null } });
  }
});

exports.uploadHeroImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Vui lòng chọn ảnh nền.', 400);
  const buffer = req.file.buffer;
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new AppError('Tệp ảnh WEBP không hợp lệ.', 400);
  }

  await fs.mkdir(path.dirname(heroImagePath), { recursive: true });
  await fs.writeFile(heroImagePath, buffer);
  const file = await fs.stat(heroImagePath);
  return success(res, {
    message: 'Đã cập nhật ảnh nền Hero',
    data: { url: heroImageUrl(file.mtimeMs) },
  });
});

exports.removeHeroImage = asyncHandler(async (_req, res) => {
  await fs.rm(heroImagePath, { force: true });
  return success(res, { message: 'Đã khôi phục ảnh nền mặc định', data: { url: null } });
});

exports.getBrandLogo = asyncHandler(async (_req, res) => {
  try {
    const file = await fs.stat(logoPath);
    return success(res, {
      message: 'Lấy logo thương hiệu thành công',
      data: { url: `/uploads/brand-logo.svg?v=${file.mtimeMs}` },
    });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return success(res, { message: 'Chưa có logo thương hiệu', data: { url: null } });
  }
});

exports.uploadBrandLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Vui lòng chọn tệp logo SVG.', 400);

  const uploadedSvg = req.file.buffer
    .toString('utf8')
    .replace(/^\uFEFF/, '')
    .trim();
  const standardSvgDoctype =
    /<!DOCTYPE\s+svg(?:\s+PUBLIC\s+(?:"[^"]*"|'[^']*')\s+(?:"[^"]*"|'[^']*')|\s+SYSTEM\s+(?:"[^"]*"|'[^']*'))?\s*>/i;
  const svg = uploadedSvg.replace(standardSvgDoctype, '').trim();
  const hasSvgRoot = /^(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg\b[\s\S]*<\/svg>\s*$/i.test(
    svg,
  );
  const hasUnsafeMarkup =
    /<!DOCTYPE|<!ENTITY|<\s*script\b|<\s*foreignObject\b|\son[a-z0-9_-]+\s*=|javascript:/i.test(
      svg,
    );
  const hasExternalReference =
    /(?:href|src)\s*=\s*(["'])\s*(?:https?:|\/\/|file:|data:(?!image\/(?:png|jpe?g|webp|gif);base64,))/i.test(
      svg,
    ) ||
    /url\(\s*(["']?)\s*(?:https?:|\/\/|file:|javascript:|data:(?!image\/(?:png|jpe?g|webp|gif);base64,))/i.test(
      svg,
    );

  if (!hasSvgRoot || hasUnsafeMarkup || hasExternalReference) {
    throw new AppError('Tệp SVG không hợp lệ hoặc chứa nội dung không an toàn.', 400);
  }

  await fs.mkdir(path.dirname(logoPath), { recursive: true });
  await fs.writeFile(logoPath, svg, 'utf8');
  const file = await fs.stat(logoPath);
  return success(res, {
    message: 'Đã cập nhật logo thương hiệu',
    data: { url: `/uploads/brand-logo.svg?v=${file.mtimeMs}` },
  });
});

exports.removeBrandLogo = asyncHandler(async (_req, res) => {
  await fs.rm(logoPath, { force: true });
  return success(res, { message: 'Đã khôi phục logo mặc định', data: { url: null } });
});
