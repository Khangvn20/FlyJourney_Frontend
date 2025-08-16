// Date helpers for booking flow

/** Compute age in years given ISO date (YYYY-MM-DD) */
export function computeAge(isoDob: string): number {
  const dob = new Date(isoDob);
  if (Number.isNaN(dob.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const mDiff = now.getMonth() - dob.getMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

/** Convert ISO date (YYYY-MM-DD) to backend dd/MM/yyyy */
export function isoToBackendDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Convert possible dd/MM/yyyy to ISO (YYYY-MM-DD) */
export function backendToIsoDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  }
  return dateStr;
}
