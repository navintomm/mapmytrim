import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

export const createCheckIn = httpsCallable(functions, 'createCheckIn');
export const checkoutCustomer = httpsCallable(functions, 'checkoutCustomer');
export const toggleStylistDuty = httpsCallable(functions, 'toggleStylistDuty');
export const adjustSalonQueue = httpsCallable(functions, 'adjustSalonQueue');
export const submitSalonRating = httpsCallable(functions, 'submitSalonRating');