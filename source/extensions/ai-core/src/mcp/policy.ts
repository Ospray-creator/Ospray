export type Policy = { allowedPaths: string[]; maxBytes: number };
export function isPathAllowed(p: string, policy: Policy): boolean {
  const norm = p.replace(/\\/g,'/').toLowerCase();
  return policy.allowedPaths.some(ap => norm.startsWith(ap.replace(/\\/g,'/').toLowerCase()));
}
