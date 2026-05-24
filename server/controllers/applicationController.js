const { pool } = require('../config/db');

// GET /api/applications
const getApplications = async (req, res, next) => {
  try {
    const { status, search, work_type } = req.query;

    let query = `
      SELECT a.*,
        (SELECT COUNT(*) FROM interviews i WHERE i.application_id = a.id) AS interview_count,
        (SELECT COUNT(*) FROM contacts  c WHERE c.application_id = a.id) AS contact_count
      FROM applications a
      WHERE a.user_id = $1
    `;

    const params = [req.user.id];
    let   idx    = 2;

    if (status) {
      query += ` AND a.status = $${idx++}`;
      params.push(status);
    }

    if (work_type) {
      query += ` AND a.work_type = $${idx++}`;
      params.push(work_type);
    }

    if (search) {
      query += ` AND (a.company ILIKE $${idx} OR a.role ILIKE $${idx++})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY a.applied_date DESC, a.created_at DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: { applications: result.rows },
    });
  } catch (error) { next(error); }
};

// GET /api/applications/:id
const getApplication = async (req, res, next) => {
  try {
    const [appRes, interviewRes, contactRes] = await Promise.all([
      pool.query('SELECT * FROM applications WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]),
      pool.query('SELECT * FROM interviews WHERE application_id=$1 ORDER BY interview_date ASC', [req.params.id]),
      pool.query('SELECT * FROM contacts  WHERE application_id=$1', [req.params.id]),
    ]);

    if (appRes.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Application not found' });

    res.status(200).json({
      success: true,
      data: {
        application: appRes.rows[0],
        interviews:  interviewRes.rows,
        contacts:    contactRes.rows,
      },
    });
  } catch (error) { next(error); }
};

// POST /api/applications
const createApplication = async (req, res, next) => {
  try {
    const {
      company, role, status, applied_date, salary_min, salary_max,
      job_url, location, work_type, resume_version, cover_letter,
      notes, follow_up_date,
    } = req.body;

    if (!company || !role)
      return res.status(400).json({ success: false, message: 'Company and role are required' });

    const result = await pool.query(
      `INSERT INTO applications
        (user_id, company, role, status, applied_date, salary_min, salary_max,
         job_url, location, work_type, resume_version, cover_letter, notes, follow_up_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        req.user.id, company, role,
        status       || 'applied',
        applied_date || new Date().toISOString().split('T')[0],
        salary_min   || null,
        salary_max   || null,
        job_url      || null,
        location     || null,
        work_type    || 'onsite',
        resume_version || null,
        cover_letter || false,
        notes        || null,
        follow_up_date || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Application added successfully',
      data: { application: result.rows[0] },
    });
  } catch (error) { next(error); }
};

// PUT /api/applications/:id
const updateApplication = async (req, res, next) => {
  try {
    const {
      company, role, status, applied_date, salary_min, salary_max,
      job_url, location, work_type, resume_version, cover_letter,
      notes, follow_up_date,
    } = req.body;

    const existing = await pool.query(
      'SELECT id FROM applications WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Application not found' });

    const result = await pool.query(
      `UPDATE applications SET
        company=$1, role=$2, status=$3, applied_date=$4,
        salary_min=$5, salary_max=$6, job_url=$7, location=$8,
        work_type=$9, resume_version=$10, cover_letter=$11,
        notes=$12, follow_up_date=$13, updated_at=NOW()
       WHERE id=$14 AND user_id=$15
       RETURNING *`,
      [
        company, role, status, applied_date,
        salary_min || null, salary_max || null,
        job_url || null, location || null,
        work_type, resume_version || null,
        cover_letter, notes || null,
        follow_up_date || null,
        req.params.id, req.user.id,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Application updated',
      data: { application: result.rows[0] },
    });
  } catch (error) { next(error); }
};

// PATCH /api/applications/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['applied','phone_screen','interview','offer','rejected','withdrawn'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const result = await pool.query(
      `UPDATE applications SET status=$1, updated_at=NOW()
       WHERE id=$2 AND user_id=$3 RETURNING *`,
      [status, req.params.id, req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Application not found' });

    res.status(200).json({
      success: true,
      message: 'Status updated',
      data: { application: result.rows[0] },
    });
  } catch (error) { next(error); }
};

// DELETE /api/applications/:id
const deleteApplication = async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM applications WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Application not found' });

    res.status(200).json({ success: true, message: 'Application deleted' });
  } catch (error) { next(error); }
};

module.exports = {
  getApplications, getApplication, createApplication,
  updateApplication, updateStatus, deleteApplication,
};