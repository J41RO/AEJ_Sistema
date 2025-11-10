/**
 * Integration tests for Authentication API
 * These tests make REAL calls to the backend server
 * Requires backend running on http://localhost:8000
 */
import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

describe('Auth API Integration', () => {
  let authToken: string;

  it('should successfully login with valid credentials', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'testpassword123'
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('access_token');
    expect(response.data).toHaveProperty('token_type');
    expect(response.data.token_type).toBe('bearer');

    authToken = response.data.access_token;
  });

  it('should reject login with invalid credentials', async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'wronguser',
        password: 'wrongpassword'
      });
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.detail).toContain('Incorrect');
    }
  });

  it('should get current user info with valid token', async () => {
    // First login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'testpassword123'
    });

    const token = loginResponse.data.access_token;

    // Then get user info
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('username');
    expect(response.data).toHaveProperty('email');
    expect(response.data.username).toBe('testuser');
  });

  it('should reject /auth/me without token', async () => {
    try {
      await axios.get(`${API_BASE_URL}/auth/me`);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.response.status).toBe(403);
    }
  });
});
