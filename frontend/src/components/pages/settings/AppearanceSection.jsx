import React from 'react';

const AppearanceSection = ({ formData, handleInputChange }) => {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2>Appearance</h2>
        <p>Customize the look and feel of your application.</p>
      </div>

      <div className="settings-field-grid">
        <div className="settings-field-label">Theme</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label">Theme</label>
          <div className="toggle-switch-wrapper">
            <div 
              className={`toggle-switch theme-toggle ${formData.theme === 'light' ? 'toggled-on' : ''}`}
              onClick={() => {
                const newTheme = formData.theme === 'light' ? 'dark' : 'light';
                console.log(`[AppearanceSection] theme toggle clicked - current: ${formData.theme}, will change to: ${newTheme}`);
                handleInputChange('theme', newTheme);
              }}
            >
              <div className={`knob ${formData.theme === 'light' ? 'sun' : 'moon'}`}></div>
            </div>
            <span className="toggle-switch-label">{formData.theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </div>
      </div>

      <div className="settings-field-grid">
        <div className="settings-field-label">Habit Icons</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label">Habit Icons</label>
          <div className="toggle-switch-wrapper">
            <div
              className={`toggle-switch appearance-toggle ${formData.showHabitIcons ? 'toggled-on' : ''}`}
              onClick={() => {
                console.log(`[AppearanceSection] showHabitIcons toggle clicked - current: ${formData.showHabitIcons}, will change to: ${!formData.showHabitIcons}`);
                handleInputChange('showHabitIcons', !formData.showHabitIcons);
              }}
              role="button"
              aria-pressed={formData.showHabitIcons}
              tabIndex={0}
            >
              <div className="knob"></div>
            </div>
            <span className="toggle-switch-label">{formData.showHabitIcons ? 'Shown' : 'Hidden'}</span>
          </div>
        </div>
      </div>

      <div className="settings-field-grid">
        <div className="settings-field-label">Filter Completed to bottom</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label">Filter completed to bottom</label>
          <div className="toggle-switch-wrapper">
            <div
              className={`toggle-switch appearance-toggle ${formData.filterCompletedToBottom ? 'toggled-on' : ''}`}
              onClick={() => {
                console.log(`[AppearanceSection] filterCompletedToBottom toggle clicked - current: ${formData.filterCompletedToBottom}, will change to: ${!formData.filterCompletedToBottom}`);
                handleInputChange('filterCompletedToBottom', !formData.filterCompletedToBottom);
              }}
              role="button"
              aria-pressed={formData.filterCompletedToBottom}
              tabIndex={0}
            >
              <div className="knob"></div>
            </div>
            <span className="toggle-switch-label">{formData.filterCompletedToBottom ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppearanceSection;
