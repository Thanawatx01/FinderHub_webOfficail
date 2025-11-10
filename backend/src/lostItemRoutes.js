const express = require('express');

const { pool } = require('./db');
const authMiddleware = require('./middleware/auth');

const router = express.Router();

const LOST_ITEM_STATUSES = new Set(['lost', 'found', 'returned']);

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

function normalizeTags(tags) {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return null;
}

function mapLostItemRow(row) {
  let parsedTags = null;
  if (row.tags) {
    try {
      parsedTags = JSON.parse(row.tags);
      if (!Array.isArray(parsedTags)) {
        parsedTags = null;
      }
    } catch {
      parsedTags = null;
    }
  }

  return {
    id: row.id.toString(),
    title: row.title,
    description: row.description,
    status: row.status,
    location: row.location ?? null,
    imageUrl: row.image_url ?? null,
    contactName: row.contact_name ?? null,
    contactPhone: row.contact_phone ?? null,
    tags: parsedTags,
    reportedAt: row.reported_at ? new Date(row.reported_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, title, description, status, location, image_url, contact_name, contact_phone, tags, reported_at, updated_at
       FROM lost_item
       ORDER BY COALESCE(reported_at, created_at) DESC, id DESC`,
    );
    const items = rows.map(mapLostItemRow);
    res.json({ items });
  } catch (error) {
    console.error('Fetch lost items error', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลประกาศได้' });
  } finally {
    connection.release();
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, title, description, status, location, image_url, contact_name, contact_phone, tags, reported_at, updated_at
       FROM lost_item
       WHERE id = ?`,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'ไม่พบประกาศที่ต้องการ' });
    }

    res.json({ item: mapLostItemRow(rows[0]) });
  } catch (error) {
    console.error('Fetch lost item error', error);
    res.status(500).json({ message: 'ไม่สามารถดึงรายละเอียดประกาศได้' });
  } finally {
    connection.release();
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const {
    title,
    description,
    status = 'lost',
    location,
    imageUrl,
    contactName,
    contactPhone,
    tags,
    reportedAt,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'กรุณาระบุชื่อและรายละเอียดประกาศ' });
  }

  if (!LOST_ITEM_STATUSES.has(status)) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
  }

  const normalizedTags = normalizeTags(tags);
  const reportedAtValue = reportedAt ? new Date(reportedAt) : null;
  const userId = req.user?.userId ?? req.user?.id ?? null;

  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `INSERT INTO lost_item
        (title, description, status, location, image_url, contact_name, contact_phone, tags, reported_at, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        status,
        location || null,
        imageUrl || null,
        contactName || null,
        contactPhone || null,
        normalizedTags ? JSON.stringify(normalizedTags) : null,
        reportedAtValue,
        userId,
        userId,
      ],
    );

    const insertedId = result.insertId;
    const [rows] = await connection.query(
      `SELECT id, title, description, status, location, image_url, contact_name, contact_phone, tags, reported_at, updated_at
       FROM lost_item
       WHERE id = ?`,
      [insertedId],
    );

    res.status(201).json({ item: mapLostItemRow(rows[0]) });
  } catch (error) {
    console.error('Create lost item error', error);
    res.status(500).json({ message: 'ไม่สามารถบันทึกประกาศได้' });
  } finally {
    connection.release();
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    location,
    imageUrl,
    contactName,
    contactPhone,
    tags,
    reportedAt,
  } = req.body;

  if (status && !LOST_ITEM_STATUSES.has(status)) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
  }

  const normalizedTags = normalizeTags(tags);
  const reportedAtValue = reportedAt ? new Date(reportedAt) : null;
  const userId = req.user?.userId ?? req.user?.id ?? null;

  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `UPDATE lost_item
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           status = COALESCE(?, status),
           location = ?,
           image_url = ?,
           contact_name = ?,
           contact_phone = ?,
           tags = ?,
           reported_at = ?,
           updated_by = ?
       WHERE id = ?`,
      [
        title || null,
        description || null,
        status || null,
        location || null,
        imageUrl || null,
        contactName || null,
        contactPhone || null,
        normalizedTags ? JSON.stringify(normalizedTags) : null,
        reportedAtValue,
        userId,
        id,
      ],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'ไม่พบประกาศที่ต้องการแก้ไข' });
    }

    const [rows] = await connection.query(
      `SELECT id, title, description, status, location, image_url, contact_name, contact_phone, tags, reported_at, updated_at
       FROM lost_item
       WHERE id = ?`,
      [id],
    );

    res.json({ item: mapLostItemRow(rows[0]) });
  } catch (error) {
    console.error('Update lost item error', error);
    res.status(500).json({ message: 'ไม่สามารถแก้ไขประกาศได้' });
  } finally {
    connection.release();
  }
});

module.exports = router;


