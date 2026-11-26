import type { CreateAnnouncementBody, UpdateAnnouncementBody } from '../validators/announcements.validator.ts';
import  prisma  from '../../prisma/client.ts';

const includeAuthor = {
  user: { select: { id: true, username: true, email: true, name: true } },
} as const;

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
  
  await prisma.announcement.delete({ where: { id } });
  res.status(204).end();
}