"""Data management API routes"""

from flask import Blueprint, jsonify, request, send_file, current_app
import sqlite3
import json
import os
from datetime import datetime
import tempfile
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from imports import *
from database.init_db import init_db

data_bp = Blueprint('data', __name__, url_prefix='/data')

@data_bp.route('/export', methods=['GET'])
def export_data():
    """Export all data as JSON"""
    try:
        # Get database path
        db_path = current_app.config['DATABASE']
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        cursor = conn.cursor()
        
        export_data = {
            'export_timestamp': datetime.now().isoformat(),
            'version': '1.0',
            'data': {}
        }
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [row[0] for row in cursor.fetchall()]
        
        # Export data from each table
        for table in tables:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            export_data['data'][table] = [dict(row) for row in rows]
        
        conn.close()
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
        json.dump(export_data, temp_file, indent=2, default=str)
        temp_file.close()
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"habitualize_export_{timestamp}.json"
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=filename,
            mimetype='application/json'
        )
        
    except Exception as e:
        print(f"[Data Export] Error: {e}")
        return jsonify({"error": f"Export failed: {str(e)}"}), 500

@data_bp.route('/clear', methods=['POST'])
def clear_data():
    """Clear all user data and reinitialize database"""
    try:
        # Get database path
        db_path = current_app.config['DATABASE']
        
        # Remove existing database file
        if os.path.exists(db_path):
            os.remove(db_path)
        
        # Reinitialize database with default data
        init_db()
        
        return jsonify({"message": "All data cleared successfully"})
        
    except Exception as e:
        print(f"[Data Clear] Error: {e}")
        return jsonify({"error": f"Clear failed: {str(e)}"}), 500
