import { Router } from 'express';
import authenticate from '../middleware/authenticate.ts';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.ts';
import { idParamsSchema, errorSchema } from '../validators/common.validator.ts';
import {
  listQuerySchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementSchema,
  announcementListSchema 
} from '../validators/announcements.validator.ts';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcements.controller.ts';
import { registry, bearerAuth, jsonContent } from '../openapi.ts';


const router = Router();

const security = [{ [bearerAuth.name]: [] }];

router.get('/', validateQuery(listQuerySchema), getAnnouncements);
router.get('/:id', validateParams(idParamsSchema), getAnnouncementById);
router.post('/', authenticate, validateBody(createAnnouncementSchema), createAnnouncement);
router.patch(
  '/:id',
  authenticate,
  validateParams(idParamsSchema),
  validateBody(updateAnnouncementSchema),
  updateAnnouncement,
);
router.delete('/:id', authenticate, validateParams(idParamsSchema), deleteAnnouncement);


registry.registerPath({
  method: 'get',
  path: '/announcements',
  tags: ['Announcements'],
  summary: 'List of ads (pagination, search, sorting)',
  request: { query: listQuerySchema },
  responses: {
    200: { description: 'List', content: jsonContent(announcementListSchema) },
    400: { description: 'Invalid query parameters', content: jsonContent(errorSchema) },
  },
});

registry.registerPath({
  method: 'get',
  path: '/announcements/{id}',
  tags: ['Announcements'],
  summary: 'Announcement by ID',
  request: { params: idParamsSchema },
  responses: {
    200: { description: 'Announcement', content: jsonContent(announcementSchema) },
    404: { description: 'Not found', content: jsonContent(errorSchema) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/announcements',
  tags: ['Announcements'],
  summary: 'Create announcement',
  security,
  request: { body: { content: jsonContent(createAnnouncementSchema) } },
  responses: {
    201: { description: 'Created', content: jsonContent(announcementSchema) },
    400: { description: 'Validation error', content: jsonContent(errorSchema) },
    401: { description: 'Not authenticated', content: jsonContent(errorSchema) },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/announcements/{id}',
  tags: ['Announcements'],
  summary: 'Partially update your announcement',
  security,
  request: {
    params: idParamsSchema,
    body: { content: jsonContent(createAnnouncementSchema.partial()) },
  },
  responses: {
    200: { description: 'Updated', content: jsonContent(announcementSchema) },
    400: { description: 'Validation error / empty body', content: jsonContent(errorSchema) },
    401: { description: 'Not authenticated', content: jsonContent(errorSchema) },
    403: { description: 'Access denied', content: jsonContent(errorSchema) },
    404: { description: 'Not found', content: jsonContent(errorSchema) },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/announcements/{id}',
  tags: ['Announcements'],
  summary: 'Delete your announcement',
  security,
  request: { params: idParamsSchema },
  responses: {
    204: { description: 'Deleted' },
    401: { description: 'Not authenticated', content: jsonContent(errorSchema) },
    403: { description: 'Access denied', content: jsonContent(errorSchema) },
    404: { description: 'Not found', content: jsonContent(errorSchema) },
  },
});

export default router;