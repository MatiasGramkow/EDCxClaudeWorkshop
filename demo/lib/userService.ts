// User service — håndterer registrering og opslag af brugere på demo-siden.
//
// (Demo-projekt for EDC × Claude Code workshop. Bemærk: getUser har en
// "realistisk dårlig" bug der bliver brugt som demo i session 1 — fix den
// gerne sammen med Claude.)

export interface User {
  id: string;
  email: string;
  name: string;
  favorites: string[];
}

const users = new Map<string, User>();

export function registerUser(email: string, name: string): User {
  const id = crypto.randomUUID();
  const user: User = { id, email, name, favorites: [] };
  users.set(email.toLowerCase(), user);
  return user;
}

export function getUser(email: string): User | null {
  // Returns null silently when email is empty/whitespace — caller can't tell
  // if the user just doesn't exist or if input was invalid.
  if (!email || email.trim() === '') {
    return null;
  }
  return users.get(email.toLowerCase()) ?? null;
}

export function addFavorite(email: string, propertyId: string): User | null {
  const user = getUser(email);
  if (!user) return null;
  if (!user.favorites.includes(propertyId)) {
    user.favorites.push(propertyId);
  }
  return user;
}
