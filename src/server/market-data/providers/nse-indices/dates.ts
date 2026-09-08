const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export interface NseDate {
  /** `DDMMYYYY`, the indices close file's date format. */
  ddmmyyyy: string;
  /** `YYYY-MM-DD`. */
  iso: string;
}

/**
 * The calendar date `daysAgo` days before `now`, in India Standard Time —
 * the timezone NSE's trading day and file names are defined in, regardless of
 * where this process runs. India has no daylight-saving offset, so a fixed
 * +05:30 shift is exact rather than approximate.
 */
export function nseDate(now: number, daysAgo: number): NseDate {
  const shifted = new Date(now + IST_OFFSET_MS - daysAgo * 86_400_000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const pad = (value: number) => String(value).padStart(2, "0");

  return {
    ddmmyyyy: `${pad(day)}${pad(month)}${year}`,
    iso: `${year}-${pad(month)}-${pad(day)}`,
  };
}
