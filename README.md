# Smart Leave Management System

A modern, full-stack Employee Leave Management System built with **.NET 8** and **Angular 18**. Designed for efficiency, transparency, and ease of use for both employees and managers.

![Smart Leave Management Banner](https://via.placeholder.com/1200x400?text=Smart+Leave+Management+System)

## 🚀 Features

-   **User Roles:** Separate dashboards for **Employees** and **Managers**.
-   **Leave Request Workflow:** Employees can apply for leave; Managers can approve or reject requests.
-   **Real-time Balance:** Automatic calculation of leave balances (Sick, Casual, Earned).
-   **Secure Authentication:** JWT-based authentication with Role-Based Access Control (RBAC).
-   **Cloud Native:** Fully deployed on **Azure App Service** (Backend) and **Azure Static Web Apps** (Frontend).
-   **Database:** Powered by **Azure SQL Database** with Entity Framework Core.

## 🛠️ Tech Stack

### Backend
-   **Framework:** ASP.NET Core Web API (.NET 8)
-   **Database:** SQL Server / Azure SQL
-   **ORM:** Entity Framework Core (Code-First)
-   **Authentication:** JWT (JSON Web Tokens)
-   **Documentation:** Swagger / OpenAPI

### Frontend
-   **Framework:** Angular 18 (Standalone Components)
-   **Styling:** Modern CSS / Custom Design System
-   **State Management:** RxJS
-   **Hosting:** Azure Static Web Apps

## 📂 Project Structure

```bash
📦 SmartLeaveManagement
 ┣ 📂 SmartLeaveManagement.Api  # ASP.NET Core Backend
 ┃ ┣ 📂 Controllers            # API Endpoints
 ┃ ┣ 📂 Services               # Business Logic
 ┃ ┗ 📜 Program.cs             # App Configuration
 ┣ 📂 SmartLeaveManagement.Web  # Angular Frontend
 ┃ ┣ 📂 src/app                # Components & Services
 ┃ ┗ 📜 angular.json           # Angular Config
 ┗ 📜 README.md
```

## 🔧 Getting Started (Local Development)

### Prerequisites
-   .NET 8 SDK
-   Node.js (v18+) & Angular CLI (`npm install -g @angular/cli`)
-   SQL Server (LocalDB or Docker)

### 1. Setup Backend
1.  Navigate to `SmartLeaveManagement.Api`.
2.  Update `appsettings.Development.json` with your connection string.
3.  Run Migrations:
    ```bash
    dotnet ef database update
    ```
4.  Start the API:
    ```bash
    dotnet run
    ```

### 2. Setup Frontend
1.  Navigate to `SmartLeaveManagement.Web`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the app:
    ```bash
    ng serve
    ```
4.  Open `http://localhost:4200`.

## ☁️ Deployment

-   **Backend:** Deployed to Azure App Service (Linux).
-   **Frontend:** Deployed to Azure Static Web Apps.
-   **CI/CD:** Manual Zip Deploy (Backend) / SWA CLI (Frontend).

## 🔒 Security Note

Sensitive credentials (connection strings, JWT secrets) are **excluded** from this repository via `.gitignore` and `appsettings.Development.json`.
Please configure your own `secrets.json` or Environment Variables for deployment.

## 📄 License

This project is licensed under the MIT License.
