const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const STORAGE_KEYS = Object.freeze({
  news: "pravo-sport-news",
  challenges: "pravo-sport-challenges",
  events: "pravo-sport-events",
  results: "pravo-sport-results",
  joinedChallenges: "pravo-sport-joined",
  registeredEvents: "pravo-sport-registered",
  signedIn: "pravo-sport-signed",
  eventLog: "pravo-sport-event-log",
  syncQueue: "pravo-sport-sync-queue",
  communityActivities: "pravo-sport-community-activities",
  communityTeams: "pravo-sport-community-teams",
  communityBuddyRequests: "pravo-sport-community-buddy-requests",
  communityApplications: "pravo-sport-community-applications",
  rewardRedemptions: "pravo-sport-reward-redemptions",
  achievementClaims: "pravo-sport-achievement-claims",
});

export const DATA_MODE = API_BASE_URL ? "remote-ready" : "local-demo";

export function readData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function writeData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function createAnalyticsEvent(eventName, entityId = "", meta = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    eventName,
    entityId: String(entityId || ""),
    meta,
    ts: new Date().toISOString(),
    source: "web",
  };
}

function addToSyncQueue(event) {
  const queue = readData(STORAGE_KEYS.syncQueue, []);
  writeData(STORAGE_KEYS.syncQueue, [...queue, event].slice(-1000));
}

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("API is not configured");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function sendAnalyticsEvent(event) {
  if (!API_BASE_URL) {
    addToSyncQueue(event);
    return { queued: true, mode: DATA_MODE };
  }
  try {
    await request("/analytics/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
    return { queued: false, mode: DATA_MODE };
  } catch {
    addToSyncQueue(event);
    return { queued: true, mode: DATA_MODE };
  }
}

export async function flushAnalyticsQueue() {
  if (!API_BASE_URL) return { sent: 0, remaining: readData(STORAGE_KEYS.syncQueue, []).length };
  const queue = readData(STORAGE_KEYS.syncQueue, []);
  if (!queue.length) return { sent: 0, remaining: 0 };

  let sent = 0;
  const remaining = [];
  for (const event of queue) {
    try {
      await request("/analytics/events", {
        method: "POST",
        body: JSON.stringify(event),
      });
      sent += 1;
    } catch {
      remaining.push(event);
    }
  }
  writeData(STORAGE_KEYS.syncQueue, remaining);
  return { sent, remaining: remaining.length };
}

export const apiClient = {
  getHealth: () => request("/health"),
  getMe: () => request("/me"),
  listChallenges: () => request("/challenges"),
  joinChallenge: challengeId => request(`/challenges/${challengeId}/join`, { method: "POST" }),
  submitResult: (challengeId, payload) =>
    request(`/challenges/${challengeId}/results`, { method: "POST", body: JSON.stringify(payload) }),
  listEvents: () => request("/events"),
  registerForEvent: eventId => request(`/events/${eventId}/register`, { method: "POST" }),
  listNews: () => request("/news"),
  getAdminAnalytics: period => request(`/admin/analytics?period=${encodeURIComponent(period)}`),
  updateChallenge: (challengeId, payload) =>
    request(`/admin/challenges/${challengeId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  updateEvent: (eventId, payload) =>
    request(`/admin/events/${eventId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  updateNews: (newsId, payload) =>
    request(`/admin/news/${newsId}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
