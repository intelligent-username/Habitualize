/**
 * Web Notifications utility for Habitualize
 * Handles notification permissions, scheduling, and management
 */

export class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
    this.scheduledTimeouts = new Map();
    this.intervalIds = new Map();
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Check if notifications are supported and permitted
   */
  isAvailable() {
    return 'Notification' in window && this.permission === 'granted';
  }

  /**
   * Show a notification
   */
  showNotification(title, options = {}) {
    if (!this.isAvailable()) return null;

    const defaultOptions = {
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'habitualize-reminder',
      requireInteraction: false,
      ...options
    };

    return new Notification(title, defaultOptions);
  }

  /**
   * Clear all scheduled notifications
   */
  clearAllScheduled() {
    // Clear timeouts
    this.scheduledTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.scheduledTimeouts.clear();

    // Clear intervals
    this.intervalIds.forEach(intervalId => clearInterval(intervalId));
    this.intervalIds.clear();
  }

  /**
   * Schedule notifications based on settings
   */
  scheduleNotifications(settings) {
    this.clearAllScheduled();

    if (!settings.enabled || !this.isAvailable()) return;

    if (settings.type === 'interval') {
      this.scheduleIntervalNotifications(settings);
    } else if (settings.type === 'specific') {
      this.scheduleSpecificTimeNotifications(settings);
    }
  }

  /**
   * Schedule interval-based notifications
   */
  scheduleIntervalNotifications(settings) {
    const { intervalHours, startTime, endTime } = settings;
    
    const scheduleNext = () => {
      const now = new Date();
      const nextTime = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
      
      // Check if next time is within allowed hours
      const nextHour = nextTime.getHours();
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      
      if (nextHour >= startHour && nextHour <= endHour) {
        const timeoutId = setTimeout(() => {
          this.showNotification('Reminder to check your habits', {
            body: 'Take a moment to update your habit progress.',
          });
          scheduleNext(); // Schedule the next one
        }, intervalHours * 60 * 60 * 1000);
        
        this.scheduledTimeouts.set('interval', timeoutId);
      } else {
        // If outside allowed hours, schedule for next day's start time
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(startHour, 0, 0, 0);
        
        const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
        const timeoutId = setTimeout(() => {
          scheduleNext();
        }, timeUntilTomorrow);
        
        this.scheduledTimeouts.set('next-day', timeoutId);
      }
    };

    // Start scheduling
    scheduleNext();
  }

  /**
   * Schedule specific time notifications
   */
  scheduleSpecificTimeNotifications(settings) {
    const { times } = settings;
    
    times.forEach((time, index) => {
      this.scheduleSpecificTime(time, index);
    });
  }

  /**
   * Schedule a notification for a specific time daily
   */
  scheduleSpecificTime(timeString, index) {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const scheduleDaily = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const timeUntilNotification = scheduledTime.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        this.showNotification('Check your habits!', {
          body: 'Time for your habit check-in!',
        });
        
        // Schedule for next day
        scheduleDaily();
      }, timeUntilNotification);
      
      this.scheduledTimeouts.set(`specific-${index}`, timeoutId);
    };

    scheduleDaily();
  }

  /**
   * Get default notification settings
   */
  static getDefaultSettings() {
    return {
      enabled: false,
      type: 'interval', // 'interval' or 'specific'
      intervalHours: 6,
      startTime: '06:00',
      endTime: '22:00',
      times: ['06:00', '12:00', '18:00'], // for specific times
    };
  }
}

// Global instance
export const notificationManager = new NotificationManager();

/**
 * Initialize notifications from settings
 */
export function initializeNotifications(settings) {
  const notificationSettings = settings || NotificationManager.getDefaultSettings();
  notificationManager.scheduleNotifications(notificationSettings);
}

/**
 * Update notification settings
 */
export function updateNotificationSettings(newSettings) {
  // Save to localStorage for persistence
  localStorage.setItem('habitualize_notifications', JSON.stringify(newSettings));
  
  // Apply the new settings
  notificationManager.scheduleNotifications(newSettings);
}

/**
 * Get notification settings from localStorage
 */
export function getNotificationSettings() {
  try {
    const saved = localStorage.getItem('habitualize_notifications');
    return saved ? JSON.parse(saved) : NotificationManager.getDefaultSettings();
  } catch (e) {
    return NotificationManager.getDefaultSettings();
  }
}
