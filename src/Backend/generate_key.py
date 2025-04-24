###############################################################################
# Security Key Generation Module
# Creates or loads encryption key for secure operations
###############################################################################

from cryptography.fernet import Fernet
import os

def generate_or_load_key():
    """Generate a new key or load existing one for encryption operations"""
    key_file = 'secret.key'
    if not os.path.exists(key_file):
        # Generate new key if none exists
        key = Fernet.generate_key()
        with open(key_file, 'wb') as f:
            f.write(key)
    else:
        # Load existing key
        with open(key_file, 'rb') as f:
            key = f.read()
    
    return key

if __name__ == "__main__":
    # Execute if run directly
    generate_or_load_key()
