import React from 'react';

const Icon = ({ iconName, className, alt }) => {
  const iconUrl = `/icons/${iconName}`;
  const defaultIconUrl = '/icons/default.svg';

  const handleError = (e) => {
    // Prevent infinite loop if default.svg is missing
    if (!e.target.src.endsWith('default.svg')) {
      e.target.src = defaultIconUrl;
    }
  };

  return (
    <img
      src={iconUrl}
      alt={alt || `${iconName} icon`}
      className={className}
      onError={handleError}
    />
  );
};

export default Icon;
