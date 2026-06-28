import jwt from 'jsonwebtoken';

export function verifyAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extracts "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Secure authorization token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Account does not possess admin privileges.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication credentials signature.' });
  }
}