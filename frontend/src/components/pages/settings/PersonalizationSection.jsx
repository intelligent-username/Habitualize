import React from 'react';
import IconPicker from '../../ui/IconPicker.jsx';
import ColorPicker from '../../ui/ColorPicker.jsx';

const PersonalizationSection = ({
  formData,
  categories,
  handleInputChange,
  showColorGrid,
  setShowColorGrid,
  colorBtnRef
}) => {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2>Personal Defaults</h2>
        <p>Configure your default settings for new habits and preferences.</p>
      </div>

      <div className="settings-field-grid">
        <div className="settings-field-label">Default Habit Color</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label">Default Habit Color</label>
          <div className="settings-color-picker-wrapper">
            <ColorPicker
              color={formData.default_habit_color}
              setColor={(color) => handleInputChange('default_habit_color', color)}
              showColorGrid={showColorGrid}
              setShowColorGrid={setShowColorGrid}
              colorBtnRef={colorBtnRef}
            />
          </div>
        </div>
      </div>

      <div className="settings-field-grid">
        <div className="settings-field-label required">Default Category</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label required">Default Category</label>
          <div className="settings-select-wrapper">
            <select 
              className="settings-select"
              value={formData.default_category_id || 1}
              onChange={(e) => handleInputChange('default_category_id', e.target.value)}
            >
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="settings-field-grid">
        <div className="settings-field-label">Week Start Day</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label">Week Start Day</label>
          <div className="settings-select-wrapper">
            <select 
              className="settings-select"
              value={formData.week_start_day || 0}
              onChange={(e) => handleInputChange('week_start_day', e.target.value)}
            >
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-field-grid">
        <div className="settings-field-label">Default Icon</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label">Default Icon</label>
          <IconPicker 
            selectedIcon={formData.default_habit_icon} 
            onSelect={(icon) => handleInputChange('default_habit_icon', icon)} 
          />
        </div>
      </div>

      <div className="settings-field-grid">
        <div className="settings-field-label">Default Habit Type</div>
        <div className="settings-input-wrapper">
          <label className="settings-input-label">Default Habit Type</label>
          <div className="settings-select-wrapper">
            <select 
              className="settings-select"
              value={formData.default_habit_type || 'normal'}
              onChange={(e) => handleInputChange('default_habit_type', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="cumulative">Cumulative</option>
              <option value="sequence">Sequence</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalizationSection;
