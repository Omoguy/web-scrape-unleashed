# Web Scrape Unleashed

A powerful web scraping tool that combines React/TypeScript frontend with Python Flask backend for extracting product information from e-commerce websites.

## Features

- Universal scraping support for multiple e-commerce platforms
- Anti-bot measures and human-like behavior
- Structured data extraction using OpenAI
- Clean and modern React UI with real-time progress updates
- Export to JSON or CSV formats

## Setup

### Backend Setup

1. Create a Python virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
python -m playwright install
```

3. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

4. Update the `.env` file with your OpenAI API key

### Frontend Setup

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key for data extraction
- `VITE_BACKEND_URL`: Backend server URL (default: http://localhost:5001)

## Usage

1. Start the backend server:
```bash
cd backend
source venv/bin/activate
python app.py
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Open http://localhost:8080 in your browser
4. Enter a website URL, search term, and select fields to extract
5. Add your OpenAI API key
6. Click "Start Scraping"

## Supported Websites

- eBay (Global)
- DigiKey
- Mouser
- RS Components
- Radwell
- Generic e-commerce sites (basic support)

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Vite
  - shadcn-ui
  - Tailwind CSS
- Backend:
  - Python
  - Flask
  - Playwright
  - BeautifulSoup4
  - OpenAI API

## License

MIT
