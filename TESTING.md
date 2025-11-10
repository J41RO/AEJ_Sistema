# 🧪 Testing Documentation - AEJ Sistema POS

## 📊 Test Coverage Summary

### Total: **181 tests**
- ✅ **Backend**: 168 tests (pytest) - Coverage: >80%
- ✅ **Frontend**: 13 integration tests (vitest) - Coverage: >70%

### Coverage Reports

Backend and frontend have comprehensive test coverage with automated reporting:

- **Backend Coverage**: Generated with `pytest-cov`
- **Frontend Coverage**: Generated with `vitest` + `@vitest/coverage-v8`
- **CI/CD Integration**: Automated via GitHub Actions
- **Coverage Platform**: Reports uploaded to Codecov

---

## 🔧 Backend Testing (168 tests)

### Prerequisites
```bash
cd backend
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Run Backend Tests

#### All tests
```bash
cd backend
pytest tests/
```

#### Unit tests only
```bash
pytest tests/unit/
```

#### Integration tests only
```bash
pytest tests/integration/
```

#### With coverage report
```bash
pytest tests/ --cov --cov-report=html --cov-report=term-missing
# Coverage report will be in backend/htmlcov/index.html
```

#### Verbose output
```bash
pytest tests/ -v --tb=short
```

#### Run specific test file
```bash
pytest tests/unit/test_auth.py
```

#### Run tests by marker
```bash
pytest -m auth          # Only authentication tests
pytest -m sales         # Only sales tests
pytest -m integration   # Only integration tests
```

### Backend Test Structure

```
backend/tests/
├── conftest.py                          # Shared fixtures
├── unit/
│   ├── test_auth.py                    # Auth & JWT (27 tests)
│   ├── test_invoice_processor.py       # Invoice processing (25 tests)
│   ├── test_sales_endpoints.py         # Sales API (12 tests)
│   ├── test_models.py                  # Database models (19 tests)
│   ├── test_products_endpoints.py      # Products API (14 tests)
│   ├── test_clients_endpoints.py       # Clients API (14 tests)
│   ├── test_suppliers_endpoints.py     # Suppliers API (13 tests)
│   ├── test_dashboard_endpoints.py     # Dashboard API (8 tests)
│   ├── test_users_endpoints.py         # Users API (6 tests)
│   ├── test_auth_endpoints.py          # Login API (4 tests)
│   ├── test_invoice_endpoints.py       # Invoices API (7 tests)
│   └── test_health_endpoints.py        # Health checks (7 tests)
└── integration/
    ├── test_sales_flow.py              # Complete sales flow (5 tests)
    └── test_purchase_invoice_flow.py   # Complete invoice flow (7 tests)
```

---

## 🎨 Frontend Testing (13 tests)

### Prerequisites
```bash
npm install
```

### **IMPORTANT: Start Backend First!**

Frontend integration tests make **REAL HTTP calls** to the backend server.

**Start the backend server:**
```bash
cd backend
python main.py
```

The backend must be running on the IP configured in `.env` (default: `http://192.168.1.137:8000`)

**Note:** Frontend tests use `VITE_API_URL` from `.env` file. Make sure it matches your backend server IP.

### Run Frontend Tests

#### Watch mode (default)
```bash
npm test
```

#### Run once and exit
```bash
npm run test:integration
```

#### With UI interface
```bash
npm run test:ui
```

#### With coverage report
```bash
npm run test:coverage
# Coverage report will be in coverage/index.html
```

#### View coverage in browser
```bash
npm run test:coverage
# Then open coverage/index.html in your browser
```

### Frontend Test Structure

```
src/test/
├── setup.ts                            # Test configuration
├── integration/
│   ├── api-auth.test.ts               # Auth API (4 tests)
│   ├── api-products.test.ts           # Products API (5 tests)
│   └── api-sales.test.ts              # Sales API (4 tests)
└── README.md                          # Frontend test docs
```

### What Frontend Tests Cover

✅ **Authentication Flow**
- Login with valid/invalid credentials
- JWT token generation and usage
- Protected route access

✅ **Products Management**
- List products with authentication
- Create/Update/Delete products
- Admin role validation

✅ **Sales Operations**
- Create sales with items
- Stock decrement after sale
- Insufficient stock validation
- Error handling

---

## 🚀 Running Complete Test Suite

### Option 1: Sequential (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Backend Tests:**
```bash
cd backend
pytest tests/ -v
```

**Terminal 3 - Frontend Tests:**
```bash
npm run test:integration
```

### Option 2: Backend Tests Only (No Server Needed)
```bash
cd backend
pytest tests/
```

---

## 📈 Test Results Expected

### Backend Tests (168 tests)
```
✅ 27 tests - Authentication
✅ 25 tests - Invoice Processor
✅ 19 tests - Database Models
✅ 14 tests - Products Endpoints
✅ 14 tests - Clients Endpoints
✅ 13 tests - Suppliers Endpoints
✅ 12 tests - Sales Endpoints
✅  8 tests - Dashboard Endpoints
✅  7 tests - Invoice Endpoints
✅  7 tests - Health Endpoints
✅  7 tests - Purchase Invoice Flow
✅  6 tests - Users Endpoints
✅  5 tests - Sales Flow
✅  4 tests - Auth Endpoints

Time: ~46 seconds
```

