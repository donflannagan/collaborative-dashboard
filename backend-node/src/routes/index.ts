import { Router } from 'express';

const router = Router();

// Define routes here
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

export default router;
