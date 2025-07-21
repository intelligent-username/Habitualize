import React, { useState } from 'react';
import apiService from '../../../services/api.js';

const DataSection = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await apiService.exportData();
      // Success message is handled by the download
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async (downloadFirst = false) => {
    try {
      setIsClearing(true);
      
      if (downloadFirst) {
        // Export data first
        await apiService.exportData();
        // Small delay to ensure download started
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Clear the data
      await apiService.clearData();
      setShowClearConfirm(false);
      
      alert('All data has been cleared successfully. The page will reload.');
      // Reload the page to reflect the cleared state
      window.location.reload();
      
    } catch (error) {
      console.error('Clear data failed:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const ClearConfirmDialog = () => {
    if (!showClearConfirm) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'var(--background)',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--danger)' }}>
            ⚠️ Clear All Data
          </h3>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text)' }}>
            This will permanently erase all your habits, sequences, categories, pomodoro sessions, and settings. 
            This action cannot be undone.
          </p>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text)' }}>
            Would you like to download your data first?
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="settings-btn primary"
              onClick={() => handleClearData(true)}
              disabled={isClearing}
            >
              {isClearing ? 'Processing...' : 'Download & Clear'}
            </button>
            <button 
              type="button"
              className="settings-btn"
              style={{backgroundColor: 'var(--danger)'}}
              onClick={() => handleClearData(false)}
              disabled={isClearing}
            >
              {isClearing ? 'Clearing...' : 'Clear Without Download'}
            </button>
            <button 
              type="button"
              className="settings-btn secondary"
              onClick={() => setShowClearConfirm(false)}
              disabled={isClearing}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="settings-section">
        <div className="settings-section-header">
          <h2>Data & Privacy</h2>
          <p>Manage your data, exports, and privacy settings.</p>
        </div>

        <div className="settings-field-grid">
          <div className="settings-field-label">Export Data</div>
          <div className="settings-input-wrapper">
            <label className="settings-input-label">Export Data</label>
            <button 
              type="button" 
              className="settings-btn secondary" 
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </button>
            <span className="settings-info">
              Download all your data as a JSON file for backup or transfer
            </span>
          </div>
        </div>

        <div className="settings-field-grid">
          <div className="settings-field-label">Clear All Data</div>
          <div className="settings-input-wrapper">
            <label className="settings-input-label">Clear All Data</label>
            <button 
              type="button" 
              className="settings-btn secondary" 
              onClick={() => setShowClearConfirm(true)}
              disabled={isClearing}
              style={{backgroundColor: 'var(--danger)', color: 'white'}}
            >
              {isClearing ? 'Clearing...' : 'Clear Data'}
            </button>
            <span className="settings-info">
              Permanently delete all habits, sessions, and settings
            </span>
          </div>
        </div>
      </section>
      
      <ClearConfirmDialog />
    </>
  );
};

export default DataSection;
