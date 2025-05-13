export const checkJSON = (text: string): boolean => {
  if (typeof text !== 'string') {
    return false;
  }

  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};
