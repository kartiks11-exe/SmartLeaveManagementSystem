# Smart Leave Management System
## Project Diagrams

### 1. System Architecture Diagram

This diagram illustrates the **3-Tier Architecture** of the application, highlighting the separation between the Client (Presentation), Server (Application), and Data layers.

```mermaid
graph TD
    subgraph "Client Layer (Presentation)"
        Browser["Web Browser"]
        AngularApp["Angular Application (SPA)"]
    end

    subgraph "Server Layer (Application)"
        WebAPI["ASP.NET Core Web API"]
        Auth["Authentication Service (JWT)"]
        Logic["Business Logic Layer"]
    end

    subgraph "Data Layer (Persistence)"
        EF["Entity Framework Core"]
        SQL[("Azure SQL Database")]
    end

    Browser -- "Host" --> AngularApp
    AngularApp -- "HTTPS / JSON" --> WebAPI
    WebAPI -- "Validate Token" --> Auth
    WebAPI -- "Process Request" --> Logic
    Logic -- "Object Mapping" --> EF
    EF -- "SQL Query" --> SQL
```

### 2. Use Case Diagram

This diagram depicts the interactions between the primary actors (**Employee**, **Manager**) and the system's core functionalities.

```mermaid
usecaseDiagram
    actor "Employee" as Emp
    actor "Manager" as Mgr

    package "Smart Leave Management System" {
        usecase "Login" as UC1
        usecase "View Dashboard" as UC2
        usecase "Apply for Leave" as UC3
        usecase "View Leave Status" as UC4
        usecase "View Leave History" as UC5
        usecase "View Leave Balance" as UC6
        
        usecase "View Dashboard" as UC7
        usecase "View Pending Leave Requests" as UC8
        usecase "Approve Leave" as UC9
        usecase "Reject Leave" as UC10
        usecase "View Team Availability" as UC11
    }

    Emp --> UC1
    Emp --> UC2
    Emp --> UC3
    Emp --> UC4
    Emp --> UC5
    Emp --> UC6

    Mgr --> UC1
    Mgr --> UC7
    Mgr --> UC8
    Mgr --> UC9
    Mgr --> UC10
    Mgr --> UC11
```

**Explanation:**
The Use Case Diagram highlights the two primary actors, **Employee** and **Manager**, and their interactions with the **Smart Leave Management System**.
*   **Employee**: Can log in, view their dashboard, apply for leave, and track their leave status, history, and balances.
*   **Manager**: Has elevated privileges to view their own dashboard, manage pending leave requests (Approve/Reject), and monitor team availability.
*   Both actors share the "Login" and "View Dashboard" (though content differs) functionalities.

### 3. Class Diagram

This diagram represents the static structure of the system, showing the key entity classes, their attributes, and relationships.

```mermaid
classDiagram
    class User {
        +int Id
        +string FirstName
        +string LastName
        +string Email
        +string PasswordHash
        +string Role
        +int ManagerId
        +Login()
        +UpdateProfile()
    }

    class LeaveType {
        +int Id
        +string Name
        +int DefaultDays
    }

    class LeaveRequest {
        +int Id
        +int UserId
        +int LeaveTypeId
        +DateTime StartDate
        +DateTime EndDate
        +string Reason
        +string Status
        +DateTime AppliedDate
        +string ManagerComment
        +Submit()
        +Cancel()
    }

    class LeaveBalance {
        +int Id
        +int UserId
        +int LeaveTypeId
        +int TotalDays
        +int UsedDays
        +int RemainingDays
        +DeductBalance()
    }

    User "1" --> "*" LeaveRequest : creates
    User "1" --> "*" LeaveBalance : has
    User "0..1" --> "*" User : manages
    LeaveType "1" --> "*" LeaveRequest : categorizes
    LeaveType "1" --> "*" LeaveBalance : defines quota
```

### 4. Sequence Diagrams

#### 4.1 Apply for Leave (Employee)

```mermaid
sequenceDiagram
    autonumber
    actor Employee
    participant UI as Angular Frontend
    participant API as Web API
    participant Service as Leave Service
    participant DB as Azure SQL

    Employee->>UI: Fill Leave Form & Submit
    UI->>API: POST /api/leaves (RequestDTO)
    activate API
    API->>Service: ValidateRequest(RequestDTO)
    activate Service
    Service->>DB: GetLeaveBalance(UserId, TypeId)
    activate DB
    DB-->>Service: BalanceDetails
    deactivate DB
    
    alt Insufficient Balance
        Service-->>API: ValidationError
        API-->>UI: 400 Bad Request
        UI-->>Employee: Show Error Message
    else Sufficient Balance
        Service->>DB: Save(LeaveRequest)
        activate DB
        DB-->>Service: Success
        deactivate DB
        Service-->>API: RequestCreated
        API-->>UI: 201 Created
        UI-->>Employee: Show Success & Update Dashboard
    end
    deactivate Service
    deactivate API
```

#### 4.2 Approve/Reject Leave (Manager)

```mermaid
sequenceDiagram
    autonumber
    actor Manager
    participant UI as Angular Frontend
    participant API as Web API
    participant Service as Leave Service
    participant DB as Azure SQL

    Manager->>UI: Select Request & Click Approve/Reject
    UI->>API: PUT /api/leaves/{id}/status (Status, Comment)
    activate API
    API->>Service: UpdateStatus(Id, Status, Comment)
    activate Service
    
    rect rgb(240, 240, 240)
        Note right of Service: Transaction Start
        Service->>DB: GetRequestById(Id)
        DB-->>Service: ExistingRequest
        Service->>DB: Update Request Status
        
        alt Status is Approved
            Service->>DB: Update LeaveBalance (Deduct Days)
        end
        
        Service->>DB: SaveChanges()
        DB-->>Service: Success
        Note right of Service: Transaction Commit
    end
    
    Service-->>API: Success
    API-->>UI: 200 OK
    UI-->>Manager: Remove from Pending List
    deactivate Service
    deactivate API
```

### 5. Entity Relationship (ER) Diagram

This diagram details the database interactions and schema, focusing on the normalized table structures and foreign key constraints.

```mermaid
erDiagram
    Users {
        int Id PK
        string FirstName
        string LastName
        string Email
        string PasswordHash
        string Role
        int ManagerId FK "Nullable"
    }

    LeaveTypes {
        int Id PK
        string Name
        int DefaultDays
    }

    LeaveRequests {
        int Id PK
        int UserId FK
        int LeaveTypeId FK
        date StartDate
        date EndDate
        string Reason
        string Status "Pending, Approved, Rejected"
        string ManagerComment
        datetime RequestDate
    }

    LeaveBalances {
        int Id PK
        int UserId FK
        int LeaveTypeId FK
        int TotalDays
        int UsedDays
    }

    Users ||--o{ LeaveRequests : "Submits"
    Users ||--o{ LeaveBalances : "Has"
    Users |o--o{ Users : "Manages"
    LeaveTypes ||--o{ LeaveRequests : "Defines"
    LeaveTypes ||--o{ LeaveBalances : "Allocates"
```
