import type { CreateAnnouncementBody, UpdateAnnouncementBody } from '../validators/announcements.validator.ts';
import  prisma  from '../../prisma/client.ts';

const PER_PAGE = 10;

const includeAuthor = {
  user: { select: { id: true, username: true, email: true, name: true } },
} as const;

export const getAnnouncements = async (
  _req: Request,
  res: Response<unknown, { query: ListQuery }>,
) =>{
  const { page, search, sort } = res.locals.query;

  const where = search
    ? { title: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      include: includeAuthor,
      orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.announcement.count({ where }),
  ]);

  res.status(200).json({
    data,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / PER_PAGE),
      perPage: PER_PAGE,
    },
  });
}

export const getAnnouncementById = async(
  _req: Request,
  res: Response<unknown, { params: IdParams }>,
) => {
  const { id } = res.locals.params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: includeAuthor,
  });

  if (!announcement) {
    res.status(404).json({ message: 'Announcement not found' });
    return;
  }

  res.status(200).json(announcement);
}

export const createAnnouncement = async(req: Request, res: Response) => {
  const body = req.body as CreateAnnouncementBody;

  const announcement = await prisma.announcement.create({
    data: { ...body, userId: req.user!.sub },
    include: includeAuthor,
  });

  res.status(201).json(announcement);
}

export const updateAnnouncement = async (
  req: Request,
  res: Response<unknown, { params: IdParams }>,
) =>{
  const { id } = res.locals.params;
  const body = req.body as UpdateAnnouncementBody;

  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) {
    res.status(404).json({ message: 'Announcement not found' });
    return;
  }
  if (announcement.userId !== req.user!.sub) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: body,
    include: includeAuthor,
  });

  res.status(200).json(updated);
}

export const deleteAnnouncement = async (
  _req: Request,
  res: Response<unknown, { params: IdParams }>,
) => {
  const { id } = res.locals.params;

  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) {
    res.status(404).json({ message: 'Announcement not found' });
    return;
  }
  if (announcement.userId !== req.user!.sub) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  await prisma.announcement.delete({ where: { id } });
  res.status(204).end();
}