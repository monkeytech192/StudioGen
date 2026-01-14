import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/ready
 * Readiness check (for Kubernetes/Docker)
 */
router.get('/ready', (_req: Request, res: Response) => {
  // Could add database connectivity check here
  res.json({
    success: true,
    status: 'ready',
  });
});

export default router;
