import React from 'react';
import '../styles/settings.css';

// THIS IS A COMPLETE DUMMY PAGE FOR NOW.
// NO API calls whatsoever

const SettingsPage = () => (
  <div className="page-container">
    <h1 className="page-title">Settings</h1>
    <form className="settings-form page-content">
      {/* Section: Personalization */}
      <section className="settings-section">
        <h2>Personalization</h2>
        <div className="settings-row">
          <label>Default Color:</label>
          <input type="color" name="defaultColor" />
        </div>
        <div className="settings-row">
          <label>Default Category:</label>
          <select name="defaultCategory">
            <option>Choose...</option>
            {/* Categories will be populated dynamically */}
          </select>
        </div>
        <div className="settings-row">
          <label>Week Start Day:</label>
          <select name="weekStart">
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
          </select>
        </div>
        <div className="settings-row">
          <label>Default Icon:</label>
          <input type="text" name="defaultIcon" placeholder="e.g. 🌱" />
        </div>
        <div className="settings-row">
          <label>Default Habit Type:</label>
          <select name="defaultHabitType">
            <option value="simple">Simple</option>
            <option value="cumulative">Cumulative</option>
            <option value="sequence">Sequence</option>
          </select>
        </div>
      </section>

      {/* Section: Appearance */}
      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-row">
          <label>Theme:</label>
          <select name="theme">
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      {/* Section: Notifications */}
      <section className="settings-section">
        <h2>Notifications</h2>
        <div className="settings-row">
          <label>Default Reminder Interval:</label>
          <input type="number" name="reminderInterval" min="1" max="1440" placeholder="Minutes before" />
        </div>
        <div className="settings-row">
          <label>Timezone:</label>
          <select name="timezone">
            <option>Auto (System/GPS)</option>
            {/* Populate with timezones */}
          </select>
        </div>
        <div className="settings-row">
          <label>Custom Notification Text:</label>
          <input type="text" name="customNotification" placeholder="e.g. Don't forget your habit!" />
        </div>
      </section>

      {/* Section: Data Management */}
      <section className="settings-section">
        <h2>Data Management</h2>
        <div className="settings-row">
          <button type="button" className="settings-btn">Import Data (JSON)</button>
          <button type="button" className="settings-btn">Export Data (JSON)</button>
        </div>
        <div className="settings-row">
          <button type="button" className="settings-btn danger">Delete All Data</button>
          <span className="settings-info">You can download your data before deletion. (Size: 0.0 MB)</span>
        </div>
      </section>

      <div className="settings-actions">
        <button type="submit" className="settings-btn primary">Save Settings</button>
      </div>
    </form>
  </div>
);

export default SettingsPage;
