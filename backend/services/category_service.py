"""Handles Category CRUD operations"""

from database.connection import get_db_connection

def get_all_categories():
    """Get all categories ordered by ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM categories ORDER BY id ASC")
        return [{"id": row[0], "name": row[1]} for row in cursor.fetchall()]

def create_category(name):
    """
    Create new category.
    
    Args:
        name: Category name
        
    Returns:
        dict: Created category with id and name
        
    Raises:
        ValueError: If name is empty
    """
    if not name:
        raise ValueError("Category name is required")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO categories (name) VALUES (?)", (name,))
        return {"id": cursor.lastrowid, "name": name}

def update_category(category_id, name):
    """Update category name."""
    if not name:
        raise ValueError("Category name is required")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE categories SET name = ? WHERE id = ?", (name, category_id))
        return {"id": category_id, "name": name}

def delete_category(category_id):
    """
    Delete category and move sequences to default.
    Cannot delete default category (id=1).
    """
    if category_id == 1:
        raise ValueError("Cannot delete default category")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE sequences SET category_id = 1 WHERE category_id = ?", (category_id,))
        cursor.execute("DELETE FROM categories WHERE id = ?", (category_id,))


