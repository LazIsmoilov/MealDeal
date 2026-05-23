# MealDeal

**MealDeal** is a full-stack web application that helps users find the cheapest way to order a meal by comparing prices for the same dish across multiple food-delivery platforms — UberEats, DoorDash, Menulog, and Deliveroo.

Delivery apps often charge different prices and delivery fees for the identical item from the same restaurant. MealDeal aggregates these into a single view, ranks them by total cost (item price + delivery fee), highlights the cheapest option, and shows how much the user could save — then links them straight to that platform to order.

## The problem it solves

A user wanting a specific burger has no easy way to know which delivery app offers it cheapest. Checking each app manually is tedious, and the lowest item price isn't always the lowest total once delivery fees are included. MealDeal does this comparison instantly and updates in real time when prices change.

## Key features

- User accounts — registration and login with JWT authentication and bcrypt-hashed passwords.
- Role-based access — regular users browse and compare; admins manage the catalogue.
- Restaurant and menu browsing.
- Live menu search — filter a restaurant's menu in real time as you type.
- Price comparison — for any menu item, see all platform prices ranked cheapest-first by total cost, with the best deal highlighted and potential savings shown.
- Order-through links — jump straight to the cheapest platform to complete the order.
- Admin dashboard — full CRUD management of restaurants, menu items, and prices, plus a user list.
- Real-time price updates — when an admin changes a price, anyone viewing that item's comparison sees it update live via WebSockets, with no page refresh.

## Tech stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Frontend    | React 19 (Vite), React Router, Axios, Lucide icons      |
| Backend     | FastAPI (Python 3.14), Uvicorn                           |
| Database    | MongoDB 7 (PyMongo driver)                               |
| Auth        | JWT (PyJWT) + password hashing (Passlib / bcrypt)        |
| Real-time   | WebSockets (FastAPI / native browser WebSocket)          |

The application behaves as a single-page application: navigation and data updates happen client-side without full page reloads.

## Project structure

    Assignment2/
    ├── backend/                  FastAPI backend
    │   ├── app/
    │   │   ├── main.py           App entry point; route + CORS + lifespan setup
    │   │   ├── config.py         Environment-driven configuration
    │   │   ├── database.py       MongoDB connection management
    │   │   ├── models/           Pydantic schemas (user, restaurant, menu_item,
    │   │   │                       price_listing, comparison)
    │   │   ├── routes/           API endpoints (auth, restaurants, menu_items,
    │   │   │                       price_listings, comparison, websocket)
    │   │   ├── auth/             Password hashing, JWT handling, route guards
    │   │   └── websockets/       WebSocket connection manager
    │   ├── seed.py               Idempotent script that populates demo data
    │   ├── requirements.txt      Python dependencies
    │   └── .env.example          Backend environment variable template
    │
    └── frontend/                 React (Vite) frontend
        ├── src/
        │   ├── api/              API client + per-resource call wrappers
        │   ├── context/         AuthContext (global auth state)
        │   ├── hooks/           usePriceUpdates (WebSocket subscription hook)
        │   ├── components/      Navbar, cards, comparison modal, route guard
        │   │   └── admin/       Admin dashboard section components
        │   ├── pages/           Login, Register, Home, Detail, Admin pages
        │   └── utils/           Platform link helpers
        ├── package.json          Node dependencies
        └── .env.example          Frontend environment variable template

## Prerequisites

- Node.js v25+ and npm
- Python 3.14+
- MongoDB 7 running locally on port 27017

This project was developed against a local MongoDB instance with authentication enabled (a root user on the admin database). The connection string in .env includes credentials and authSource=admin. If your MongoDB runs without authentication, use mongodb://127.0.0.1:27017 instead.

## Setup and running

The app has two parts — backend and frontend — each run in its own terminal.

### 1. Backend

    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env
    # Edit .env: set MONGO_URI to your MongoDB connection string and set JWT_SECRET.
    python seed.py
    python -m uvicorn app.main:app --reload

The API runs at http://localhost:8000. Interactive API docs are at http://localhost:8000/docs.

### 2. Frontend

In a separate terminal:

    cd frontend
    npm install
    cp .env.example .env
    npm run dev

The app runs at http://localhost:5173.

### Demo accounts

After running python seed.py, an admin account is available:

- Email: admin@mealdeal.com
- Password: admin12345

You can also register a new regular-user account through the app's sign-up page.

## Notes

- bcrypt is pinned to <4.1 in requirements.txt because newer releases removed an attribute that Passlib relies on for version detection.
- Real live prices from delivery platforms are not publicly available via API, so the dataset is seeded with representative sample prices. In a production system these would be ingested via partner integrations; the admin dashboard demonstrates the data-management workflow.
