export const env = {
  appName: process.env.APP_NAME || 'App',
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};
