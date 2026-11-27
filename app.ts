import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import errorHandler from './src/middleware/errorHandler.ts';
import notFoundHandler from './src/middleware/notFoundHandler.ts';
import authRoutes from './src/routes/auth.routes.ts';
import announcementsRoutes from './src/routes/announcements.routes.ts';
import { generateOpenApiDocument } from './src/openapi.ts';

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/announcements', announcementsRoutes);

const openApiDocument = generateOpenApiDocument();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server is running: http://localhost:${PORT}  |  docs: http://localhost:${PORT}/api-docs`);
});