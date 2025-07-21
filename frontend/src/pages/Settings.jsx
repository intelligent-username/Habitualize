import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../hooks/useSettings.js';
import { useCategories } from '../hooks/useCategories.js';
import { COLOR_OPTIONS } from '../utils/constants.js';
import { 
  notificationManager, 
  getNotificationSettings, 
  updateNotificationSettings 
} from '../utils/notifications.js';
import PersonalizationSection from '../components/pages/settings/PersonalizationSection.jsx';
import AppearanceSection from '../components/pages/settings/AppearanceSection.jsx';
import NotificationsSection from '../components/pages/settings/NotificationsSection.jsx';
import DataSection from '../components/pages/settings/DataSection.jsx';
import '../styles/settings.css';

const SettingsPage = () => {
  // console.log('[SettingsPage] Component rendering');
  
  const { 
    settings, 
    isLoading: settingsLoading, 
    updateSettings, 
    getDefaultHabitColor,
    getDefaultCategoryId,
    getWeekStartDay,  
    getDefaultHabitIcon,
    getDefaultHabitType,
    getTheme,
    getShowHabitIcons,
    getFilterCompletedToBottom
  } = useSettings();
  
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  // console.log('[SettingsPage] Hook results - settings:', settings, 'categories:', categories, 'settingsLoading:', settingsLoading, 'categoriesLoading:', categoriesLoading);
  
  // Simple initial state - will be populated from backend
  const [formData, setFormData] = useState({
    default_habit_color: 'gray',
    default_category_id: 1,
    week_start_day: 0,
    default_habit_icon: 'default.svg',
    default_habit_type: 'normal',
    theme: 'dark',
    showHabitIcons: true,
    filterCompletedToBottom: false
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState(null);
  
  const [showColorGrid, setShowColorGrid] = useState(false);
  const [activeTab, setActiveTab] = useState('personalization');
  const colorBtnRef = useRef(null);


  useEffect(() => {
    document.title = "Settings Page";
  }, []);
  
  // Apply theme immediately when it changes
  useEffect(() => {
    if (formData.theme) {
      // console.log(`[SettingsPage] Applying theme: ${formData.theme}`);
      // This would actually apply the theme in a real implementation
      // For now, just a placeholder for the future theme implementation
    }
  }, [formData.theme]);

  // Load settings from backend ONCE - don't replace state, just populate missing values
  useEffect(() => {
    if (settings && settings.length > 0) {
      // console.log('[SettingsPage] Loading settings from backend:', settings);
      const updates = {};
      let notifSettings = null;
      settings.forEach(setting => {
        const key = setting.key.toLowerCase();
        let value = setting.value;
        // console.log(`[SettingsPage] Processing setting: ${setting.key} = ${setting.value} (type: ${setting.setting_type})`);
        
        if (key === 'notification_settings') {
          notifSettings = JSON.parse(value);
          return;
        }

        if (setting.setting_type === 'integer') value = parseInt(value, 10);
        else if (setting.setting_type === 'boolean') value = value === 'true';
        
        const frontendKey = key === 'show_habit_icons' ? 'showHabitIcons'
          : key === 'filter_completed_to_bottom' ? 'filterCompletedToBottom'
          : key;
        updates[frontendKey] = value;
        // console.log(`[SettingsPage] Mapped ${key} -> ${frontendKey} = ${value}`);
      });
      // console.log('[SettingsPage] Applying updates:', updates);
      setFormData(prev => ({ ...prev, ...updates }));
      if (notifSettings) {
        // console.log('[SettingsPage] Applying notification settings:', notifSettings);
        setNotificationSettings(notifSettings);
      } else {
        // Fallback to default notification settings if not found
        const defaultNotificationSettings = {
          "enabled": false,
          "type": "interval",
          "intervalHours": 6,
          "startTime": "09:00",
          "endTime": "22:00",
          "times": ["09:00", "18:00"]
        };
        // console.log('[SettingsPage] Using default notification settings');
        setNotificationSettings(defaultNotificationSettings);
      }
    }
  }, [settings?.length]); // Only run when settings count changes, not on every refetch

  // Only update backend if value actually changed
  const handleInputChange = (key, value) => {
    // console.log(`[SettingsPage] handleInputChange called - key: ${key}, value: ${value}, current: ${formData[key]}`);
    
    if (formData[key] === value) {
      // console.log(`[SettingsPage] Value unchanged, skipping update`);
      return; // Don't update if same value
    }
    
    // console.log(`[SettingsPage] Updating state and backend for ${key}`);
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Map to backend key
    const backendKey = key === 'showHabitIcons' ? 'show_habit_icons'
      : key === 'filterCompletedToBottom' ? 'filter_completed_to_bottom'
      : key;
    
    const settingValue = typeof value === 'boolean' ? String(value) : value;
    // console.log(`[SettingsPage] Sending to backend - key: ${backendKey}, value: ${settingValue}`);
    updateSettings({ [backendKey]: settingValue });
  };

  // Handle notification settings changes
  const handleNotificationChange = (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    
    // Update backend - send the object directly, not stringified
    updateSettings({ 'notification_settings': newSettings });

    // Update the notification manager
    if (newSettings.enabled) {
      notificationManager.scheduleNotifications(newSettings);
    } else {
      notificationManager.clearSchedule();
    }
  };

  // Handle adding/removing specific notification times
  const addNotificationTime = () => {
    const newTimes = [...notificationSettings.times, '12:00'];
    handleNotificationChange('times', newTimes);
  };

  const removeNotificationTime = (index) => {
    if (notificationSettings.times.length > 1) {
      const newTimes = notificationSettings.times.filter((_, i) => i !== index);
      handleNotificationChange('times', newTimes);
    }
  };

  const updateNotificationTime = (index, newTime) => {
    const newTimes = [...notificationSettings.times];
    newTimes[index] = newTime;
    handleNotificationChange('times', newTimes);
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    await notificationManager.requestPermission();
    if (notificationManager.permission === 'granted') {
      handleNotificationChange('enabled', true);
    }
  };

  if (settingsLoading || categoriesLoading || !notificationSettings) {
    // console.log('[SettingsPage] Still loading - settingsLoading:', settingsLoading, 'categoriesLoading:', categoriesLoading, 'notificationSettings', notificationSettings);
    return (
      <div className="settings-container">
        <div className="settings-content-wrapper">
          <div className="settings-header">
            <div className="settings-title-section">
              <h1>Settings</h1>
            </div>
          </div>
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  // console.log('[SettingsPage] Rendering form with formData:', formData);

  return (
    <div className="settings-container">
      <div className="settings-content-wrapper">
        <div className="settings-header">
          <div className="settings-title-section">
            <h1>Settings</h1>
            <div className="settings-navigation">
              <button 
                className={`settings-nav-item ${activeTab === 'personalization' ? 'active' : ''}`}
                onClick={() => setActiveTab('personalization')}
              >
                Personalization
              </button>
              <button 
                className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                Appearance
              </button>
              <button 
                className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
              <button 
                className={`settings-nav-item ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                Data
              </button>
            </div>
          </div>
        </div>

      <form className="settings-form">
        {/* PERSONALIZATION SECTION */}
        {activeTab === 'personalization' && (
          <PersonalizationSection
            formData={formData}
            categories={categories}
            handleInputChange={handleInputChange}
            showColorGrid={showColorGrid}
            setShowColorGrid={setShowColorGrid}
            colorBtnRef={colorBtnRef}
          />
        )}

        {/* APPEARANCE SECTION */}
        {activeTab === 'appearance' && (
          <AppearanceSection
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        {/* NOTIFICATIONS SECTION */}
        {activeTab === 'notifications' && (
          <NotificationsSection
            notificationSettings={notificationSettings}
            handleNotificationChange={handleNotificationChange}
            addNotificationTime={addNotificationTime}
            removeNotificationTime={removeNotificationTime}
            updateNotificationTime={updateNotificationTime}
            requestNotificationPermission={requestNotificationPermission}
          />
        )}

        {/* DATA SECTION */}
        {activeTab === 'data' && (
          <DataSection />
        )}

        <div className="settings-actions">
          <div className="settings-info-message">
            All changes are saved automatically.
          </div>
          <div className="settings-info-message">
            Some might require a refresh to see.
          </div>
        </div>
      </form>
      </div>
    </div>
  );
};

export default SettingsPage;
