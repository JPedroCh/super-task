import type { AnalyticsEvent, AnalyticsEventName } from "./types";

const STORAGE_KEY = "mockPostHog:events";
const MAX_STORED_EVENTS = 500;

type Listener = (event: AnalyticsEvent) => void;

function safeSessionStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

/**
 * The in-memory + sessionStorage-backed event store standing in for
 * PostHog. Nothing here talks to a network — this is explicitly a mock,
 * and every call site that surfaces its data says so.
 */
class MockPostHog {
  private events: AnalyticsEvent[] = [];
  private listeners = new Set<Listener>();

  constructor() {
    this.events = this.loadFromStorage();
  }

  private loadFromStorage(): AnalyticsEvent[] {
    const storage = safeSessionStorage();
    if (!storage) return [];
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    const storage = safeSessionStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(this.events.slice(-MAX_STORED_EVENTS)));
    } catch {
      // Quota exceeded or storage disabled — events stay in memory only.
    }
  }

  capture(event: AnalyticsEvent): void {
    this.events.push(event);
    if (this.events.length > MAX_STORED_EVENTS) this.events.shift();
    this.persist();
    // Dev-only console trace of mock events — /mock-analytics is the
    // supported way to inspect them; production builds stay quiet.
    if (import.meta.env.DEV) {
      console.info("[Mock PostHog]", event.event, event.properties);
    }
    for (const listener of this.listeners) listener(event);
  }

  getEvents(): readonly AnalyticsEvent[] {
    return this.events;
  }

  getEventsByName<Name extends AnalyticsEventName>(name: Name): AnalyticsEvent<Name>[] {
    return this.events.filter((e): e is AnalyticsEvent<Name> => e.event === name);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear(): void {
    this.events = [];
    this.persist();
  }
}

export const mockPostHog = new MockPostHog();
