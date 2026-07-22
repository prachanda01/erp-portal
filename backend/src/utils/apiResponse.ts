import { Response } from 'express';

export interface ApiResponsePayload<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  error?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  meta?: any,
  error?: any
) => {
  const payload: ApiResponsePayload<T> = {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
    ...(error !== undefined && { error }),
  };
  return res.status(statusCode).json(payload);
};

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  meta?: any,
  statusCode = 200
) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  error?: any
) => {
  return sendResponse(res, statusCode, false, message, undefined, undefined, error);
};
