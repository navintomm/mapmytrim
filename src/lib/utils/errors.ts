import { ErrorCode } from '@/types/errors';

export const getErrorMessage = (code: ErrorCode): string => {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.ACTIVE_CHECKIN]: 'You already have an active check-in. Please complete it first.',
    [ErrorCode.COOLDOWN]: 'Please wait 20 seconds before checking in again.',
    [ErrorCode.QUEUE_NEGATIVE]: 'Queue count cannot be negative.',
    [ErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action.',
    [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  };
  return messages[code] || 'An unexpected error occurred.';
};

export const extractErrorCode = (error: any): ErrorCode | null => {
  if (error?.code && Object.values(ErrorCode).includes(error.code)) {
    return error.code as ErrorCode;
  }
  if (error?.message) {
    for (const code of Object.values(ErrorCode)) {
      if (error.message.includes(code)) {
        return code;
      }
    }
  }
  return null;
};