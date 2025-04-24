###############################################################################
# Response routes module.
# Manages responses to questions, including CRUD operations.
###############################################################################
from flask import Blueprint, request, jsonify
import sqlite3
from api_routes import require_api_key

response_routes = Blueprint('response_routes', __name__)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

@response_routes.route('/responses', methods=['POST'])
@require_api_key
def save_response():
    # Save a new response to a question
    data = request.get_json()
    question_id = data.get('question_id')
    user_id = data.get('user_id')
    response_text = data.get('response')

    # Validate required fields
    if not question_id or not user_id or not response_text:
        return jsonify({'error': 'Question ID, User ID, and response are required.'}), 400

    # Insert the new response
    cursor.execute("INSERT INTO responses (question_id, user_id, response) VALUES (?, ?, ?)", (question_id, user_id, response_text))
    conn.commit()
    return jsonify({'message': 'Response saved successfully!', 'id': cursor.lastrowid}), 201

@response_routes.route('/questions/<int:id>/responses', methods=['GET'])
@require_api_key
def get_responses(id):
    # Get all responses for a specific question
    cursor.execute('''
        SELECT r.id, r.response, r.timestamp, u.email
        FROM responses r
        JOIN users u ON r.user_id = u.id
        WHERE r.question_id = ?
        ORDER BY r.timestamp DESC
    ''', (id,))
    responses = cursor.fetchall()
    return jsonify([
        {'id': r[0], 'response': r[1], 'timestamp': r[2], 'user_email': r[3]}
        for r in responses
    ]), 200

@response_routes.route('/responses/<int:response_id>', methods=['PUT', 'DELETE'])
@require_api_key
def manage_response(response_id):
    # Update or delete a specific response
    if request.method == 'PUT':
        # Update response text
        data = request.get_json()
        response_text = data.get('response')

        if not response_text:
            return jsonify({'error': 'Response text is required.'}), 400

        cursor.execute("UPDATE responses SET response = ? WHERE id = ?", (response_text, response_id))
        conn.commit()
        return jsonify({'message': 'Response updated successfully!'}), 200

    if request.method == 'DELETE':
        # Delete response
        cursor.execute("DELETE FROM responses WHERE id = ?", (response_id,))
        conn.commit()
        return jsonify({'message': 'Response deleted successfully!'}), 200

