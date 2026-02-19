# Smart Leave Management System
## C3. Implementation Details

### 1. Technology Stack Selection & Justification

The selection of the technology stack for the Smart Leave Management System was driven by the need for robustness, scalability, and ease of maintenance.

*   **Frontend: Angular (v16+)**
    *   **Justification**: Angular provides a comprehensive framework with built-in tools for routing, form validation, and HTTP communication. Its component-based architecture and strict typing via TypeScript ensure code maintainability and reduce runtime errors. The "Standalone Components" feature simplifies the application structure by reducing the need for NgModules.
*   **Backend: ASP.NET Core Web API (.NET 8)**
    *   **Justification**: ASP.NET Core is a high-performance, cross-platform framework suitable for building modern cloud-based APIs. It offers built-in dependency injection, excellent security features, and seamless integration with Azure services.
*   **Database: Azure SQL Database**
    *   **Justification**: As a fully managed relational database service, Azure SQL provides high availability, automated backups, and scalability without the need for infrastructure management. It integrates natively with the .NET ecosystem.
*   **ORM: Entity Framework Core (EF Core)**
    *   **Justification**: EF Core serves as the Object-Relational Mapper, allowing developers to interact with the database using C# objects. It eliminates the need for most boilerplate ADO.NET code and supports LINQ for type-safe queries.

### 2. Backend Implementation Overview

The backend is structured as a RESTful API following the Controller-Service-Repository pattern (simplified to Controller-Service for this scope).

*   **ASP.NET Core Web API**:
    *   Serves as the entry point for all client requests.
    *   **Controllers** (`AuthController`, `LeaveRequestController`) handle HTTP verbs (GET, POST, PUT, DELETE) and define API endpoints.
    *   **Data Transfer Objects (DTOs)** are used to shuttle data between the API and the client, ensuring that internal domain entities are not exposed directly.
*   **Entity Framework Core**:
    *   **DbContext**: Represents the session with the database and maps C# model classes (`User`, `LeaveRequest`) to database tables.
    *   **Migrations**: Used to programmatically render and apply schema changes to the SQL database, ensuring version control of the database structure.
*   **Authentication**:
    *   Implemented using **JWT (JSON Web Tokens)**.
    *   On successful login, the server signs a token containing the user's claims (ID, Email, Role).
    *   This token must be included in the `Authorization` header (`Bearer <token>`) of subsequent requests.

### 3. Frontend Implementation Overview

The frontend is a Single Page Application (SPA) designed for a responsive user experience.

*   **Architecture**:
    *   Built using **Standalone Components**, removing the complexity of `AppModule`.
    *   **Lazy Loading** is implemented for the routing configuration to improve initial load time.
*   **Key Services**:
    *   `AuthService`: Manages user login, token storage (in LocalStorage), and logout functionality.
    *   `LeaveService`: Handles API calls for fetching leave history, applying for leave, and managing requests.
*   **Routing & Guards**:
    *   `AppRoutes`: Defines navigation paths (e.g., `/login`, `/dashboard`, `/apply-leave`).
    *   `AuthGuard`: Protects private routes, redirecting unauthenticated users to the login page.
*   **Interceptors**:
    *   `JwtInterceptor`: Automatically attaches the JWT token to the headers of all outgoing HTTP requests.

### 4. REST API Design

The following key endpoints have been implemented to support the system's functionality:

| HTTP Verb | Endpoint | Purpose | Access Level |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/api/auth/login` | Authenticate user and return JWT | Public |
| `POST` | `/api/auth/register` | Register a new user (Admin only/Seed) | Public/Admin |
| **Leave Requests** | | | |
| `POST` | `/api/leaves` | Submit a new leave request | Employee |
| `GET` | `/api/leaves/my-history` | Get leave history for current user | Employee |
| `GET` | `/api/leaves/pending` | Get all pending requests (Team) | Manager |
| `PUT` | `/api/leaves/{id}/approve` | Approve a specific leave request | Manager |
| `PUT` | `/api/leaves/{id}/reject` | Reject a request with a comment | Manager |
| **Leave Types** | | | |
| `GET` | `/api/leavetypes` | List available leave types | Authenticated |

### 5. Security Considerations

*   **Data Encryption**: All communication is secured via **HTTPS**. Sensitive data like passwords are hashed using **BCrypt** before storage.
*   **Cross-Origin Resource Sharing (CORS)**: Configured to allow requests only from the specific Angular client origin (e.g., `http://localhost:4200`), preventing unauthorized cross-domain access.
*   **Input Validation**:
    *   **Client-side**: Angular RequestForms validators ensure fields are not empty and conform to expected formats (e.g., valid email).
    *   **Server-side**: Data Annotations and model state validation in .NET ensure that invalid data does not reach the database.
*   **Role-Based Authorization**: API endpoints are decorated with `[Authorize(Roles = "Manager")]` attributes to strictly enforce access control at the server level, preventing privilege escalation.
