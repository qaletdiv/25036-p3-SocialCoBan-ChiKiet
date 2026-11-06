import { USERNAME_CHANGE_COOLDOWN_MS } from "@/constants/username";

// Null when the username can be changed now, including accounts that have never changed it
export const nextUsernameChangeAt = (changedAt: string | null): Date | null => {
  if (!changedAt) return null;
  const availableAt = new Date(new Date(changedAt).getTime() + USERNAME_CHANGE_COOLDOWN_MS);
  return availableAt.getTime() > Date.now() ? availableAt : null;
};
