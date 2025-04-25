###############################################################################
# Question routes module.
# Handles creating, retrieving, updating and deleting questions.
###############################################################################
from flask import Blueprint, request, jsonify
import sqlite3
from auth_routes import token_required


question_routes = Blueprint('question_routes', __name__)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

@question_routes.route('/questions', methods=['POST'])
@token_required
def save_question():
    # Create a new question
    data = request.get_json()
    user_id = data.get('userId')
    question_text = data.get('question')
    category = data.get('category')

    # Validate required fields
    if not user_id or not question_text:
        return jsonify({'error': 'User ID, question, and category are required.'}), 400

    # Insert question into database
    cursor.execute("INSERT INTO questions (user_id, question, category) VALUES (?, ?, ?)", (user_id, question_text, category))
    conn.commit()
    return jsonify({'message': 'Question saved successfully!', 'id': cursor.lastrowid}), 201

@question_routes.route('/questions', methods=['GET'])
@token_required
def get_all_questions():
    # Retrieve all questions
    cursor.execute('''
        SELECT q.id, q.question, q.category, q.timestamp, u.email
        FROM questions q
        JOIN users u ON q.user_id = u.id
        ORDER BY q.timestamp DESC
    ''')
    questions = cursor.fetchall()
    return jsonify([
        {'id': q[0], 'question': q[1], 'category': q[2], 'timestamp': q[3], 'user_email': q[4]}
        for q in questions
    ]), 200

@question_routes.route('/questions/search', methods=['POST'])
@token_required
def search_questions():
    # Search questions by keywords
    data = request.get_json()
    query = data.get('query', '')
    keywords = query.split()
    
    # Build search query with relevance ranking
    sql_query = '''
        SELECT q.id, q.question, q.category, q.timestamp, u.email,
               CASE WHEN q.question LIKE ? THEN 1 ELSE 0 END AS relevance
        FROM questions q
        JOIN users u ON q.user_id = u.id
        WHERE ''' + ' OR '.join(['q.question LIKE ?' for _ in keywords]) + '''
        ORDER BY relevance DESC, q.timestamp DESC
    '''
    params = ['%' + query + '%'] + ['%' + keyword + '%' for keyword in keywords]
    cursor.execute(sql_query, params)
    questions = cursor.fetchall()
    return jsonify([
        {'id': q[0], 'question': q[1], 'category': q[2], 'timestamp': q[3], 'user_email': q[4]}
        for q in questions
    ]), 200

@question_routes.route('/questions/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def question(id):
    if request.method == 'GET':
        # Get a specific question
        cursor.execute('''
            SELECT q.question, q.category, q.timestamp, u.email
            FROM questions q
            JOIN users u ON q.user_id = u.id
            WHERE q.id = ?
        ''', (id,))
        question = cursor.fetchone()
        
        if question:
            return jsonify({'question': question[0], 'category': question[1], 'timestamp': question[2], 'user_email': question[3]}), 200
        return jsonify({'error': 'Question not found'}), 404

    if request.method == 'PUT':
        # Update a specific question
        data = request.get_json()
        print(f"Received data: {data}")  # Debugging log

        user_id = data.get('user_id')  # Fix: Get user_id properly
        question_text = data.get('question')
        category = data.get('category')

        # Validate inputs
        if not user_id or not question_text or category is None:  # Allow empty category but not None
            print(f"Validation failed: {data}")  # Debugging log
            return jsonify({'error': 'User ID, question text, and category are required.'}), 400

        # Update question
        cursor.execute("UPDATE questions SET question = ?, category = ? WHERE id = ?", (question_text, category, id))
        conn.commit()
        
        return jsonify({'message': 'Question updated successfully!'}), 200

    if request.method == 'DELETE':
        # Delete a specific question
        cursor.execute("DELETE FROM questions WHERE id = ?", (id,))
        conn.commit()
        return jsonify({'message': 'Question deleted successfully!'}), 200
