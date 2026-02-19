# Smart Leave Management System
## C1. Problem Definition & Requirement Analysis

### 1. Problem Statement

In many small to medium-sized enterprises, leave management processes are often handled manually or through decentralized methods such as emails, paper forms, or disparate spreadsheets. This lack of a unified system leads to several critical issues:
*   **Inefficiency**: Manual tracking of leave balances and accruals is time-consuming and prone to human error.
*   **Lack of Visibility**: Employees lack real-time access to their leave status and history, leading to frequent inquiries to HR.
*   **Compliance Risks**: Inconsistent application of leave policies can result in compliance issues and unfair treatment of employees.
*   **Operational Delays**: The absence of an automated approval workflow causes bottlenecks, delaying critical resource planning and decision-making.

### 2. Objectives

The primary objective of this project is to develop a web-based **Smart Leave Management System** that streamlines the leave administration process.
*   **To Automate Leave Workflows**: Replace manual processes with a digital workflow for leave application, approval, and rejection.
*   **To Centralize Data**: Maintain a single source of truth for all employee leave records, ensuring accuracy and data integrity.
*   **To Enhance Accessibility**: Provide a user-friendly interface for employees to manage their leave requests from any location.
*   **To Improve Transparency**: Enable real-time tracking of leave balances and application status for both employees and management.

### 3. Existing System and Limitations

**Existing System:**
Currently, the organization relies on a manual system where employees submit leave requests via email or paper forms to their supervisors. Leave balances are maintained in a shared Excel spreadsheet managed by the HR department.

**Limitations:**
*   **Data Redundancy and Inconsistency**: Multiple versions of the spreadsheet often exist, leading to conflicting data.
*   **High Administrative Burden**: HR staff spend significant time manually updating records and calculating balances.
*   **Slow Turnaround Time**: The approval process is often delayed due to lost forms or overlooked emails.
*   **Lack of Reporting**: Generating historical reports or analyzing leave trends is a manual and labor-intensive task.
*   **Security Vulnerabilities**: Sensitive employee data in spreadsheets is difficult to secure and audit.

### 4. Proposed System

The proposed **Smart Leave Management System** is a robust web application built using **Angular** for the frontend, **ASP.NET Core Web API** for the backend, and **Azure SQL Database** for data storage.

**Key Improvements:**
*   **Automated Calculations**: The system automatically calculates leave balances based on defined rules, eliminating manual errors.
*   **Role-Based Access**: Secure access control ensures that users (Employees, Managers) only see data relevant to their role.
*   **Instant Notifications**: Users receive immediate feedback on the status of their requests (Approved/Rejected) via the dashboard.
*   **Scalable Architecture**: The use of cloud-native technologies (Azure SQL, .NET Core) ensures the system can grow with the organization.

### 5. Scope of the System

#### 5.1 In-Scope (MVP)
*   **User Management**: Authentication and authorization for Employees and Managers.
*   **Dashboard**: Role-specific dashboards displaying relevant information (e.g., leave balance for employees, pending requests for managers).
*   **Leave Cycle**:
    *   Employees can apply for leave, view status, and see history.
    *   Managers can view, approve, or reject leave requests.
*   **Leave Types**: Support for standard leave types (Sick, Casual, Earned/Privilege).

#### 5.2 Out-of-Scope
*   **Payroll Integration**: No direct integration with payroll software.
*   **Advanced Hierarchies**: Multi-level approval workflows (e.g., Manager -> User -> HR Head) are not included in the initial release.
*   **Calendar Integration**: Syncing with external calendars (Outlook, Google Calendar) is deferred to future phases.
*   **Mobile Application**: Native mobile apps are not part of the current scope.

### 6. Functional Requirements

**FR1: Authentication & Authorization**
*   The system shall allow users to log in using a unique email and password.
*   The system shall validate credentials and issue a secure session token (JWT).
*   The system shall restrict access to features based on the user's role (Employee vs. Manager).

**FR2: Dashboard**
*   **Employee Dashboard**: Shall display current leave balances and a summary of recent requests.
*   **Manager Dashboard**: Shall display a list of pending leave requests requiring action.

**FR3: Leave Application (Employee)**
*   The system shall provide a form to submit leave requests, capturing Start Date, End Date, Leave Type, and Reason.
*   The system shall validate that the Start Date is not in the past (unless configured otherwise) and that the End Date is after the Start Date.
*   The system shall prevent submission if the employee has insufficient leave balance.

**FR4: Leave Management (Manager)**
*   The system shall list all pending leave requests submitted by direct reports.
*   The system shall allow the manager to Approve or Reject a request.
*   The system shall require a comment/reason when rejecting a request.

**FR5: Leave History**
*   The system shall maintain a historical record of all leave requests and their final status.
*   Users shall be able to filter their leave history by date range or status.

### 7. Non-Functional Requirements

**NFR1: Performance**
*   The system shall load the dashboard within 2 seconds under normal network conditions.
*   API response time for leave submission shall not exceed 1 second.

**NFR2: Security**
*   Passwords shall be stored using strong hashing algorithms (e.g., BCrypt/PBKDF2).
*   All data transmission between the client and server shall be encrypted using HTTPS/TLS.
*   API endpoints shall be protected against common vulnerabilities (SQL Injection, XSS).

**NFR3: Availability**
*   The system shall aim for 99.9% uptime during business hours.

**NFR4: Scalability**
*   The database and backend shall be designed to support concurrent usage by small teams (up to 50 users) initially, with the ability to scale up.

**NFR5: Usability**
*   The user interface shall be responsive and accessible on modern web browsers (Chrome, Edge, Firefox).
*   The design shall be intuitive, requiring minimal training for end-users.
