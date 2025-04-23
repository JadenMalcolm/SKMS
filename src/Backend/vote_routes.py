###############################################################################
# Vote Routes Module
# Handles all voting-related API endpoints including upvotes, downvotes,
# and reports for questions. Manages vote toggling and counting.
###############################################################################

from flask import Blueprint, request, jsonify
import sqlite3
from auth_helper import require_api_key

# Create a Blueprint for organizing vote-related routes
vote_routes = Blueprint('vote_report_routes', __name__)

# Initialize SQLite database connection with thread safety
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

# Helper function to execute vote actions
def execute_vote_action(user_id, question_id, vote_types):

    # Processes votes and reports on questions with toggle functionality
    # Handles multiple vote types in a single transaction
    # Returns status messages for the frontend
    
    try:
        # Set busy timeout (milliseconds) in case of database lock
        cursor.execute('PRAGMA busy_timeout = 5000')

        # Begin transaction to ensure data integrity
        cursor.execute('BEGIN TRANSACTION')

        for vote_type in vote_types:
            # Check if the user has already voted or reported this question
            cursor.execute("SELECT * FROM user_votes WHERE user_id = ? AND question_id = ? AND vote_type = ?", (user_id, question_id, vote_type))
            vote = cursor.fetchone()

            if vote:
                # Remove the existing vote (toggle behavior)
                cursor.execute("DELETE FROM user_votes WHERE user_id = ? AND question_id = ? AND vote_type = ?", (user_id, question_id, vote_type))
                
                # Decrement the vote count in the questions table
                if vote_type == 'upvote':
                    cursor.execute("UPDATE questions SET upvotes = upvotes - 1 WHERE id = ?", (question_id,))
                elif vote_type == 'downvote':
                    cursor.execute("UPDATE questions SET downvotes = downvotes - 1 WHERE id = ?", (question_id,))
                elif vote_type == 'report':
                    cursor.execute("UPDATE questions SET reports = reports - 1 WHERE id = ?", (question_id,))
            else:
                # Insert vote entry into the user_votes table
                cursor.execute("INSERT INTO user_votes (user_id, question_id, vote_type) VALUES (?, ?, ?)", (user_id, question_id, vote_type))
                
                # Increment the appropriate vote count
                if vote_type == 'upvote':
                    cursor.execute("UPDATE questions SET upvotes = upvotes + 1 WHERE id = ?", (question_id,))
                elif vote_type == 'downvote':
                    cursor.execute("UPDATE questions SET downvotes = downvotes + 1 WHERE id = ?", (question_id,))
                elif vote_type == 'report':
                    cursor.execute("UPDATE questions SET reports = reports + 1 WHERE id = ?", (question_id,))

        # Commit all changes in the transaction
        conn.commit()
        
        # Return success message with capitalized vote types
        return {'message': f'{", ".join([vote.capitalize() for vote in vote_types])} processed successfully!'}, 201
    except sqlite3.OperationalError as e:
        # Rollback if an error occurs
        conn.rollback()
        return {'error': f'Database error: {e}'}, 500

###############################################################################
# Vote API Endpoints
###############################################################################

# Upvote Route
@vote_routes.route('/questions/<int:id>/upvote', methods=['POST'])
@require_api_key
def upvote_question(id):
    # Extract user ID from request JSON
    data = request.get_json()
    user_id = data.get('user_id')

    # Validate user ID
    if not user_id:
        return jsonify({'error': 'User ID is required.'}), 400

    # Call the helper function for upvote action
    result, status_code = execute_vote_action(user_id, id, ['upvote'])
    return jsonify(result), status_code

# Downvote Route
@vote_routes.route('/questions/<int:id>/downvote', methods=['POST'])
@require_api_key
def downvote_question(id):
    # Extract user ID from request JSON
    data = request.get_json()
    user_id = data.get('user_id')

    # Validate user ID
    if not user_id:
        return jsonify({'error': 'User ID is required.'}), 400

    # Call the helper function for downvote action
    result, status_code = execute_vote_action(user_id, id, ['downvote'])
    return jsonify(result), status_code

# Report Route
@vote_routes.route('/questions/<int:id>/report', methods=['POST'])
@require_api_key
def report_question(id):
    # Extract user ID from request JSON
    data = request.get_json()
    user_id = data.get('user_id')

    # Validate user ID
    if not user_id:
        return jsonify({'error': 'User ID is required.'}), 400

    # Call the helper function for report action
    result, status_code = execute_vote_action(user_id, id, ['report'])
    return jsonify(result), status_code

# Downvote and Report together Route
@vote_routes.route('/questions/<int:id>/downvote_report', methods=['POST'])
@require_api_key
def downvote_report_question(id):
    # Extract user ID from request JSON
    data = request.get_json()
    user_id = data.get('user_id')

    # Validate user ID
    if not user_id:
        return jsonify({'error': 'User ID is required.'}), 400

    # Call the helper function for both downvote and report actions
    result, status_code = execute_vote_action(user_id, id, ['downvote', 'report'])
    return jsonify(result), status_code

# New route to get all counts (upvotes, downvotes, reports)
@vote_routes.route('/questions/<int:question_id>/counts', methods=['GET'])
@require_api_key
def get_all_counts(question_id):
    try:
        # Query to get all vote counts for a specific question
        cursor.execute('SELECT upvotes, downvotes, reports FROM questions WHERE id = ?', (question_id,))
        counts = cursor.fetchone()
        if counts:
            # Return JSON with all counts
            return jsonify({
                'upvotes': counts[0],
                'downvotes': counts[1],
                'reports': counts[2]
            })
        else:
            # Question not found
            return jsonify({'error': 'Question not found.'}), 404
    except sqlite3.OperationalError as e:
        # Handle database errors
        return jsonify({'error': f'Database error: {e}'}), 500
