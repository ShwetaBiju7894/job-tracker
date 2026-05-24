const { pool } = require('../config/db');

// GET /api/analytics/summary
const getSummary = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*)                                                          AS total,
        COUNT(*) FILTER (WHERE status = 'applied')                       AS applied,
        COUNT(*) FILTER (WHERE status = 'phone_screen')                  AS phone_screen,
        COUNT(*) FILTER (WHERE status = 'interview')                     AS interview,
        COUNT(*) FILTER (WHERE status = 'offer')                         AS offers,
        COUNT(*) FILTER (WHERE status = 'rejected')                      AS rejected,
        COUNT(*) FILTER (WHERE status = 'withdrawn')                     AS withdrawn,
        ROUND(
          COUNT(*) FILTER (WHERE status NOT IN ('applied','withdrawn'))::NUMERIC
          / NULLIF(COUNT(*), 0) * 100, 1
        )                                                                 AS response_rate
       FROM applications WHERE user_id = $1`,
      [req.user.id]
    );

    const interviews = await pool.query(
      `SELECT COUNT(*) AS total_interviews
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       WHERE a.user_id = $1`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          ...result.rows[0],
          total_interviews: interviews.rows[0].total_interviews,
        },
      },
    });
  } catch (error) { next(error); }
};

// GET /api/analytics/weekly
const getWeeklyTrend = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
        TO_CHAR(applied_date, 'Mon DD') AS week,
        DATE_TRUNC('week', applied_date) AS week_start,
        COUNT(*) AS applications
       FROM applications
       WHERE user_id = $1
         AND applied_date >= NOW() - INTERVAL '8 weeks'
       GROUP BY DATE_TRUNC('week', applied_date), TO_CHAR(applied_date, 'Mon DD')
       ORDER BY week_start ASC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: { weekly: result.rows },
    });
  } catch (error) { next(error); }
};

// GET /api/analytics/pipeline
const getPipeline = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM applications
       WHERE user_id = $1
       GROUP BY status`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: { pipeline: result.rows },
    });
  } catch (error) { next(error); }
};

module.exports = { getSummary, getWeeklyTrend, getPipeline };