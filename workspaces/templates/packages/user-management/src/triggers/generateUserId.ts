import { v7 } from 'uuid';

export function generateUserId(): string {
  return v7();
}
