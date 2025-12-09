export const validatePhone = (phone: string): boolean => {
  // Basic phone validation (10 digits)
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return cleaned;
};

export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};