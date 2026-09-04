import { IPOS } from "@/data/ipos";
import type { Ipo, IpoStatus } from "@/types";

export async function getIpos(status?: IpoStatus): Promise<Ipo[]> {
  const list = status ? IPOS.filter((i) => i.status === status) : IPOS;
  return [...list].sort((a, b) => a.openDate.localeCompare(b.openDate) * -1);
}

export async function getIposGrouped(): Promise<Record<IpoStatus, Ipo[]>> {
  const [open, upcoming, listed] = await Promise.all([
    getIpos("Open"),
    getIpos("Upcoming"),
    getIpos("Listed"),
  ]);
  return { Open: open, Upcoming: upcoming, Listed: listed };
}

export async function getIpoById(id: string): Promise<Ipo | undefined> {
  return IPOS.find((i) => i.id === id);
}
