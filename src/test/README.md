# Frontend Tests

## Test Structure

```
src/test/
├── setup.ts                 # Test setup and configuration
├── integration/             # Integration tests with real backend
│   ├── api-auth.test.ts     # Authentication API tests
│   ├── api-products.test.ts # Products API tests
│   └── api-sales.test.ts    # Sales API tests
└── README.md               # This file
```

## Running Tests

### Prerequisites
**IMPORTANT**: Integration tests require the backend server running on the IP configured in `.env`

Start the backend first:
```bash
cd backend
python main.py
```

Tests will use `VITE_API_URL` from `.env` (default: `http://192.168.1.137:8000`)

### Run all tests
```bash
npm test
```

### Run integration tests only
```bash
npm run test:integration
```

### Run tests with UI
```bash
npm run test:ui
```

### Run with coverage
```bash
npm run test:coverage
```

## Integration Tests

Integration tests make **real HTTP calls** to the backend server. They test:

- ✅ **Authentication**: Login, token generation, user info
- ✅ **Products**: CRUD operations, stock management
- ✅ **Sales**: Create sales, stock decrements, validations
- ✅ **Error Handling**: Invalid credentials, insufficient stock, etc.

### Test Credentials

The tests use these predefined users from the backend:
- **Username**: `testuser` / **Password**: `testpassword123` (VENDEDOR)
- **Username**: `admin` / **Password**: `admin123` (ADMIN)

## Adding New Tests

1. Create test file in appropriate directory
2. Follow naming convention: `*.test.ts` or `*.test.tsx`
3. Use real API calls for integration tests
4. Mock external dependencies for unit tests

## Best Practices

- ✅ Each test should be independent
- ✅ Clean up test data when possible
- ✅ Use descriptive test names
- ✅ Test both success and error cases
- ✅ Keep tests fast and focused
