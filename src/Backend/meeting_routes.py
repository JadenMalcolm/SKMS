###############################################################################
# Meeting routes module.
# Handles scheduling, retrieving, and managing meetings between users.
###############################################################################
from flask import Blueprint, request, jsonify
import sqlite3
from auth_routes import token_required


meeting_routes = Blueprint('meeting_routes', __name__)

# Initialize SQLite database connection - but not cursor
conn = sqlite3.connect('users.db', check_same_thread=False)

@meeting_routes.route('/schedule-meeting', methods=['POST'])
@token_required
def schedule_meeting():
    # Schedule a new meeting between users
    data = request.get_json()

    user_id = data.get('user_id')
    target_user_id = data.get('target_user_id')
    date = data.get('date')
    time = data.get('time')
    meeting_type = data.get('meeting_type')

    # Validate required fields
    if not user_id or not target_user_id or not date or not time or not meeting_type:
        return jsonify({'error': 'All fields are required.'}), 400

    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        # Check if target user exists
        cursor.execute('''
            SELECT email FROM users WHERE id = ?
        ''', (target_user_id,))
        target_user_email = cursor.fetchone()

        if not target_user_email:
            cursor.close()
            return jsonify({'error': 'Target user not found.'}), 404

        # Create meeting entry
        cursor.execute('''
            INSERT INTO meetings (user_id, target_user_id, date, time, meeting_type)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, target_user_id, date, time, meeting_type))
        conn.commit()
        cursor.close()
        return jsonify({'message': f'Meeting scheduled with {target_user_email[0]} on {date} at {time} ({meeting_type}).'})
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500

@meeting_routes.route('/meetings/<int:user_id>', methods=['GET'])
@token_required
def get_meetings(user_id):
    # Get all meetings for a specific user
    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT m.id,
                   strftime('%m/%d/%Y', m.date) as formatted_date,
                   m.time, m.meeting_type,
                   CASE
                       WHEN m.user_id = ? THEN u2.email
                       ELSE u1.email
                   END as target_user_email,
                   m.status
            FROM meetings m
            LEFT JOIN users u1 ON m.user_id = u1.id
            LEFT JOIN users u2 ON m.target_user_id = u2.id
            WHERE m.user_id = ? OR m.target_user_id = ?
            ORDER BY m.date, m.time
        ''', (user_id, user_id, user_id))
        meetings = cursor.fetchall()
        result = [{
            'id': meeting[0],
            'date': meeting[1],
            'time': meeting[2],
            'meeting_type': meeting[3],
            'target_user_email': meeting[4],
            'status': meeting[5]
        } for meeting in meetings]
        cursor.close()
        return jsonify(result)
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500

@meeting_routes.route('/meeting-requests/<int:target_user_id>', methods=['GET'])
@token_required
def get_meeting_requests(target_user_id):
    # Get pending meeting requests sent to a user
    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT m.id,
                   strftime('%m/%d/%Y', m.date) as formatted_date,
                   strftime('%I:%M %p', m.time) as formatted_time,
                   u.email as user_email,
                   m.meeting_type
            FROM meetings m
            JOIN users u ON m.user_id = u.id
            WHERE m.target_user_id = ? AND m.status = 'pending'
            ORDER BY m.date, m.time
        ''', (target_user_id,))
        meetings = cursor.fetchall()
        result = [{
            'id': meeting[0],
            'date': meeting[1],
            'time': meeting[2],
            'user_email': meeting[3],
            'meeting_type': meeting[4]
        } for meeting in meetings]
        cursor.close()
        return jsonify(result)
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500

@meeting_routes.route('/accept-meeting', methods=['POST'])
@token_required
def accept_meeting():
    # Accept a pending meeting request
    data = request.get_json()
    meeting_id = data.get('meeting_id')

    # Validate required fields
    if not meeting_id:
        return jsonify({'error': 'Meeting ID is required.'}), 400

    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        # Update meeting status
        cursor.execute('''
            UPDATE meetings
            SET status = 'accepted'
            WHERE id = ?
        ''', (meeting_id,))
        conn.commit()
        cursor.close()
        return jsonify({'message': 'Meeting accepted successfully.'})
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500

@meeting_routes.route('/reject-meeting', methods=['POST'])
@token_required
def reject_meeting():
    # Reject a pending meeting request
    data = request.get_json()
    meeting_id = data.get('meeting_id')

    # Validate required fields
    if not meeting_id:
        return jsonify({'error': 'Meeting ID is required.'}), 400

    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        # Update meeting status
        cursor.execute('''
            UPDATE meetings
            SET status = 'rejected'
            WHERE id = ?
        ''', (meeting_id,))
        conn.commit()
        cursor.close()
        return jsonify({'message': 'Meeting rejected successfully.'})
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500

@meeting_routes.route('/delete-meeting', methods=['POST'])
@token_required
def delete_meeting():
    # Delete a meeting
    data = request.get_json()
    meeting_id = data.get('meeting_id')

    # Validate required fields
    if not meeting_id:
        return jsonify({'error': 'Meeting ID is required.'}), 400

    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        # Delete meeting
        cursor.execute('''
            DELETE FROM meetings
            WHERE id = ?
        ''', (meeting_id,))
        conn.commit()
        cursor.close()
        return jsonify({'message': 'Meeting deleted successfully.'})
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500