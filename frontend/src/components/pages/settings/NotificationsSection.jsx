import React from 'react';
import { notificationManager } from '../../../utils/notifications.js';

const NotificationsSection = ({
  notificationSettings,
  handleNotificationChange,
  addNotificationTime,
  removeNotificationTime,
  updateNotificationTime,
  requestNotificationPermission
}) => {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2>Notifications</h2>
        <p>Set up reminder notifications to help you stay on track with your habits.</p>
      </div>

      {/* Enable Notifications Toggle */}
      <div className="settings-field-grid">
        <div className="settings-field-label">Daily Reminders</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label">Daily Reminders</label>
          <div className="toggle-switch-wrapper">
            <div
              className={`toggle-switch appearance-toggle ${notificationSettings.enabled ? 'toggled-on' : ''}`}
              onClick={() => {
                if (!notificationSettings.enabled && notificationManager.permission !== 'granted') {
                  requestNotificationPermission();
                } else {
                  handleNotificationChange('enabled', !notificationSettings.enabled);
                }
              }}
              role="button"
              aria-pressed={notificationSettings.enabled}
              tabIndex={0}
            >
              <div className="knob"></div>
            </div>
            <span className="toggle-switch-label">
              {notificationSettings.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {notificationManager.permission === 'denied' && (
            <span className="settings-info" style={{color: 'var(--danger)'}}>
              Notifications blocked. Please enable in browser settings.
            </span>
          )}
        </div>
      </div>

      {notificationSettings.enabled && (
        <>
          {/* Notification Type */}
          <div className="settings-field-grid">
            <div className="settings-field-label">Reminder Type</div>
            <div className="settings-input-wrapper">
              <label className="settings-input-label">Reminder Type</label>
              <div className="settings-select-wrapper">
                <select 
                  className="settings-select"
                  value={notificationSettings.type}
                  onChange={(e) => handleNotificationChange('type', e.target.value)}
                >
                  <option value="interval">Regular Intervals</option>
                  <option value="specific">Specific Times</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interval Settings */}
          {notificationSettings.type === 'interval' && (
            <>
              <div className="settings-field-grid">
                <div className="settings-field-label">Reminder Interval</div>
                <div className="settings-input-wrapper">
                  <label className="settings-input-label">Every X hours</label>
                  <div className="settings-input-group">
                    <input 
                      className="settings-input"
                      type="number"
                      min="0.1"
                      max="24"
                      step="0.1"
                      value={notificationSettings.intervalHours}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleNotificationChange('intervalHours', val === '' ? '' : parseFloat(val));
                      }}
                    />
                  </div>
                  <span className="settings-info">
                    Send reminders every {notificationSettings.intervalHours} hour{Number(notificationSettings.intervalHours) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="settings-field-grid">
                <div className="settings-field-label">Active Hours</div>
                <div className="settings-input-wrapper">
                  <label className="settings-input-label">Start Time</label>
                  <div className="settings-input-group">
                    <input 
                      className="settings-input"
                      type="time"
                      value={notificationSettings.startTime}
                      onChange={(e) => handleNotificationChange('startTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="settings-field-grid">
                <div className="settings-field-label"></div>
                <div className="settings-input-wrapper">
                  <label className="settings-input-label">End Time</label>
                  <div className="settings-input-group">
                    <input 
                      className="settings-input"
                      type="time"
                      value={notificationSettings.endTime}
                      onChange={(e) => handleNotificationChange('endTime', e.target.value)}
                    />
                  </div>
                  <span className="settings-info">
                    Reminders will only be sent between {notificationSettings.startTime} and {notificationSettings.endTime}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Specific Times Settings */}
          {notificationSettings.type === 'specific' && (
            <div className="settings-field-grid">
              <div className="settings-field-label">Reminder Times</div>
              <div className="settings-input-wrapper">
                <label className="settings-input-label">Specific Times</label>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  {notificationSettings.times.map((time, index) => (
                    <div key={index} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <div className="settings-input-group" style={{flex: 1}}>
                        <input 
                          className="settings-input"
                          type="time"
                          value={time}
                          onChange={(e) => updateNotificationTime(index, e.target.value)}
                        />
                      </div>
                      {notificationSettings.times.length > 1 && (
                        <button 
                          type="button"
                          className="settings-btn secondary"
                          onClick={() => removeNotificationTime(index)}
                          style={{padding: '0.5rem', minWidth: 'auto'}}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button"
                    className="settings-btn secondary"
                    onClick={addNotificationTime}
                    style={{alignSelf: 'flex-start'}}
                  >
                    + Add Time
                  </button>
                  <span className="settings-info">
                    {notificationSettings.times.length} reminder{notificationSettings.times.length !== 1 ? 's' : ''} per day
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Test Notification */}
          <div className="settings-field-grid">
            <div className="settings-field-label">Test</div>
            <div className="settings-input-wrapper">
              <label className="settings-input-label">Test Notification</label>
              <button 
                type="button"
                className="settings-btn secondary"
                onClick={() => {
                  notificationManager.showNotification('Test Notification', {
                    body: 'Your notification settings are working correctly!'
                  });
                }}
              >
                Send Test Notification
              </button>
              <span className="settings-info">
                Click to test your notification settings
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default NotificationsSection;
