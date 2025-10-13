import { logger } from '../config/logger.js';
import { responseFormatter } from './responseFormatter.js';

export function handleError(res, error, status = 500) {
  logger.error(`[ErrorHandler] ${error.message}`);

  return res
    .status(status)
    .json(responseFormatter.error(error.message, status));
}