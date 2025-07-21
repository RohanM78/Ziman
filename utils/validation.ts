export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true };
};

export const validateFullName = (fullName: string): { isValid: boolean; error?: string } => {
  if (!fullName.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  if (fullName.trim().length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' };
  }
  
  return { isValid: true };
};

export const validatePhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid US phone number (10 digits)
  if (digitsOnly.length !== 10) {
    return { isValid: false, error: 'Please enter a valid 10-digit phone number' };
  }
  
  return { isValid: true };
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

export const validateSignUpForm = (
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string,
  phoneNumber: string
): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error!;
  }
  
  const confirmPasswordValidation = validatePasswordConfirmation(password, confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error!;
  }
  
  const fullNameValidation = validateFullName(fullName);
  if (!fullNameValidation.isValid) {
    errors.fullName = fullNameValidation.error!;
  }
  
  const phoneNumberValidation = validatePhoneNumber(phoneNumber);
  if (!phoneNumberValidation.isValid) {
    errors.phoneNumber = phoneNumberValidation.error!;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignInForm = (email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error!;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};