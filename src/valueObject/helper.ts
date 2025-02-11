export const compareNullable = <T>(a: T | null, b: T | null): number => {
  if (a === null) {
    if (b === null) {
      return 0;
    }

    return 1;
  }

  return -1;
};
