# Pending Tasks - AEJ Sistema POS

Last Updated: 2025-11-07

---

## 🔴 CRITICAL PRIORITY

### 1. Implement "+ Add Category" Button in Category Select
**Status:** Pending
**Estimated Time:** 2 hours
**Description:**
- Add special item at the end of Category Select dropdown
- Detect when user clicks "+ Add Category"
- Open quick-create modal for new category
- Save to database and auto-select new category

**Files to Modify:**
- `src/pages/Products.tsx`
- Create: `src/components/modals/QuickCreateCategoryModal.tsx`

**Blocker:** Users cannot create products without existing categories

---

### 2. Implement "+ Add Brand" Button in Brand Select
**Status:** Pending
**Estimated Time:** 1.5 hours
**Description:**
- Add special item at the end of Brand Select dropdown
- Detect when user clicks "+ Add Brand"
- Open quick-create modal for new brand
- Save to database and auto-select new brand

**Files to Modify:**
- `src/pages/Products.tsx`
- Create: `src/components/modals/QuickCreateBrandModal.tsx`

**Blocker:** Users cannot create products without existing brands

---

## 🟠 HIGH PRIORITY

### 3. Create Backend Endpoints for Categories
**Status:** Pending
**Estimated Time:** 1 hour
**Description:**
- `POST /api/categorias` - Create new category
- `GET /api/categorias` - List all categories
- `PUT /api/categorias/:id` - Update category
- `DELETE /api/categorias/:id` - Delete category

**Files to Create/Modify:**
- `backend/routes/categorias.py` (or similar)
- `backend/models.py` - Category model

---

### 4. Create Backend Endpoints for Brands
**Status:** Pending
**Estimated Time:** 1 hour
**Description:**
- `POST /api/marcas` - Create new brand
- `GET /api/marcas` - List all brands
- `PUT /api/marcas/:id` - Update brand
- `DELETE /api/marcas/:id` - Delete brand

**Files to Create/Modify:**
- `backend/routes/marcas.py` (or similar)
- `backend/models.py` - Brand model

---

### 5. Design and Create Purchase Invoice Database Tables
**Status:** Pending
**Estimated Time:** 2 hours
**Description:**
Create two new tables:

**Table: facturas_compra (purchase_invoices)**
- id, proveedor_id, numero_factura, fecha_compra
- subtotal, iva, total, estado, notas
- created_at, updated_at

**Table: factura_compra_items (purchase_invoice_items)**
- id, factura_compra_id, producto_id
- nombre_producto, referencia, cantidad
- precio_unitario, subtotal, created_at

**Files to Create:**
- `backend/migrations/add_purchase_invoices.sql`
- `backend/models.py` - Add new models

---

### 6. Add 'estado_registro' Column to Products Table
**Status:** Pending
**Estimated Time:** 30 minutes
**Description:**
- Add column: `estado_registro VARCHAR(20) DEFAULT 'incompleto'`
- Values: 'incompleto' | 'completo'
- Update existing products to 'completo'

**Files to Modify:**
- `backend/migrations/add_product_status.sql`
- `backend/models.py` - Update Product model

---

### 7. Implement Purchase Invoice Registration Module
**Status:** Pending
**Estimated Time:** 4 hours
**Description:**
Create complete module for registering purchase invoices from suppliers:
- Select supplier
- Enter invoice number and date
- Add multiple products (name, reference, quantity, unit price)
- Calculate totals automatically
- Save invoice and create products in database

**Files to Create:**
- `src/pages/PurchaseInvoices/NewPurchaseInvoice.tsx`
- `src/pages/PurchaseInvoices/PurchaseInvoiceList.tsx`
- `src/components/PurchaseInvoice/InvoiceItemRow.tsx`
- `src/components/PurchaseInvoice/InvoiceItemForm.tsx`
- `src/components/PurchaseInvoice/InvoiceSummary.tsx`

**Backend Endpoints:**
- `POST /api/facturas-compra`
- `GET /api/facturas-compra`
- `GET /api/facturas-compra/:id`

---

