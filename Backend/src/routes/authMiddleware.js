import jwt from 'jsonwebtoken';

const STAFF_ROLES = new Set(['admin', 'marketing', 'super_admin']);

export function normalizeRole(role) {
  if (role === 'admin') return 'marketing'; // legacy admin = marketing
  return role;
}

export function verifyAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Secure authorization token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    if (!STAFF_ROLES.has(decoded.role)) {
      return res.status(403).json({ error: 'Access denied. Account does not possess staff privileges.' });
    }
    req.admin = { ...decoded, role: normalizeRole(decoded.role) };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication credentials signature.' });
  }
}

/** Marketing + Super Admin (content: gallery, shop, community) */
export function requireMarketing(req, res, next) {
  verifyAdminToken(req, res, () => {
    const role = req.admin?.role;
    if (role !== 'marketing' && role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied. Marketing privileges required.' });
    }
    next();
  });
}

/** Super Admin only (CRM, tracking, members, orders) */
export function requireSuperAdmin(req, res, next) {
  verifyAdminToken(req, res, () => {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
    }
    next();
  });
}
