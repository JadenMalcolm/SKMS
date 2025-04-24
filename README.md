# SKMS

## API Configuration

To configure the API endpoint security and connection:

1. Locate the `.env` file in the project root directory or create it if it doesn't exist:

```sh
touch .env  # On Unix-based systems
# Or manually create the file on Windows
```

2. Configure the API URL and security key:

```properties
VITE_API_URL=http://localhost:5000/api
VITE_SECRET_KEY=your_secret_key_here
```

3. Replace `your_secret_key_here` with a strong, secure key of your choice.

4. If you deploy your backend to a different server, update the `VITE_API_URL` to point to your production API endpoint.

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

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

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
