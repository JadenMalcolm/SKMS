"""
Authentication helper functions for API routes.
Provides utilities for validating API keys and securing routes.
"""

import os
from flask import request, jsonify
from functools import wraps

# Get the API key from environment variable or use the value from the .env file
API_KEY = os.environ.get('API_KEY', 'your_secret_key_here')

def require_api_key(f):
    """
    Decorator to require API key for route access.
    Routes decorated with this will return a 401 unauthorized if the API key is missing
    or incorrect.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if API key is in header
        provided_key = request.headers.get('X-API-Key')
        
        # If no key or invalid, return unauthorized
        if not provided_key or provided_key != API_KEY:
            return jsonify({'error': 'Unauthorized access. API key missing or invalid'}), 401
        
        # Key is valid, proceed with the route function
        return f(*args, **kwargs)
    return decorated_function

def validate_api_key(request):
    """
    Direct validation function for API key.
    Returns True if key is valid, False otherwise.
    """
    provided_key = request.headers.get('X-API-Key')
    return provided_key == API_KEY
