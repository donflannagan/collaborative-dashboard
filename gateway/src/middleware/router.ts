import { Request, Response, NextFunction } from 'express';
import httpProxy from 'http-proxy';
import { getBackendByPrefix, stripPrefixFromPath } from '../config/backends';

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  const response = res as any;
  response.status(503).json({
    success: false,
    error: 'Backend service unavailable',
  });
});

export const gatewayRouter = (req: Request, res: Response, next: NextFunction) => {
  const backend = getBackendByPrefix(req.path);

  if (!backend) {
    return res.status(404).json({
      success: false,
      error: `No backend found for path: ${req.path}. Available: /api/node, /api/fastapi, /api/java`,
    });
  }

  // Strip the prefix from the path
  const strippedPath = stripPrefixFromPath(req.path, backend.prefix);

  // Rewrite the request path because http-proxy appends req.url to the target.
  const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  req.url = `${backend.forwardPrefix}${strippedPath}${query}`;

  console.log(`[Gateway] Routing ${req.method} ${req.path} → ${backend.name} (${backend.target}${req.url})`);

  // Proxy the request
  proxy.web(req, res, { target: backend.target });
};
