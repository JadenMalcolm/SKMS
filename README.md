# SKMS

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

## Troubleshooting
