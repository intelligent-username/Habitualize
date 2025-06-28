// PlaceholderCard.jsx
import React from 'react';
import './PlaceholderCard.css';

const PlaceholderCard = ({ title, description, info, extra }) => (
  <div className="placeholder-card-container">
    <h1>{title}</h1>
    <p>{description}</p>
    {info && <div className="placeholder-card-info">{info}</div>}
    {extra && <div className="placeholder-card-extra">{extra}</div>}
  </div>
);

export default PlaceholderCard;