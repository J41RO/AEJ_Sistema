/**
 * Integration tests for Sales API
 * These tests make REAL calls to the backend server
 * Requires backend running on http://localhost:8000
 */
import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

describe('Sales API Integration', () => {
  let userToken: string;
  let testProduct: any;
  let testClient: any;

  beforeAll(async () => {
    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    userToken = loginResponse.data.access_token;

    // Create test product
    const productResponse = await axios.post(
      `${API_BASE_URL}/products`,
      {
        codigo: `SALE-TEST-${Date.now()}`,
        nombre: 'Product For Sale Test',
        categoria: 'ACCESORIOS',
        precio_compra: 100.0,
        precio_venta: 150.0,
        stock_actual: 100,
        stock_minimo: 10
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    testProduct = productResponse.data;

    // Create test client
    const clientResponse = await axios.post(
      `${API_BASE_URL}/clients`,
      {
        documento: `${Date.now()}`,
        tipo_documento: 'CC',
        nombre_completo: 'Client For Sale Test',
        email: `client${Date.now()}@test.com`,
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca'
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    testClient = clientResponse.data;
  });

  it('should get list of sales', async () => {
    const response = await axios.get(`${API_BASE_URL}/sales`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should create a new sale', async () => {
    const saleData = {
      client_id: testClient.id,
      subtotal: 150.0,
      descuento: 0.0,
      impuestos: 28.5,
      total: 178.5,
      metodo_pago: 'EFECTIVO',
      notas: 'Integration test sale',
      items: [
        {
          product_id: testProduct.id,
          cantidad: 1,
          precio_unitario: 150.0,
          descuento: 0.0
        }
      ]
    };

    const response = await axios.post(
      `${API_BASE_URL}/sales`,
      saleData,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('numero_venta');
    expect(response.data.numero_venta).toMatch(/^VTA-/);
    expect(response.data.total).toBe(178.5);
    expect(response.data.status).toBe('COMPLETADA');
  });

  it('should decrease product stock after sale', async () => {
    // Get initial stock
    const initialResponse = await axios.get(
      `${API_BASE_URL}/products/${testProduct.id}`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const initialStock = initialResponse.data.stock_actual;

    // Create sale
    await axios.post(
      `${API_BASE_URL}/sales`,
      {
        client_id: testClient.id,
        subtotal: 300.0,
        descuento: 0.0,
        impuestos: 57.0,
        total: 357.0,
        metodo_pago: 'EFECTIVO',
        items: [
          {
            product_id: testProduct.id,
            cantidad: 2,
            precio_unitario: 150.0,
            descuento: 0.0
          }
        ]
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    // Check new stock
    const finalResponse = await axios.get(
      `${API_BASE_URL}/products/${testProduct.id}`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const finalStock = finalResponse.data.stock_actual;

    expect(finalStock).toBe(initialStock - 2);
  });

  it('should reject sale with insufficient stock', async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/sales`,
        {
          client_id: testClient.id,
          subtotal: 15000.0,
          descuento: 0.0,
          impuestos: 2850.0,
          total: 17850.0,
          metodo_pago: 'EFECTIVO',
          items: [
            {
              product_id: testProduct.id,
              cantidad: 1000, // More than available
              precio_unitario: 150.0,
              descuento: 0.0
            }
          ]
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.detail).toContain('Insufficient stock');
    }
  });
});
