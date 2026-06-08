// Lightweight client-side tracking: localStorage event log + GA4/Meta/TikTok pixel forwarding.

export type TrackEventName =
  | "page_view"
  | "task_view"
  | "task_select"
  | "task_start"
  | "task_done"
  | "affiliate_click"
  | "payout_click"
  | "cta_click";

export type TrackPayload = {
  taskId?: string;
  reward?: number;
  url?: string;
  source?: string;
  [k: string]: unknown;
};

type StoredEvent = TrackPayload & {
  event: TrackEventName;
  ts: number;
};

const KEY = "zadaniomat:track:v1";
const SID_KEY = "zadaniomat:sid:v1";
const MAX_EVENTS = 500;

function getSid(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid =
      "s_" +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36);
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

function readLog(): StoredEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLog(log: StoredEvent[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(log.slice(-MAX_EVENTS)));
  } catch {
    /* quota */
  }
}

const listeners = new Set<() => void>();
export function subscribeTracking(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: unknown) => void };
  }
}

export function track(event: TrackEventName, payload: TrackPayload = {}) {
  if (typeof window === "undefined") return;
  const entry: StoredEvent = { event, ts: Date.now(), ...payload };

  // local log
  const log = readLog();
  log.push(entry);
  writeLog(log);
  listeners.forEach((l) => l());

  // GA4 / GTM dataLayer (works even without gtag)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, sid: getSid(), ...payload });

  // Meta Pixel
  try {
    if (typeof window.fbq === "function") {
      const fbMap: Partial<Record<TrackEventName, string>> = {
        affiliate_click: "Lead",
        task_start: "InitiateCheckout",
        task_done: "CompleteRegistration",
        payout_click: "Purchase",
      };
      const fbEvent = fbMap[event];
      if (fbEvent) window.fbq("track", fbEvent, payload);
      else window.fbq("trackCustom", event, payload);
    }
  } catch {
    /* noop */
  }

  // TikTok Pixel
  try {
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track(event, payload);
    }
  } catch {
    /* noop */
  }

  // Dev-friendly console
  if (typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[track]", event, payload);
  }
}

export function getTrackingLog(): StoredEvent[] {
  return readLog();
}

export function clearTrackingLog() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

export function getTrackingSummary() {
  const log = readLog();
  const totals = {
    affiliate_click: 0,
    task_done: 0,
    task_start: 0,
    payout_click: 0,
  } as Record<string, number>;
  const perTask: Record<string, { clicks: number; done: number; reward: number }> = {};
  for (const e of log) {
    totals[e.event] = (totals[e.event] ?? 0) + 1;
    if (e.taskId) {
      perTask[e.taskId] ||= { clicks: 0, done: 0, reward: 0 };
      if (e.event === "affiliate_click") perTask[e.taskId].clicks++;
      if (e.event === "task_done") {
        perTask[e.taskId].done++;
        perTask[e.taskId].reward += Number(e.reward || 0);
      }
    }
  }
  return { totals, perTask, count: log.length, sid: getSid() };
}
