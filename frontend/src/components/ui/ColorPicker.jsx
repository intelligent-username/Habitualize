import React from "react";
import { COLOR_OPTIONS } from "../../utils/constants";

/**
 * ColorPicker - A component for selecting habit colors
 * Shows a color preview button and expandable color grid
 */
const ColorPicker = ({ 
    color, 
    setColor, 
    showColorGrid, 
    setShowColorGrid, 
    colorBtnRef 
}) => {
    return (
        <div style={{ display: "flex", alignItems: "center", marginTop: "1rem", position: "relative" }}>
            <label className="habit-form-label" style={{ margin: 0 }}>Color</label>
            <button
                type="button"
                ref={colorBtnRef}
                className="color-preview-btn"
                style={{
                    background: COLOR_OPTIONS.find(opt => opt.value === color)?.hex || "#9e9e9e",
                    marginLeft: "0.75rem",
                    border: color === "gray" ? "2px solid #ccc" : "2px solid var(--accent)"
                }}
                onClick={() => setShowColorGrid(v => !v)}
                aria-label="Pick color"
            />
            {showColorGrid && (
                <div
                    className="color-grid-popup"
                    onMouseDown={e => e.stopPropagation()}
                >
                    <div className="color-grid">
                        {COLOR_OPTIONS.map(opt => (
                            <button
                                type="button"
                                key={opt.value}
                                className={`color-square${color === opt.value ? " selected" : ""}`}
                                style={{ background: opt.hex }}
                                onClick={() => {
                                    setColor(opt.value);
                                    setShowColorGrid(false);
                                }}
                                aria-label={opt.name}
                            >
                                {color === opt.value && <span className="color-check">&#10003;</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPicker;
