// User service — håndterer registrering, opslag og favoritter for
// brugere på demo-siden.

export interface User {
  id: string;
  email: string;
  name: string;
  favorites: string[];
}

const users = new Map<string, User>();

// Pre-seedet demo-bruger så favorit-widget'en på forsiden har noget at vise.
users.set('demo@edc.dk', {
  id: 'demo-user',
  email: 'demo@edc.dk',
  name: 'Demo Bruger',
  favorites: ['strandvejen-12', 'hovedgaden-24']
});

export function registerUser(email: string, name: string): User {
  const id = crypto.randomUUID();
  const user: User = { id, email, name, favorites: [] };
  users.set(email.toLowerCase(), user);
  return user;
}

export function getUser(email: string): User | null {
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
