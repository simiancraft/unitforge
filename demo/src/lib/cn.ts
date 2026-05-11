// Class-name merger: clsx for conditional/array assembly, tailwind-merge
// for resolving Tailwind's "last wins" conflicts across utility classes.
// Use cn() for every dynamic className in the demo so style overrides
// compose deterministically.

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
