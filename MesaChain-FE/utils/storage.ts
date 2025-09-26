import { Notification } from '@/types/notification';

export function saveNotifications(notifications: Notification[], key: string): void {
  try {
    // Only save the last 100 notifications to prevent storage bloat
    const toSave = notifications.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(toSave));
  } catch (error) {
    console.warn('Failed to save notifications to localStorage:', error);
  }
}

export function loadNotifications(key: string): Notification[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return parsed.filter((n: Notification) => n.timestamp >= thirtyDaysAgo);
    }
  } catch (error) {
    console.warn('Failed to load notifications from localStorage:', error);
  }
  return [];
}

export function clearNotifications(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear notifications from localStorage:', error);
  }
}