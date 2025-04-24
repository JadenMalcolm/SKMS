# SKMS

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) and **npm** (v6 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package installer)
- Git (recommended for version control)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

## API Configuration

To configure the API endpoint security and connection:

1. Locate the `.env` file in the project root directory or create it if it doesn't exist:

```sh
touch .env  # On Unix-based systems
# Or manually create the file on Windows
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
