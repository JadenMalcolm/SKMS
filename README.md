# Security Knowledge Management System (SKMS)

A secure platform for knowledge sharing, expert assistance, and service-related communications. Built for employers and organizations looking to collaborate on and teach security best practices across their teams.

## Purpose

The SKMS provides a centralized hub where team members can:

- Share security knowledge and best practices
- Get expert assistance on security-related questions
- Schedule training and consultation sessions
- Communicate securely about sensitive topics
- Build a searchable knowledge base of security information

This platform helps organizations maintain consistent security practices, train new employees, and facilitate knowledge transfer between security experts and other staff members.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) and **npm** (v6 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package installer)
- Git (recommended for version control)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

## Project Setup (Complete Installation)

For a quick setup of both backend and frontend, follow these steps:

```sh
# 1. Clone the repository (if not already done)
git clone <repository-url>
cd SKMS

# 2. Set up the backend with a virtual environment
cd src/Backend
python -m venv venv

# 3. Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# 4. Install backend dependencies
pip install -r requirements.txt
python generate_key.py
python setup_db.py

# 5. Start the backend server (in a separate terminal)
python app.py

# 6. Return to project root and set up the frontend
cd ../..
npm install

# 7. Start the frontend development server
npm run dev
```

## Backend Setup

### Installation and Setup

1. Navigate to the Backend directory:

```sh
cd src/Backend
```

2. Create a virtual environment (recommended):

```sh
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate
```

3. Install required Python packages:

```sh
pip install -r requirements.txt
```

4. Generate encryption key:

```sh
python generate_key.py
```

5. Set up the database:

```sh
python setup_db.py
```

6. Run the backend server:

```sh
python app.py
```

The backend server will start running on http://localhost:5000/api

## API Configuration

1. For security purposes, update the JWT secret key in `src/Backend/auth_routes.py`:

```python
# Replace the hardcoded key with a new secure random string or load from environment variables
SECRET_KEY = '7c45e9a1f8b06509d39b9d93c5bc5829e51670d2d869794dfb0ac92f5bed68a2'  # Change this!
```

You can generate a secure key using Python:

```sh
python -c "import secrets; print(secrets.token_hex(32))"
```

## Frontend Setup

### Project Installation

```sh
npm install
```

### Development Server

```sh
npm run dev
```

This will start the development server, typically at http://localhost:5173/

### Build for Production

```sh
npm run build
```

### Serve Production Build

After building the application, you can start it with:

```sh
npm run start
```

The server will now be running on http://localhost:3000/

## Development Workflow

1. Start the backend server first:

```sh
cd src/Backend
# Activate virtual environment if not already activated
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
python app.py
```

2. In a separate terminal, start the frontend development server:

```sh
npm run dev
```

3. Access the application in your browser at http://localhost:5173/

## Features

### User Management

- **Authentication**: Complete user authentication system with login, registration, and password reset functionality
- **Profile Management**: Users can view and update their profiles, change passwords, and manage account settings

### Core Interface

- **Dashboard**: Central hub displaying security topics, trending concerns, and quick access to all system features
- **Navigation**: Intuitive sidebar menu for easy navigation throughout the application
- **Responsive Design**: Works seamlessly across desktop and mobile devices

### Knowledge Sharing

- **Question & Answer System**: Users can submit security-based questions and respond to queries from others
- **Knowledge Base**: Searchable repository of security information organized by categories
- **Learn Center**: Dedicated page providing static information and links to external resources for security training
- **Keyword Search**: Powerful search functionality to quickly locate relevant information

### Communication Tools

- **Direct Messaging**: Private, secure chat functionality between individual users
- **Group Chat Rooms**: Topic-based discussion areas for team collaboration
- **Messaging Widget**: Real-time communication using secure socket or request-based messaging
- **Expert Assistance**: Connect directly with security knowledge experts

### Administrative Features

- **Staff Directory**: Page dedicated to viewing staff members with their expertise and contact information
- **Company Policies**: Centralized access to important security policies with detailed descriptions
- **Admin Panel**: Administrative controls for user management and system configuration

### Productivity Tools

- **Meeting Scheduler**: Calendar-based system to book appointments with security experts
- **Feedback System**: Mechanism for employees to provide both identified and anonymous feedback
- **Virtual Assistant**: Intelligent chatbot to help users navigate security topics and find information quickly

### Security Features

- **Role-Based Access Control**: Different permission levels based on user roles
- **Secure Communications**: Encrypted messaging and data transfer
- **Audit Logging**: Tracking of system activities for security compliance

## System Architecture

- **Frontend**: Vue.js with Vue Router for navigation
- **Backend**: Flask API with JWT authentication
- **Database**: SQLite for data storage
- **Security**: Role-based access control and encrypted communications

## Troubleshooting

- **Backend Connection Issues**: Ensure the Flask server is running on port 5000
- **Frontend Build Errors**: Make sure you're using compatible Node.js version
- **Login Problems**: Check the database setup and JWT configuration
- **Missing Dependencies**: Run `npm install` and `pip install -r requirements.txt` again

### Common Node.js Issues

- **Node_modules Issues**: If you encounter dependency problems, try removing the node_modules folder and reinstalling:

  ```sh
  # On Windows
  rmdir /s /q node_modules
  # On macOS/Linux
  rm -rf node_modules

  # Then reinstall
  npm install
  ```

- **NPM Cache Issues**: If installing packages consistently fails, try clearing the npm cache:

  ```sh
  npm cache clean --force
  ```

- **Module Not Found Errors**: If you see "Cannot find module" errors:

  ```sh
  # Delete package-lock.json
  del package-lock.json  # Windows
  # rm package-lock.json  # macOS/Linux

  # Clear cache and reinstall
  npm cache clean --force
  npm install
  ```

### Backend Troubleshooting

- **Database Errors**: If you encounter SQLite errors, try regenerating the database:

  ```sh
  # Navigate to backend directory
  cd src/Backend

  # Remove the existing database file
  del users.db  # Windows
  # rm users.db  # macOS/Linux

  # Set up the database again
  python setup_db.py
  ```

- **Virtual Environment Issues**: If your virtual environment becomes corrupted:

  ```sh
  # Remove existing venv
  rmdir /s /q venv  # Windows
  # rm -rf venv  # macOS/Linux

  # Create a new one
  python -m venv venv

  # Activate and reinstall dependencies
  venv\Scripts\activate  # Windows
  # source venv/bin/activate  # macOS/Linux
  pip install -r requirements.txt
  ```

## Resources & Inspiration

This project was inspired by and built upon concepts from:

- **NIST Cybersecurity Framework**: For core security principles and knowledge categorization
- **OWASP Knowledge Base**: For security best practices and common vulnerability information
- **Herzog's Security Classification Model**: For organizing security knowledge into meaningful categories

## Acknowledgments

https://feathericons.com/?query=eye
https://fonts.google.com/icons?icon.size=24&icon.color=%23e3e3e3
https://pictogrammers.com/library/mdi/
https://curity.io/resources/learn/oauth-filter-for-python-flask/
https://pyjwt.readthedocs.io/en/stable/
https://stackoverflow.com/questions/56076269/how-to-set-authorization-header-in-vue-js
https://vite.dev/guide/build
https://router.vuejs.org/guide/essentials/route-matching-syntax.html
