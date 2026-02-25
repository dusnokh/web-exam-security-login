export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).send("Du skal være logget ind for at få adgang.");
  }
  next();
}