#!/usr/bin/env python3

import sys
import os
sys.path.append('.')

from flask import Flask
from services.services import get_cumulative_progress_details

app = Flask(__name__)
app.config['DATABASE'] = 'data.db'

with app.app_context():
    result = get_cumulative_progress_details(216)
    print('Result for habit 216:', result)