### 8. Implement Automatic Product Creation from Invoice
**Status:** Pending
**Estimated Time:** 3 hours
**Description:**
Business logic when saving a purchase invoice:
- For each item in invoice:
  - Check if product exists (by reference + supplier)
  - If exists: Update stock and price
  - If not exists: Create new product with:
    - nombre, referencia, proveedor_id, precio_costo
    - stock_actual = cantidad
    - estado_registro = 'incompleto'
  - Link invoice item to producto_id
  - Create inventory movement record

**Files to Modify:**
- `backend/routes/facturas_compra.py`
- `backend/services/invoice_processor.py` (create)

---

## 🟡 MEDIUM PRIORITY

### 9. Add Status Badge to Product List
**Status:** Pending
**Estimated Time:** 1 hour
**Description:**
- Add "Status" column to product list table
- Show badge:
  - ⚠️ Orange "Incomplete" for incompleto
  - ✅ Green "Complete" for completo
- Visual indicator for products needing completion

**Files to Modify:**
- `src/pages/Products/ProductList.tsx`

---

### 10. Add "Show Only Incomplete" Filter to Products
**Status:** Pending
**Estimated Time:** 30 minutes
**Description:**
- Add filter dropdown/toggle in product list
- Options: "All" | "Complete" | "Incomplete"
- Filter products based on estado_registro

**Files to Modify:**
- `src/pages/Products/ProductList.tsx`

---

### 11. Improve Product Edit Form for Incomplete Products
**Status:** Pending
**Estimated Time:** 1.5 hours
**Description:**
- Detect when editing incomplete product
- Highlight missing fields (category, brand, precio_venta, etc.)
- Disable already-filled fields (nombre, referencia, precio_costo)
- Show helpful message: "Complete missing information"

**Files to Modify:**
- `src/pages/Products/ProductForm.tsx`

---

## 🔵 TESTING & VALIDATION

### 12. Insert Test Data in Local Database
**Status:** Pending
**Estimated Time:** 15 minutes
**Description:**
- Insert sample categories (5-10)
- Insert sample brands (5-10)
- Insert sample suppliers (3-5)
- Insert sample products (10-20)
- Insert sample clients (5-10)

**Action:** Run seed script or SQL insert statements

---

### 13. Test Complete Product Creation
**Status:** Pending
**Estimated Time:** 10 minutes
**Description:**
- Create new product with all fields
- Verify it appears in product list
- Verify it can be used in POS

---

### 14. Test Client Creation
**Status:** Pending
**Estimated Time:** 10 minutes
**Description:**
- Create new client from Clients module
- Fill all required fields
- Verify it appears in client list
- Verify it can be selected in POS

---

### 15. Test POS - Add Product to Cart and Complete Sale
**Status:** Pending
**Estimated Time:** 15 minutes
**Description:**
- Open POS module
- Add product to cart
- Set quantity
- Select client
- Apply discount (if any)
- Complete sale
- Verify sale is saved

---

### 16. Test Stock Deduction After Sale
**Status:** Pending
**Estimated Time:** 5 minutes
**Description:**
- Check product stock before sale
- Complete a sale
- Verify stock decreased correctly
- Check inventory movements

---

### 17. Test Inventory Module - View Stock Movements
**Status:** Pending
**Estimated Time:** 10 minutes
**Description:**
- Open Inventory module
- Verify movements are listed
- Check sale movements appear
- Verify movement details (product, quantity, user, date)

---

### 18. Test Reports Module - Generate Sales Report
**Status:** Pending
**Estimated Time:** 10 minutes
**Description:**
- Open Reports module
- Generate sales report
- Verify data accuracy
- Test date filters
- Test export functionality (if exists)

---

### 19. Verify Dashboard Updates with Real Data
**Status:** Pending
**Estimated Time:** 5 minutes
**Description:**
- After creating products and sales
- Check Dashboard metrics update:
  - Total sales today
  - Product count
  - Client count
  - Low stock alerts

---

## 📊 Summary

- **Critical:** 2 tasks
- **High Priority:** 6 tasks
- **Medium Priority:** 3 tasks
- **Testing:** 8 tasks

**Total Pending Tasks:** 19
