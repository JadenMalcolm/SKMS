from flask import Blueprint, request, jsonify
import sqlite3

response_routes = Blueprint('response_routes', __name__)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

@response_routes.route('/responses', methods=['POST'])
def save_response():
    data = request.get_json()
    question_id = data.get('question_id')
    user_id = data.get('user_id')
    response_text = data.get('response')

    if not question_id or not user_id or not response_text:
        return jsonify({'error': 'Question ID, User ID, and response are required.'}), 400

    cursor.execute("INSERT INTO responses (question_id, user_id, response) VALUES (?, ?, ?)", (question_id, user_id, response_text))
    conn.commit()
    return jsonify({'message': 'Response saved successfully!', 'id': cursor.lastrowid}), 201

@response_routes.route('/responses/<int:id>', methods=['PUT', 'DELETE'])
def update_response(id):
    if request.method == 'PUT':
        data = request.get_json()
        response_text = data.get('response')

        if not response_text:
            return jsonify({'error': 'Response text is required.'}), 400

        cursor.execute("UPDATE responses SET response = ? WHERE id = ?", (response_text, id))
        conn.commit()
        return jsonify({'message': 'Response updated successfully!'}), 200

    if request.method == 'DELETE':
        cursor.execute("DELETE FROM responses WHERE id = ?", (id,))
        conn.commit()
        return jsonify({'message': 'Response deleted successfully!'}), 200

@response_routes.route('/questions/<int:id>/responses', methods=['GET'])
def get_responses(id):
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