### Frontend Tests (13 tests)
```
✅ 5 tests - Products API Integration
✅ 4 tests - Auth API Integration
✅ 4 tests - Sales API Integration

Time: ~3 seconds (with backend running)
```

---

## 🔍 Test Credentials

Tests use these predefined users from backend seed data:

| Username | Password | Role | Usage |
|----------|----------|------|-------|
| `testuser` | `testpassword123` | VENDEDOR | Unit tests |
| `admin` | `admin123` | ADMIN | Admin operations |
| `superuser` | `super123` | SUPERUSUARIO | User management |

---

## 🐛 Troubleshooting

### Frontend Tests Fail with "Network Error"

**Problem:** Tests show `AxiosError: Network Error`

**Solution:** Backend is not running. Start it first:
```bash
cd backend
python main.py
```

### Backend Tests Fail with Import Errors

**Problem:** Missing dependencies

**Solution:** Install dev dependencies:
```bash
pip install -r requirements-dev.txt
```

### Tests Pass Locally But Fail in CI

**Problem:** Database state or timing issues

**Solution:** Tests use in-memory SQLite and fixtures - should be isolated. Check test order and cleanup.

---

## 📝 Adding New Tests

### Backend Test
```python
# backend/tests/unit/test_myfeature.py
import pytest
from auth import create_access_token

@pytest.mark.unit
def test_my_feature(client, test_user):
    token = create_access_token(data={"sub": test_user.username})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/my-endpoint", headers=headers)

    assert response.status_code == 200
```

### Frontend Integration Test
```typescript
// src/test/integration/api-myfeature.test.ts
import { describe, it, expect } from 'vitest';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

describe('My Feature API Integration', () => {
  it('should test my feature', async () => {
    const response = await axios.get(`${API_BASE_URL}/my-endpoint`);
    expect(response.status).toBe(200);
  });
});
```

---

## 🎯 Best Practices

1. ✅ **Run tests before committing code**
2. ✅ **Keep tests independent and isolated**
3. ✅ **Use descriptive test names**
4. ✅ **Test both success and error cases**
5. ✅ **Mock external dependencies**
6. ✅ **Clean up test data**
7. ✅ **Keep tests fast (<1s per test)**

---

## 📚 Documentation

- **Backend Tests**: `backend/tests/`
- **Frontend Tests**: `src/test/README.md`
- **pytest docs**: https://docs.pytest.org/
- **vitest docs**: https://vitest.dev/

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

The project includes automated testing via GitHub Actions (`.github/workflows/tests.yml`):

**Triggers:**
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop` branches

**Jobs:**
1. **Backend Tests**
   - Runs on Ubuntu latest
   - Python 3.11
   - Installs dependencies from `requirements.txt` and `requirements-dev.txt`
   - Executes all 168 tests with coverage
   - Generates HTML, XML, and terminal coverage reports
   - Uploads coverage to Codecov
   - Creates coverage artifact

2. **Frontend Tests**
   - Runs on Ubuntu latest
   - Node.js 18
   - Starts backend server on localhost:8000
   - Installs frontend dependencies
   - Executes all 13 integration tests with coverage
   - Uploads coverage to Codecov
   - Creates coverage artifact

3. **Coverage Report**
   - Combines backend and frontend coverage
   - Creates unified coverage report artifact
   - Available for download from GitHub Actions

### Setting Up CI/CD

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add testing infrastructure"
   git push origin main
   ```

2. **Enable GitHub Actions:**
   - Go to repository Settings → Actions → General
   - Enable "Allow all actions and reusable workflows"

3. **Add Codecov Integration (Optional):**
   - Go to [codecov.io](https://codecov.io)
   - Sign in with GitHub
   - Add your repository
   - Copy the CODECOV_TOKEN
   - Add it to GitHub repository secrets:
     - Settings → Secrets → Actions → New repository secret
     - Name: `CODECOV_TOKEN`
     - Value: Your token from Codecov

4. **Update README Badges:**
   - Replace `YOUR_USERNAME` in README.md with your GitHub username
   - Badges will automatically update with each test run

### Viewing Test Results

**GitHub Actions:**
1. Go to repository → Actions tab
2. Click on latest workflow run
3. View test results and logs
4. Download coverage artifacts

**Codecov Dashboard:**
1. Visit `https://codecov.io/gh/YOUR_USERNAME/AEJ_Sistema`
2. View detailed coverage reports
3. See coverage trends over time
4. Compare coverage between branches

### Local Coverage Reports

**Backend:**
```bash
cd backend
pytest tests/ --cov --cov-report=html
# Open backend/htmlcov/index.html in browser
```

**Frontend:**
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

### Coverage Thresholds

**Backend (pytest-cov):**
- Minimum: 70% (configured in `.coveragerc`)
- Current: >80%
- Excludes: test files, conftest.py, migrations

**Frontend (vitest):**
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%
- Current: >70%
- Excludes: test files, config files, setup files

---

## ✨ Summary

This project has **comprehensive test coverage** with 181 tests covering:
- Authentication & Authorization
- CRUD operations for all entities
- Business logic (inventory, sales, invoicing)
- Error handling and validations
- Integration between frontend and backend

All tests are automated and can be run with simple commands! 🎉
