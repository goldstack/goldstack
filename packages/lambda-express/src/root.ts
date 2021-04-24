import { Request, Response } from 'express';

export const rootHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json('success');
};
