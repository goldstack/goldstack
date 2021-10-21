import request from 'supertest';
import { app } from './server';

describe('Express server', () => {
  it('Should be able to call root endpoint.', async () => {
    const res = await request(app).get('/').send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBe('success');
  });
});
