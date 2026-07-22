import request from 'supertest';
import app from '../src/index';

describe('NexusERP Operations Suite API Endpoints', () => {
  it('GET /health should return 200 operational status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('operational');
  });

  it('POST /api/auth/login with valid admin credentials should return access & refresh tokens', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@minierp.com',
      password: 'Admin123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('POST /api/auth/login with invalid credentials should return 400/401 error', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@minierp.com',
      password: 'WrongPassword!',
    });
    expect(res.body.success).toBe(false);
  });

  it('GET /api/customers without auth token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
