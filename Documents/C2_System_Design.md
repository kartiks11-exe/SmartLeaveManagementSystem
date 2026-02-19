# Smart Leave Management System
## C2. System Design

### 1. High-Level System Architecture

The Smart Leave Management System follows a **3-Tier Architecture** pattern, ensuring separation of concerns, scalability, and maintainability.

*   **Presentation Layer (Client)**: Developed using **Angular**, this layer provides the user interface for Employees and Managers. It handles user interactions, input validation, and communication with the backend via RESTful APIs.
*   **Application Layer (Server)**: Built with **ASP.NET Core Web API**, this layer contains the business logic, authentication mechanisms (JWT), and API endpoints. It processes requests from the client and interacts with the database.
*   **Data Layer (Database)**: Implemented using **Azure SQL Database**, this layer stores all persistent data, including user profiles, leave requests, leave types, and audit logs. Entity Framework Core is used as the ORM to bridge the application and data layers.

### 2. Use Case Descriptions

The system serves two primary actors with distinct functionalities:

#### Actor: Employee
*   **Login**: Authenticate into the system using email and password.
*   **View Dashboard**: Access a personal dashboard summarizing leave balances and recent activity.
*   **Apply for Leave**: Submit a new leave request details (dates, type, reason).
*   **View Leave Status**: Track the progress of submitted requests (Pending/Approved/Rejected).
*   **View Leave Balance**: Check remaining quotas for Sick, Casual, or Vacation leaves.
*   **View Leave History**: Browse a log of all past leave applications.

#### Actor: Manager
*   **Login**: Authenticate with manager credentials to access administrative features.
*   **View Dashboard**: Access an overview of team leave status and pending actions.
*   **View Pending Leave Requests**: Monitor a queue of leave applications from direct reports.
*   **Approve Leave**: Officially grant a leave request, updating the employee's balance.
*   **Reject Leave**: Deny a leave request, mandating a reason for the rejection.
*   **View Team Availability**: Check which team members are on leave for specific dates.

### 3. Class Diagram Description

The system's domain model consists of the following key entities and their relationships:

*   **User**
    *   **Attributes**: `Id`, `FirstName`, `LastName`, `Email`, `PasswordHash`, `Role` (Employee/Manager), `ManagerId`.
    *   **Methods**: `Login()`, `UpdateProfile()`.
    *   **Relationships**: A User can have one Manager (self-referencing relationship). A Manager can have multiple direct reports.

*   **LeaveType**
    *   **Attributes**: `Id`, `Name` (e.g., Sick, Vacation), `DefaultDays`.
    *   **Relationships**: One LeaveType describes many LeaveRequests.

*   **LeaveRequest**
    *   **Attributes**: `Id`, `UserId` (Foreign Key), `LeaveTypeId` (Foreign Key), `StartDate`, `EndDate`, `Reason`, `Status` (Pending/Approved/Rejected), `AppliedDate`, `ManagerComment`.
    *   **Methods**: `Submit()`, `Cancel()`.
    *   **Relationships**: Belongs to one User (Employee). Relates to one LeaveType.

*   **LeaveBalance**
    *   **Attributes**: `Id`, `UserId`, `LeaveTypeId`, `TotalDays`, `UsedDays`, `RemainingDays`.
    *   **Relationships**: Links a User to a specific LeaveType to track utilization.

### 4. Sequence Diagram Explanation

#### Scenario A: Apply for Leave (Employee)
1.  **Actor (Employee)** selects "Apply Leave" on the UI.
2.  **UI (Angular)** displays the leave application form.
3.  **Actor** enters valid dates, selects a leave type, and clicks "Submit".
4.  **UI** sends a `POST /api/leave-requests` request with the form data and JWT token.
5.  **API (Controller)** receives the request and validates the model.
6.  **Service Layer** checks if the user has sufficient **LeaveBalance**.
7.  **Service Layer** saves the **LeaveRequest** to the **Database** with status "Pending".
8.  **Database** confirms the save operation.
9.  **API** returns a `201 Created` response to the UI.
10. **UI** displays a success message and updates the dashboard.

#### Scenario B: Approve/Reject Leave (Manager)
1.  **Actor (Manager)** logs in and views the "Pending Requests" list.
2.  **UI** fetches pending requests via `GET /api/leave-requests/pending`.
3.  **Actor** selects a request and clicks "Approve" (or "Reject" with a comment).
4.  **UI** sends a `PUT /api/leave-requests/{id}/status` request with the new status.
5.  **API** validates the manager's authority to act on this request.
6.  **Service Layer** updates the **LeaveRequest** status in the **Database**.
    *   *If Approved*: The Service also deducts the days from the employee's **LeaveBalance**.
7.  **Database** commits the changes.
8.  **API** returns `200 OK`.
9.  **UI** removes the request from the pending list and shows a confirmation.

### 5. Database Design

#### 5.1 ER Diagram Explanation
The database schema is normalized to ensure data integrity.
*   The **Users** table is the central entity.
*   The **LeaveRequests** table has a many-to-one relationship with **Users** (Employee) and **LeaveTypes**.
*   The **LeaveBalances** table acts as a bridge between **Users** and **LeaveTypes**, tracking how many days each user has left for each type.

#### 5.2 Table Structure

**Table: `Users`**
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | PK, Identity | Unique user ID |
| `FirstName` | NVARCHAR(50) | Not Null | User's first name |
| `LastName` | NVARCHAR(50) | Not Null | User's last name |
| `Email` | NVARCHAR(100)| Unique, Not Null | Login email |
| `PasswordHash`| NVARCHAR(MAX)| Not Null | Hashed password |
| `Role` | NVARCHAR(20) | Not Null | 'Employee' or 'Manager' |
| `ManagerId` | INT | FK (Users.Id) | ID of the user's manager |

**Table: `LeaveTypes`**
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | PK, Identity | Unique type ID |
| `Name` | NVARCHAR(50) | Not Null | e.g., 'Sick Request', 'Vacation' |
| `DefaultDays` | INT | Not Null | Default yearly quota |

**Table: `LeaveRequests`**
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | PK, Identity | Unique request ID |
| `UserId` | INT | FK (Users.Id) | The employee applying |
| `LeaveTypeId` | INT | FK (LeaveTypes) | Type of leave |
| `StartDate` | DATE | Not Null | Leave start date |
| `EndDate` | DATE | Not Null | Leave end date |
| `Reason` | NVARCHAR(250)| Nullable | Reason for leave |
| `Status` | NVARCHAR(20) | Not Null | 'Pending', 'Approved', 'Rejected' |
| `ManagerComment`| NVARCHAR(250)| Nullable | Comment on rejection |
| `RequestDate` | DATETIME | Not Null | Timestamp of application |

**Table: `LeaveBalances`**
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | PK, Identity | Unique balance ID |
| `UserId` | INT | FK (Users.Id) | The employee |
| `LeaveTypeId` | INT | FK (LeaveTypes) | Type of leave |
| `TotalDays` | INT | Not Null | Total allocated days |
| `UsedDays` | INT | Not Null | Days already taken |
