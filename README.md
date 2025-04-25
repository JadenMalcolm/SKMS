# SKMS

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) and **npm** (v6 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package installer)
- Git (recommended for version control)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

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

### Build for Production

```sh
npm run build
```

### Serve Production Build

After building the application, you can serve it with:

```sh
# Install serve globally if not already installed
npm install -g serve
# Serve the built application
serve dist
```

Alternatively, you can use:

```sh
npx serve dist
```

## Backend Setup

### Installation and Setup

1. Navigate to the Backend directory:

```sh
cd src/Backend
```

2. Install required Python packages:

```sh
pip install -r requirements.txt
```

3. Generate encryption key:

```sh
python generate_key.py
```

4. Set up the database:

```sh
python setup_db.py
```

5. Run the backend server:

```sh
python app.py
```

The backend server will start running on http://localhost:5000/api
