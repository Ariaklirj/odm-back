// TEMPORARY - env recovery endpoint. To remove: delete this file + 2 lines in routes/index.js + SUPER_SECRET_TOKEN in deploy.yml
const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  const token = req.headers['x-secret-token'];
  if (!token || token !== process.env.SUPER_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const env = Object.entries(process.env)
    .filter(([key]) => !key.startsWith('npm_') && !key.startsWith('NODE'))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  res.json(env);
});

module.exports = router;
