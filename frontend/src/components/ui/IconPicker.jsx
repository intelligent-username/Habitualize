import React, { useState, useEffect } from 'react';
import Icon from './Icon';

// Use Vite's import.meta.glob to get all the icons
const iconModules = import.meta.glob('/public/icons/*.svg');

const IconPicker = ({ onSelect, selectedIcon }) => {
  console.log('[IconPicker] Component rendering with selectedIcon:', selectedIcon);
  const [icons, setIcons] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('[IconPicker] useEffect - loading icons');
    // The keys of iconModules are the paths to the icons
    // e.g., '/public/icons/activity.svg'
    const iconNames = Object.keys(iconModules).map(path => path.split('/').pop());
    console.log('[IconPicker] Found icons:', iconNames.length, 'icons');
    setIcons(iconNames);
  }, []);

  const handleSelect = (icon) => {
    console.log('[IconPicker] Icon selected:', icon);
    onSelect(icon);
    setIsOpen(false);
  };

  return (
    <div className="icon-picker">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="icon-picker-button">
        <Icon iconName={selectedIcon} alt="Selected Icon" className="selected-icon" />
      </button>
      {isOpen && (
        <div className="icon-list-container">
          <div className="icon-list">
            {icons.map((icon) => (
              <div key={icon} className="icon-item" onClick={() => handleSelect(icon)}>
                <Icon iconName={icon} alt={`${icon} icon`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
