export const dummyUser = (): string => {
  return 'dummy';
};

export const sessionUser = (sessionId: string): string => {
  return `session:${sessionId}`;
};
