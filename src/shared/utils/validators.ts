export const isEmail = (email: string): boolean =>
  /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
