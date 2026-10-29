
import { supabase } from './supabase';

export const outletSchedules = [
  {
    id: 'naimarmoola',
    name: 'Naimarmoola',
    day: 6,
    hour: 9,
    minute: 0,
    closeHour: 22,
    closeMinute: 0,
  },
  {
    id: 'cherkala-new',
    name: 'Cherkala New',
    day: 2,
    hour: 9,
    minute: 0,
    closeHour: 22,
    closeMinute: 0,
  },
  {
    id: 'nellikatta',
    name: 'Nellikatta',
    day: 4,
    hour: 9,
    minute: 0,
    closeHour: 22,
    closeMinute: 0,
  },
  {
    id: 'cherkala',
    name: 'Cherkala',
    day: 2,
    hour: 9,
    minute: 0,
    closeHour: 22,
    closeMinute: 0,
  },
] as const;

export type OutletSchedule = (typeof outletSchedules)[number];

export type WeeklyOfferPoster = {
  id: string;
  outlet: string;
  title: string;
  storage_path: string;
  starts_at: string;
  expires_at: string;
  imageUrl: string;
};

export function getNextUpcomingOutlet(date = new Date()): OutletSchedule {
  const now = date.getTime();
  const next = outletSchedules.map((outlet) => {
    const start = new Date(date);
    const daysUntil = (outlet.day - date.getDay() + 7) % 7;
    start.setDate(date.getDate() + daysUntil);
    start.setHours(outlet.hour, outlet.minute, 0, 0);
    if (start.getTime() <= now) start.setDate(start.getDate() + 7);
    return { outlet, start: start.getTime() };
  }).sort((a, b) => a.start - b.start);
  return next[0].outlet;
}

export function getLiveOffers(date = new Date()) {
  const day = date.getDay();
  const minutes = date.getHours() * 60 + date.getMinutes();

  return outletSchedules.filter(
    (outlet) =>
      outlet.day === day &&
      minutes >= outlet.hour * 60 + outlet.minute &&
      minutes < outlet.closeHour * 60 + outlet.closeMinute
  );
}


export async function getWeeklyOfferPosters(outletId?: string) {
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const day = nowDate.getDay();
  const minutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  const activeOutlets = outletSchedules.filter(
    (outlet) =>
      outlet.day === day &&
      minutes >= 9 * 60 &&
      minutes < 22 * 60
  );

  // If this is a store page, only allow that outlet.
  if (outletId && !activeOutlets.some((outlet) => outlet.id === outletId)) {
    return [];
  }

  // On the homepage, only fetch posters from outlets active right now.
  const allowedOutlets = outletId
    ? [outletId]
    : activeOutlets.map((outlet) => outlet.id);

  if (allowedOutlets.length === 0) {
    return [];
  }

  let query = supabase
    .from("weekly_offer_posters")
    .select("id, outlet, title, storage_path, starts_at, expires_at")
    .lte("starts_at", now)
    .gt("expires_at", now)
    .in("outlet", allowedOutlets)
    .order("starts_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch weekly offer posters:", error.message);
    throw error;
  }

  return (data ?? []).map((poster) => ({
    ...poster,
    imageUrl: supabase.storage
      .from("weekly-offers")
      .getPublicUrl(poster.storage_path).data.publicUrl,
  }));
}

