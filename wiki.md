# Project Summary
The POS AEJ project is a comprehensive Point of Sale (POS) system tailored for the Colombian retail market. It streamlines retail operations by ensuring compliance with local regulations, including DIAN electronic invoicing and Ley 1581 for data protection. The system features customer management, product tracking, billing, supplier management, and advanced reporting, making it an indispensable tool for Colombian businesses.

# Project Module Description
The project consists of several functional modules:
- **Product Management**: Manage product listings, categories, brands, and suppliers.
- **Client Management**: Handle customer data in compliance with Ley 1581.
- **POS Functionality**: Efficiently process sales transactions.
- **Inventory Management**: Track stock levels with alerts for low inventory and maintain detailed product history.
- **Reporting**: Generate comprehensive sales, inventory, and client reports with interactive dashboards.
- **User Authentication and Roles**: Support for five user types with specific permissions: Superuser, Admin, Seller, Warehouse, and Accountant.
- **Supplier Management**: Full management of suppliers including evaluation and purchase history.
- **Billing**: Automated invoice generation and management, compliant with DIAN standards.
- **Configuration**: System settings including company details, tax configurations, and invoice numbering.
- **Backend Status Indicator**: Real-time backend connectivity status displayed during login.

# Directory Tree
```
uploads/
└── ROADMAP_PROFESIONAL.md  # Comprehensive roadmap detailing project status and next steps.
src/
├── App.tsx                  # Main application component managing routing and authentication.
├── components/
│   ├── BackendStatus.tsx    # Component displaying backend connection status.
├── lib/
│   └── database.ts          # Database interaction logic and data models.
├── pages/
│   ├── Dashboard.tsx        # Dashboard component displaying metrics and quick actions.
│   ├── Inventory.tsx        # Inventory management interface.
│   ├── Reports.tsx          # Reporting and analytics interface.
│   ├── Clients.tsx          # Client management interface.
│   ├── Products.tsx         # Product management interface.
│   ├── Suppliers.tsx        # Supplier management interface.
│   ├── Billing.tsx          # Billing management interface.
│   ├── Configuration.tsx    # System configuration interface.
│   └── Login.tsx            # Simplified login page.
backend/
├── main.py                  # Backend FastAPI application.
├── requirements.txt         # Python dependencies.
└── .env.example             # Example configuration file.
scripts/
├── install-windows.bat      # Windows installer script.
├── install-linux.sh         # Linux installer script.
├── start-system.bat         # Windows start script.
└── start-system.sh          # Linux start script.
```

# File Description Inventory
- **ROADMAP_PROFESIONAL.md**: Outlines the current status and future tasks for the POS AEJ system.
- **App.tsx**: Main application component that initializes the project and manages routing.
- **BackendStatus.tsx**: Displays the connection status of the backend in real-time.
- **database.ts**: Contains data models and methods for interacting with the local storage database.
- **Inventory.tsx**: Interface for managing inventory, including stock adjustments and alerts.
- **Reports.tsx**: Interface for generating and viewing reports on sales, products, and clients.
- **Clients.tsx**: Interface for managing client data, ensuring compliance with Ley 1581.
- **Suppliers.tsx**: Interface for managing suppliers, including evaluations and purchase history.
- **Billing.tsx**: Interface for managing invoices and billing processes.
- **Configuration.tsx**: Interface for managing system configurations, tax settings, and company details.
- **Login.tsx**: Simplified login interface with minimal design.
- **main.py**: Backend FastAPI application handling API requests.
- **requirements.txt**: Lists Python dependencies required for the backend.
- **.env.example**: Provides an example configuration for environment variables.
- **install-windows.bat**: Script for installing the application on Windows.
- **install-linux.sh**: Script for installing the application on Linux.
- **start-system.bat**: Script to start the application on Windows.
- **start-system.sh**: Script to start the application on Linux.

# Technology Stack
- **Frontend Framework**: React 18 + TypeScript
- **UI Components**: shadcn-ui, Tailwind CSS
- **Backend Framework**: FastAPI
- **Database**: SQLite/PostgreSQL
- **Data Validation**: Pydantic for schema management
- **Authentication**: JWT for user authentication
- **Local Storage**: Prepared for backend integration

# Usage
To set up the project, follow these steps:
1. Download the project files.
2. Configure the frontend:
   - Navigate to the frontend directory.
   - Install dependencies using the package manager.
   - Build the project for production.
3. Configure the backend:
   - Navigate to the backend directory.
   - Create a virtual environment and activate it.
   - Install backend dependencies.
4. Run the application:
   - Start the backend and frontend servers in separate terminals.

### Access Credentials
- **Superadmin**: `superadmin` / `admin123`
- **Admin**: `admin` / `admin123`
- **Vendedor**: `vendedor1` / `vendedor123`
- **Almacén**: `almacen1` / `almacen123`
- **Contador**: `contador1` / `contador123`
