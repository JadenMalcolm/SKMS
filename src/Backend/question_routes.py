from flask import Blueprint, request, jsonify
import sqlite3

question_routes = Blueprint('question_routes', __name__)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

@question_routes.route('/questions', methods=['POST'])
def save_question():
    data = request.get_json()
    user_id = data.get('userId')
    question_text = data.get('question')
    category = data.get('category')

    if not user_id or not question_text:
        return jsonify({'error': 'User ID, question, and category are required.'}), 400

    cursor.execute("INSERT INTO questions (user_id, question, category) VALUES (?, ?, ?)", (user_id, question_text, category))
    conn.commit()
    return jsonify({'message': 'Question saved successfully!', 'id': cursor.lastrowid}), 201

@question_routes.route('/questions', methods=['GET'])
def get_all_questions():
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
def search_questions():
    data = request.get_json()
    query = data.get('query', '')
    keywords = query.split()
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
def question(id):
    if request.method == 'GET':
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
        data = request.get_json()
        print(f"Received data: {data}")  # Debugging log

        user_id = data.get('user_id')  # Fix: Get user_id properly
        question_text = data.get('question')
        category = data.get('category')

        if not user_id or not question_text or category is None:  # Allow empty category but not None
            print(f"Validation failed: {data}")  # Debugging log
            return jsonify({'error': 'User ID, question text, and category are required.'}), 400

        # Fix: Update question using `id` (question ID), not `user_id`
        cursor.execute("UPDATE questions SET question = ?, category = ? WHERE id = ?", (question_text, category, id))
        conn.commit()
        
        return jsonify({'message': 'Question updated successfully!'}), 200

    if request.method == 'DELETE':
        cursor.execute("DELETE FROM questions WHERE id = ?", (id,))
        conn.commit()
        return jsonify({'message': 'Question deleted successfully!'}), 200

    questions = cursor.fetchall()
    return jsonify([
        {'id': q[0], 'question': q[1], 'category': q[2], 'timestamp': q[3], 'user_email': q[4], 'report_count': q[5]}
        for q in questions
    ]), 200
