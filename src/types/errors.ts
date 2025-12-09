export enum ErrorCode {
  ACTIVE_CHECKIN = 'ERR_ACTIVE_CHECKIN',
  COOLDOWN = 'ERR_COOLDOWN',
  QUEUE_NEGATIVE = 'ERR_QUEUE_NEGATIVE',
  UNAUTHORIZED = 'ERR_UNAUTHORIZED',
  NOT_FOUND = 'ERR_NOT_FOUND',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}