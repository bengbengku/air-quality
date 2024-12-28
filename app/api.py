from flask import Blueprint, jsonify
from datetime import datetime
import random
import json
import os

main = Blueprint('main', __name__)

def get_air_quality_data():
    current_dir = os.path.dirname(__file__)
    file_path = os.path.join(current_dir, 'dummy_data.json')
    
    with open(file_path, 'r') as file:
        dummy_data = json.load(file)
    
    return dummy_data

@main.route('/')
def index():
    return jsonify(get_air_quality_data())

@main.route('/api/data')
def api_data():
    return jsonify(get_air_quality_data())
