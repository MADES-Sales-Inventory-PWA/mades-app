export const NOTIFICATIONS_REFRESH_EVENT = "mades:notifications:refresh";

export function dispatchNotificationsRefresh() {
  globalThis.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
}