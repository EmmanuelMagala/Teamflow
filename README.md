# TeamFlow

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Backend-Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

TeamFlow is a full-stack project management  application built for teams that need a focused, fast workflow for organizing work. It is inspired by Trello-style boards, but implemented as a modern TypeScript application with a React frontend, an Express API, PostgreSQL persistence, Clerk-based authentication, and a Kanban workflow that supports drag-and-drop task management, collaborative workspaces, and project-based planning.

## Live Demo

[Live Demo](https://teamflow-cyan.vercel.app/)

## Screenshots
<img width="1917" height="962" alt="image" src="https://github.com/user-attachments/assets/2db2bdea-9a37-4b45-9c81-7defe5a27016" />
<img width="1750" height="907" alt="image" src="https://github.com/user-attachments/assets/f86197cb-7ce1-4010-a3ef-14be1c61d837" />
<img width="1886" height="917" alt="image" src="https://github.com/user-attachments/assets/f7b8af0f-a619-4b48-b43a-558bb0d2dca3" />


## Features

- Authentication with Clerk for sign up, login, logout, and protected routes
- Workspace creation and management
- Workspace collaboration with member invitations by email
- Owner and member workspace roles
- Multiple projects inside each workspace
- Task CRUD with title, description, status, assignee, and due date
- Kanban board with drag-and-drop movement across `To Do`, `In Progress`, and `Done`
- Optimistic UI updates for a responsive task workflow
- Member directory per workspace with role visibility and owner-only membership management
- Backend health endpoints and migration support for deployment workflows

## Tech Stack

### Frontend

- React
  Used to build the client UI as a component-driven single-page application.
- TypeScript
  Adds static typing across components, hooks, API contracts, and forms.
- Vite
  Provides a fast local development server and production build pipeline.
- Tailwind CSS
  Handles the visual system with utility-first styling and reusable design tokens.
- TanStack Query
  Manages all server state, including caching, background refetching, loading states, and mutation flows.
- Zustand
  Stores lightweight client-only UI state such as modal visibility and the selected task.
- React Hook Form
  Powers performant form handling for workspace, project, task, and member flows.
- Zod
  Provides schema-based validation for form inputs and user-facing errors.
- Axios
  Wraps HTTP communication with a central instance and request/response interceptors.
- dnd-kit
  Drives the Kanban drag-and-drop interaction and task reordering behavior.
- Clerk
  Handles authentication, session management, and JWT issuance on the client.
- shadcn/ui
  Supplies composable UI primitives used throughout the design system.
- React Router
  Handles protected routing, nested application navigation, and lazy-loaded pages. The project currently uses React Router v7 packages with the familiar declarative routing style introduced in v6.

### Backend

- Node.js
  Provides the runtime for the API server.
- Express
  Powers the REST API, middleware stack, and route organization.
- TypeScript
  Keeps controllers, queries, middleware, and request handling strongly typed.
- PostgreSQL
  Serves as the system of record for users, workspaces, projects, tasks, and workspace memberships.
- Supabase
  Hosts the PostgreSQL database and provides managed infrastructure for persistence.
- Clerk SDK
  Verifies authenticated requests and connects Clerk identities to application users stored in the database.

## Architecture Overview

TeamFlow is organized around feature ownership rather than generic technical layers. That decision keeps the codebase easier to extend because each business domain stays close to the logic that supports it.

### Frontend structure

Each feature owns its own files under `frontend/src/features`.

- `workspaces/`
  Contains workspace API clients, hooks, components, and shared types for workspace-level flows.
- `projects/`
  Contains project creation, retrieval, update, and deletion logic.
- `tasks/`
  Contains task forms, task hooks, task API functions, and Kanban board interactions.
- `auth/`
  Contains login and signup entry points.

Why this structure works:

- It scales better than a global `components/`, `hooks/`, and `utils/` split because related code stays together.
- It makes ownership clearer when adding or refactoring a domain.
- It reduces the cost of understanding a feature because you do not need to jump between unrelated folders.

### Backend structure

The backend follows a similar feature-based pattern inside `backend/src/features`.

- `routes`
  Define the HTTP surface and validation rules.
- `controllers`
  Handle request/response coordination and translate query results into API responses.
- `queries`
  Encapsulate database access and authorization-aware SQL.

Why this separation matters:

- Route files stay thin and declarative.
- Controllers remain focused on request handling instead of SQL details.
- Query files become the source of truth for data access and authorization constraints.

### Key technical decisions

- React Query handles all server state
  I used React Query for anything that comes from the backend because it solves caching, background updates, loading states, retry behavior, and invalidation in one place. That keeps remote data predictable and avoids hand-rolled fetch state throughout the UI.

- Zustand is limited to UI state
  Zustand only stores ephemeral client-side concerns such as which modal is open and which task is selected. This keeps the client store small and avoids mixing remote state with local UI state.

- Axios is centralized and Clerk-aware
  The frontend uses one Axios instance with a Clerk JWT interceptor, so authenticated requests automatically include the current token. That removes repeated token plumbing from every hook and API file.

- Backend error handling is centralized
  The API uses a centralized error middleware so unexpected failures return consistent responses and keep controller code cleaner.

- SQL stays parameterized
  Database access uses parameterized queries throughout. That is a deliberate security and maintainability choice because it protects against SQL injection and keeps query inputs explicit.

- Authorization is enforced close to the data layer
  Workspace membership and ownership rules are checked in backend queries rather than only at the UI layer. That keeps authorization reliable even if a client makes a direct API request.

## Project Structure

```text
teamflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── features/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── users/
│   │   │   ├── workspace_members/
│   │   │   └── workspaces/
│   │   ├── middleware/
│   │   ├── migrations/
│   │   ├── scripts/
│   │   ├── server.ts
│   │   └── types/
│   └── tests/
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── features/
    │   │   ├── auth/
    │   │   ├── projects/
    │   │   ├── tasks/
    │   │   └── workspaces/
    │   ├── pages/
    │   └── shared/
    └── public/
```

## Getting Started

### Prerequisites

Make sure you have these installed before running the project locally:

- Node.js 20+
- npm 10+
- A Clerk application
- A PostgreSQL database connection string from Supabase

### 1. Clone the repository

```bash
git clone https://github.com/your-username/teamflow.git
cd teamflow
```

### 2. Install dependencies

Install frontend and backend dependencies separately.

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

#### Backend `.env`

Create `backend/.env` and add:

```env
CLERK_SECRET_KEY=your_clerk_secret_key
CLIENT_URL=http://localhost:5173
DATABASE_URL=your_supabase_postgres_connection_string
PORT=5000
NODE_ENV=development
HOST=0.0.0.0
LOG_LEVEL=info
```

Notes:

- `CLIENT_URL` can contain multiple comma-separated origins if needed.
- The backend also supports `DATABASE_POOLER_URL` as an alternative to `DATABASE_URL`.
- `PORT`, `HOST`, and `LOG_LEVEL` are optional but useful for local parity with deployment.

#### Frontend `.env`

Create `frontend/.env` and add:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000/api
```

### 4. Run database migrations

From the backend directory:

```bash
cd backend
npm run migrate
```

### 5. Start the backend

```bash
cd backend
npm run dev
```

The API will run on `http://localhost:5000` by default.

### 6. Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 7. Run validation checks

Backend:

```bash
cd backend
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## API Endpoints

Base URL locally:

```text
http://localhost:5000/api
```

### Health

| Method | Path            | Description                                         |
| ------ | --------------- | --------------------------------------------------- |
| GET    | `/health/live`  | Liveness probe for deployment checks                |
| GET    | `/health/ready` | Readiness probe that verifies database connectivity |

### Users

| Method | Path          | Description                                                     |
| ------ | ------------- | --------------------------------------------------------------- |
| POST   | `/users/sync` | Sync the authenticated Clerk user into the application database |
| GET    | `/users/me`   | Return the current authenticated application user               |

### Workspaces

| Method | Path              | Description                                     |
| ------ | ----------------- | ----------------------------------------------- |
| GET    | `/workspaces`     | List all workspaces the current user belongs to |
| GET    | `/workspaces/:id` | Get a single workspace by id                    |
| POST   | `/workspaces`     | Create a new workspace                          |
| PATCH  | `/workspaces/:id` | Rename a workspace. Owner only                  |
| DELETE | `/workspaces/:id` | Delete a workspace. Owner only                  |

### Workspace Members

| Method | Path                                       | Description                                              |
| ------ | ------------------------------------------ | -------------------------------------------------------- |
| GET    | `/workspaces/:workspaceId/members`         | List workspace members and their roles                   |
| POST   | `/workspaces/:workspaceId/members/invite`  | Invite an existing TeamFlow user to a workspace by email |
| DELETE | `/workspaces/:workspaceId/members/:userId` | Remove a non-owner member from the workspace             |

### Projects

| Method | Path                                 | Description                             |
| ------ | ------------------------------------ | --------------------------------------- |
| GET    | `/projects?workspaceId=:workspaceId` | List all projects in a workspace        |
| GET    | `/projects/:id`                      | Get a single project by id              |
| POST   | `/projects`                          | Create a new project inside a workspace |
| PATCH  | `/projects/:id`                      | Rename a project                        |
| DELETE | `/projects/:id`                      | Delete a project                        |

### Tasks

| Method | Path                          | Description                                         |
| ------ | ----------------------------- | --------------------------------------------------- |
| GET    | `/tasks?projectId=:projectId` | List all tasks for a project                        |
| POST   | `/tasks`                      | Create a new task                                   |
| PATCH  | `/tasks/:id`                  | Update a task’s fields, including status            |
| PUT    | `/tasks/reorder`              | Persist drag-and-drop ordering across board columns |
| DELETE | `/tasks/:id`                  | Delete a task                                       |

## Deployment

### Frontend on Vercel

- Framework preset: Vite
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Required environment variables:
  - `VITE_CLERK_PUBLISHABLE_KEY`
  - `VITE_API_URL`

### Backend on Render

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Run migrations before the application goes live:

```bash
npm run migrate
```

- Required environment variables:
  - `CLERK_SECRET_KEY`
  - `CLIENT_URL`
  - `DATABASE_URL` or `DATABASE_POOLER_URL`
  - `PORT`
  - `NODE_ENV`
  - `HOST`
  - `LOG_LEVEL`

## What I Learned

Building TeamFlow taught me how much better a full-stack application feels when the architecture is intentional from the start. I learned that feature-based structure is not just a code organization preference. It directly affects how quickly I can add functionality, debug issues, and reason about the relationship between frontend and backend behavior.

On the frontend, I got much more disciplined about state ownership. React Query became the right place for server state because workspaces, projects, tasks, and membership lists all need caching, refetching, and mutation handling. Zustand worked best only when I kept it focused on UI-only concerns like open modals and the selected task. That separation made the app easier to reason about and prevented the frontend from turning into a mix of duplicated local and remote state.

Clerk integration was also a strong learning point. It is easy to think of authentication as just a login screen, but the real work is in propagating that identity cleanly across the stack. I had to connect Clerk sessions in the frontend, attach JWTs automatically through Axios, validate protected routes on the backend, and then map authenticated users into the application database. That forced me to think about auth as infrastructure, not just UI.

The Kanban board was one of the most useful engineering exercises in the project. Drag-and-drop always looks simple from the outside, but preserving order correctly across columns, keeping the UI responsive, and persisting state safely in the database takes care. I learned a lot about optimistic updates, reconciling local state with server truth, and avoiding regressions when status changes affect ordering logic.

On the backend, I got better at drawing clean boundaries between routes, controllers, and queries. That separation paid off when features expanded from simple owner-only workspaces to member-aware collaboration. Because the SQL and authorization rules were already isolated in query files, I could evolve the behavior without rewriting the whole request layer.

I also came away with a stronger appreciation for database design in product features. Workspace membership looks straightforward at the UI level, but once collaboration is real, the schema has to support ownership, membership visibility, and authorization consistently across workspaces, projects, and tasks. That was a good reminder that product requirements often become data-modeling decisions very quickly.

## Future Improvements

- Granular roles and permissions beyond `owner` and `member`
- Real-time updates with WebSockets so boards stay in sync across users
- Real outbound email invitations and pending invites for users who have not signed up yet
- Task comments for team collaboration and context
- Activity log for workspace and task history
- File attachments on tasks
- Notifications for assignment changes and due dates
- Staging environment and end-to-end browser automation for release confidence

## Author

**Emmanuel Trevor Magala**



