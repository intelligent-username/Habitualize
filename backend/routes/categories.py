"""Categories API. Create, Edit, Fetch, and Delete"""

from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from imports import *

categories_bp = Blueprint('categories', __name__, url_prefix='/categories')


@categories_bp.route('', methods=['GET'])
def get_categories():
    categories = run_query(FETCH_ALL_CATEGORIES)
    return jsonify([serialize_category(row) for row in categories])


@categories_bp.route('', methods=['POST'])
def add_category():
    name = request.json.get('name', 'New Category')
    category_id = run_query(MAKE_CATEGORY, params=(name,))
    return jsonify({"id": category_id, "name": name}), 201


@categories_bp.route('/<int:category_id>', methods=['PUT'])
def rename_category(category_id):
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"error": "Category name is required"}), 400

    run_query(UPDATE_CAT_IN_DB, params=(name, category_id))
    return jsonify({"id": category_id, "name": name}), 200


@categories_bp.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    if category_id == 1:
        return jsonify({"error": "Cannot delete default category"}), 400

    run_query(UPDATE_HAB_CATS, params=(category_id,))
    run_query(DEL_CAT, params=(category_id,))
    return jsonify({"message": "Category deleted"}), 200
