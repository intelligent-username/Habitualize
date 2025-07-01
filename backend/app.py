"""
This is the MAIN (highest-level) backend file. Hosts the Flask application & routes.
This file will mainly be outsourcing function implementations.
Refer to imports.py to see WHERE the functions are defined.
Follow those files to see HOW the functions are defined.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

from database.init_db import init_db
from routes.categories import categories_bp
from routes.sequences import sequences_bp
from routes.habits import habits_bp
from routes.placeholders import settings_bp, quote_bp, analytics_bp
from routes.pomodoro import pomodoro_bp

app = Flask(__name__)
app.config['DATABASE'] = 'data.db'
app.config['DEFAULT_ICON'] = 'default.svg'
CORS(app)

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# app.logger.setLevel(logging.INFO)

# @app.before_request
# def log_request_info():
#     app.logger.info(f"[REQUEST] {request.method} {request.url}")
#     app.logger.info(f"[REQUEST] Remote addr: {request.remote_addr}")
#     app.logger.info(f"[REQUEST] User agent: {request.user_agent}")
#     app.logger.info(f"[REQUEST] Headers: {dict(request.headers)}")

# Blueprints (Implementation of Important Methods)
app.register_blueprint(categories_bp)
app.register_blueprint(sequences_bp)
app.register_blueprint(habits_bp)
app.register_blueprint(settings_bp)
app.register_blueprint(pomodoro_bp)
app.register_blueprint(quote_bp)
app.register_blueprint(analytics_bp)

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found", "message": "The requested URL was not found on the server."}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method Not Allowed", "message": "The method is not allowed for the requested URL."}), 405

@app.errorhandler(Exception)
def handle_global_exception(e):
    return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return jsonify({"message": "Habitualize API is running."})

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True)
