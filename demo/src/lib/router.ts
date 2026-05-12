// Hash-router primitives. The shell (App.tsx) is the only place that
// reads window.location.hash; features call navigate(id) to request a
// route change without knowing the hash-route encoding.

export function navigate(id: string): void {
  window.location.hash = `#/${id}`;
}
