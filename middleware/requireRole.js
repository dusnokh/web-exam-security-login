export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.session?.user?.role;

    if (!role) {
      return res.status(401).send("Du skal være logget ind for at få adgang.");
    }

    if (!allowedRoles.includes(role)) {
      return res
        .status(403)
        .send("Adgang nægtet. Du har ikke de nødvendige rettigheder.");
    }

    next();
  };
}