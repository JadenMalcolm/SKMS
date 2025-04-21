from flask import Blueprint, jsonify
import sqlite3

users_routes = Blueprint('users_routes', __name__)

# Connect to the database
def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn

@users_routes.route('/users/all', methods=['GET'])
def get_all_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, role FROM users ORDER BY role, email")
        users = cursor.fetchall()

        # Convert the rows to dictionaries
        users_list = [{"id": row["id"], "email": row["email"], "role": row["role"]} for row in users]
        conn.close()

        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_routes.route('/users/admins', methods=['GET'])
def get_admins():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, role FROM users WHERE role = 'admin' ORDER BY email")
        users = cursor.fetchall()

        users_list = [{"id": row["id"], "email": row["email"], "role": row["role"]} for row in users]
        conn.close()

        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_routes.route('/users/experts', methods=['GET'])
def get_experts():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, role FROM users WHERE role LIKE 'expert-%' ORDER BY role, email")
        users = cursor.fetchall()

        users_list = [{"id": row["id"], "email": row["email"], "role": row["role"]} for row in users]
        conn.close()

        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_routes.route('/users/employees', methods=['GET'])
def get_employees():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, role FROM users WHERE role = 'employee' ORDER BY email")
        users = cursor.fetchall()

        users_list = [{"id": row["id"], "email": row["email"], "role": row["role"]} for row in users]
        conn.close()

        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
