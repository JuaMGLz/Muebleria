// src/middlewares/auth.js (CJS)
const requireAuth = (req, res, next) => {
  if (req.session?.user) return next();
  return res.redirect("/login");
};

const requireAdmin = (req, res, next) => {
  if (req.session?.user?.administrador) return next();
  return res.status(403).render("403");
};

module.exports = { requireAuth, requireAdmin };



