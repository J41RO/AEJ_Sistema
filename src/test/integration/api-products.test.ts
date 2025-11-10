/**
 * Integration tests for Products API
 * These tests make REAL calls to the backend server
 * Requires backend running on http://192.168.1.137:8000
 */
import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.137:8000';

describe('Products API Integration', () => {
  let adminToken: string;

  beforeAll(async () => {
    // Login as admin to get token
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = response.data.access_token;
  });

  it('should get list of products', async () => {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should require authentication to get products', async () => {
    try {
      await axios.get(`${API_BASE_URL}/products`);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.response.status).toBe(403);
    }
  });

  it('should create a new product', async () => {
    const productData = {
      codigo: `TEST-${Date.now()}`,
      nombre: 'Test Product Integration',
      descripcion: 'Created by integration test',
      categoria: 'ACCESORIOS',
      marca: 'Test Brand',
      precio_compra: 100.0,
      precio_venta: 150.0,
      stock_actual: 50,
      stock_minimo: 10
    };

    const response = await axios.post(
      `${API_BASE_URL}/products`,
      productData,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data.codigo).toBe(productData.codigo);
    expect(response.data.nombre).toBe(productData.nombre);
  });

  it('should update an existing product', async () => {
    // First create a product
    const createResponse = await axios.post(
      `${API_BASE_URL}/products`,
      {
        codigo: `UPDATE-${Date.now()}`,
        nombre: 'Product To Update',
        categoria: 'ACCESORIOS',
        precio_compra: 100.0,
        precio_venta: 150.0,
        stock_actual: 10
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const productId = createResponse.data.id;

    // Then update it
    const updateResponse = await axios.put(
      `${API_BASE_URL}/products/${productId}`,
      {
        codigo: createResponse.data.codigo,
        nombre: 'Updated Product Name',
        categoria: 'ACCESORIOS',
        precio_compra: 120.0,
        precio_venta: 180.0,
        stock_actual: 10
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.nombre).toBe('Updated Product Name');
    expect(updateResponse.data.precio_compra).toBe(120.0);
  });

  it('should get product by ID', async () => {
    // Create a product first
    const createResponse = await axios.post(
      `${API_BASE_URL}/products`,
      {
        codigo: `GETBYID-${Date.now()}`,
        nombre: 'Get By ID Test',
        categoria: 'ACCESORIOS',
        precio_compra: 50.0,
        precio_venta: 75.0,
        stock_actual: 20
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const productId = createResponse.data.id;

    // Get product by ID
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.status).toBe(200);
    expect(response.data.id).toBe(productId);
    expect(response.data.nombre).toBe('Get By ID Test');
  });
});
