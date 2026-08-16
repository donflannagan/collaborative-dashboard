import express from 'express';
import router from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(router);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
