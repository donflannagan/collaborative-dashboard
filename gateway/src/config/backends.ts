export interface BackendConfig {
  name: string;
  prefix: string;
  target: string;
  port: number;
  forwardPrefix: string;
}

export const backends: BackendConfig[] = [
  {
    name: 'Node.js Backend',
    prefix: '/api/node',
    target: `http://${process.env.NODE_BACKEND_HOST || 'localhost'}:${process.env.NODE_BACKEND_PORT || '5000'}`,
    port: 5000,
    forwardPrefix: '/api',
  },
  {
    name: 'FastAPI Backend',
    prefix: '/api/fastapi',
    target: `http://${process.env.FASTAPI_BACKEND_HOST || 'localhost'}:${process.env.FASTAPI_BACKEND_PORT || '5001'}`,
    port: 5001,
    forwardPrefix: '',
  },
  {
    name: 'Java Backend',
    prefix: '/api/java',
    target: `http://${process.env.JAVA_BACKEND_HOST || 'localhost'}:${process.env.JAVA_BACKEND_PORT || '5002'}`,
    port: 5002,
    forwardPrefix: '/api',
  },
  {
    name: 'C# Backend',
    prefix: '/api/csharp',
    target: `http://${process.env.CSHARP_BACKEND_HOST || 'localhost'}:${process.env.CSHARP_BACKEND_PORT || '5003'}`,
    port: 5003,
    forwardPrefix: '/api',
  },
];

export const getBackendByPrefix = (path: string): BackendConfig | undefined => {
  return backends.find((backend) => path.startsWith(backend.prefix));
};

export const stripPrefixFromPath = (path: string, prefix: string): string => {
  return path.slice(prefix.length);
};
