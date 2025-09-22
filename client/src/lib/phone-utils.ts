// Phone number utilities for E.164 format handling

/**
 * Converts various phone number formats to clean E.164 format
 * @param phone - Input phone number in any format
 * @returns Clean E.164 formatted phone number (e.g., +447564723762)
 */
export function formatToE164(phone: string): string {
  if (!phone) return '';
  
  // Remove any existing spaces, hyphens, parentheses, or formatting
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // UK mobile numbers (07... with 11 digits) - convert to +44 format
  if (cleanPhone.match(/^07\d{9}$/)) {
    return `+44${cleanPhone.slice(1)}`; // Remove leading 0, add +44
  }
  
  // UK landline numbers (01... or 02... with 11 digits) - convert to +44 format
  if (cleanPhone.match(/^0[12]\d{9}$/)) {
    return `+44${cleanPhone.slice(1)}`; // Remove leading 0, add +44
  }
  
  // International format starting with +44 - already correct, just ensure no spaces
  if (cleanPhone.match(/^\+44\d{10}$/)) {
    return cleanPhone; // Already in correct E.164 format
  }
  
  // International format starting with 0044 - convert to +44
  if (cleanPhone.match(/^0044\d{10}$/)) {
    return `+44${cleanPhone.slice(4)}`; // Remove 0044, add +44
  }
  
  // For any other international format, ensure it starts with +
  if (cleanPhone.match(/^\d{10,15}$/) && !cleanPhone.startsWith('+')) {
    // Assume it's a UK number missing country code if it's 10-11 digits
    if (cleanPhone.length === 10 && cleanPhone.startsWith('7')) {
      return `+44${cleanPhone}`; // UK mobile without leading 0
    }
    if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      return `+44${cleanPhone.slice(1)}`; // UK number with leading 0
    }
    // For other patterns, return as-is
    return cleanPhone;
  }
  
  return cleanPhone;
}

/**
 * Validates if a phone number is in valid E.164 format
 * @param phone - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidE164(phone: string): boolean {
  if (!phone) return false;
  
  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+\d{1,15}$/;
  return e164Regex.test(phone);
}

/**
 * Validates if a phone number can be converted to E.164 format
 * @param phone - Phone number to validate
 * @returns true if phone number is valid and can be formatted
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's already valid E.164
  if (isValidE164(cleanPhone)) return true;
  
  // Check if it's a valid UK number that can be converted
  if (cleanPhone.match(/^07\d{9}$/)) return true; // UK mobile
  if (cleanPhone.match(/^0[12]\d{9}$/)) return true; // UK landline
  if (cleanPhone.match(/^0044\d{10}$/)) return true; // International 0044
  if (cleanPhone.match(/^\d{10}$/) && cleanPhone.startsWith('7')) return true; // UK mobile without 0
  if (cleanPhone.match(/^\d{11}$/) && cleanPhone.startsWith('0')) return true; // UK with 0
  
  return false;
}

/**
 * Gets an error message for invalid phone numbers
 * @param phone - Phone number to validate
 * @returns Error message or null if valid
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone) return 'Phone number is required';
  
  if (!isValidPhoneNumber(phone)) {
    return 'Please enter a valid UK phone number (e.g., +447564723762, 07564723762, or 02081234567)';
  }
  
  return null;
}

/**
 * Format phone number for display with spaces for readability
 * @param phone - E.164 phone number
 * @returns Formatted phone number with spaces
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // If it's E.164 format starting with +44
  if (cleanPhone.match(/^\+44\d{10}$/)) {
    const numberPart = cleanPhone.slice(3); // Remove +44
    if (numberPart.startsWith('7')) {
      // Mobile: +44 7xxx xxx xxx
      return `+44 ${numberPart.slice(0, 4)} ${numberPart.slice(4, 7)} ${numberPart.slice(7)}`;
    } else {
      // Landline: +44 xxxx xxx xxx
      return `+44 ${numberPart.slice(0, 4)} ${numberPart.slice(4, 7)} ${numberPart.slice(7)}`;
    }
  }
  
  return phone;
}