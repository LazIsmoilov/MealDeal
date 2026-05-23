# Workload Allocation

## Submission type

This project was completed **individually**. As permitted by the assignment
specification, the group component is therefore treated as an individual
component, and all work described below was carried out by a single author.

## Author

- **Name:** Laz (Lazizbek)
- **GitHub:** https://github.com/LazIsmoilov/MealDeal

## Contribution statement

All source code, configuration, database design, and documentation in this
repository were written by the sole author. This includes:

**Backend (FastAPI + MongoDB)**
- Project setup, configuration, and MongoDB connection management
- User model and JWT authentication (registration, login, password hashing)
- Role-based access control (user/admin) and route guards
- CRUD APIs for all three entities: restaurants, menu items, price listings
- Referential-integrity and uniqueness validation
- Price comparison engine (total-cost ranking and savings calculation)
- WebSocket connection manager and live price-update broadcasting
- Idempotent database seed script

**Frontend (React + Vite)**
- Design system, routing, and global authentication state
- Login and registration pages
- Home page with restaurant grid
- Restaurant detail page with live menu search
- Price comparison modal with cheapest-deal highlighting and savings
- Order-through links to delivery platforms
- Admin dashboard with CRUD management for all entities and a user list
- WebSocket subscription hook for real-time price updates

**Documentation**
- README (project description, tech stack, setup, folder structure)
- This workload statement

## Evidence of individual contribution

Individual contribution can be verified through the project's Git commit
history, which was built incrementally across the development period rather
than as a single bulk upload. Each commit is small, atomic, and described
with a conventional-commit message (e.g. `feat(auth):`, `feat(compare):`,
`docs:`), reflecting the step-by-step development of each feature.

To review the full history:

    git log --oneline

All commits originate from the single author's account.
