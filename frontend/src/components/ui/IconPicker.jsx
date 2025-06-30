import React, { useState, useEffect } from 'react';
import Icon from './Icon';

// Use Vite's import.meta.glob to get all the icons
const iconModules = import.meta.glob('/public/icons/*.svg');

const IconPicker = ({ onSelect, selectedIcon }) => {
  const [icons, setIcons] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // The keys of iconModules are the paths to the icons
    // e.g., '/public/icons/activity.svg'
    // We just need the filename, so we'll extract it.
    const iconNames = Object.keys(iconModules).map(path => path.split('/').pop());
    // console.log('IconPicker: Dynamically loaded icons:', iconNames);
    setIcons(iconNames);
  }, []);

  const handleSelect = (icon) => {
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
