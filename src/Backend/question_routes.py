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

    if not user_id or not question_text:
        return jsonify({'error': 'User ID and question are required.'}), 400

    cursor.execute("INSERT INTO questions (user_id, question) VALUES (?, ?)", (user_id, question_text))
    conn.commit()
    return jsonify({'message': 'Question saved successfully!', 'id': cursor.lastrowid}), 201

@question_routes.route('/questions', methods=['GET'])
def get_all_questions():
    cursor.execute('''
        SELECT q.id, q.question, q.timestamp, u.email, q.upvotes, q.downvotes, q.reports
        FROM questions q
        JOIN users u ON q.user_id = u.id
        ORDER BY q.timestamp DESC
    ''')
    questions = cursor.fetchall()
    return jsonify([
        {
            'id': q[0],
            'question': q[1],
            'timestamp': q[2],
            'user_email': q[3],
            'upvotes': q[4],
            'downvotes': q[5],
            'reports': q[6]
        }
        for q in questions
    ]), 200

@question_routes.route('/questions/search', methods=['POST'])
def search_questions():
    data = request.get_json()
    query = data.get('query', '')
    keywords = query.split()
    sql_query = '''
        SELECT q.id, q.question, q.timestamp, u.email,
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
        {'id': q[0], 'question': q[1], 'timestamp': q[2], 'user_email': q[3]}
        for q in questions
    ]), 200

@question_routes.route('/questions/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def question(id):
    if request.method == 'GET':
        cursor.execute('''
            SELECT q.question, q.timestamp, u.email
            FROM questions q
            JOIN users u ON q.user_id = u.id
            WHERE q.id = ?
        ''', (id,))
        question = cursor.fetchone()
        if question:
            return jsonify({'question': question[0], 'timestamp': question[1], 'user_email': question[2]}), 200
        return jsonify({'error': 'Question not found'}), 404

    if request.method == 'PUT':
        data = request.get_json()
        question_text = data.get('question')

        if not question_text:
            return jsonify({'error': 'Question text is required.'}), 400

        cursor.execute("UPDATE questions SET question = ? WHERE id = ?", (question_text, id))
        conn.commit()
        return jsonify({'message': 'Question updated successfully!'}), 200

    if request.method == 'DELETE':
        cursor.execute("DELETE FROM questions WHERE id = ?", (id,))
        conn.commit()
        return jsonify({'message': 'Question deleted successfully!'}), 200

@question_routes.route('/questions/most-reported', methods=['GET'])
def get_most_reported_questions():
    cursor.execute('''
        SELECT q.id, q.question, q.timestamp, u.email, q.reports AS report_count
        FROM questions q
        JOIN users u ON q.user_id = u.id
        WHERE q.reports > 1
        ORDER BY q.reports DESC
        LIMIT 10
    ''')
    questions = cursor.fetchall()
    return jsonify([
        {'id': q[0], 'question': q[1], 'timestamp': q[2], 'user_email': q[3], 'report_count': q[4]}
        for q in questions
    ]), 200
