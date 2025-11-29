/**
 * Stress Test - Breaking Point
 * 
 * Objective: Find system limits and breaking point
 * VUs: 50 (100-150 real users)
 * Duration: 45 minutes (10m ramp-up, 30m stable, 5m ramp-down)
 * 
 * Flow:
 * 1. Login (once per VU)
 * 2. Marketplace (list all shaders)
 * 3. Marketplace with category filter
 * 4. Marketplace with search query
 * 5. Cart (view shopping cart)
 * 6. Profile (view purchases and owned shaders)
 * 
 * Pushes system to 2.5x expected load to identify bottlenecks.
 * Tests graceful degradation under extreme conditions.
 * Same flow as load test for direct performance comparison.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { users } from './shared.js';

export const options = {
  stages: [
    { duration: '10m', target: 50 },    // Ramp-up to 50
    { duration: '30m', target: 50 },    // Stay at 50
    { duration: '5m', target: 0 },      // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],      // <10% errors
    http_req_duration: ['p(95)<5000'],  // 95% under 5s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const vuState = {};

export default function stressTest() {
  const vuId = __VU;
  
  if (!vuState[vuId]) {
    vuState[vuId] = {
      jar: http.cookieJar(),
      user: users[vuId % users.length],
      loggedIn: false,
    };
    
    sleep(vuId * 0.1);
    
    group('Login', () => {
      const loginRes = http.post(
        `${BASE_URL}/api/test-auth`,
        JSON.stringify(vuState[vuId].user),
        {
          headers: { 'Content-Type': 'application/json' },
          jar: vuState[vuId].jar,
        }
      );
      check(loginRes, { 'login successful': (r) => r.status === 200 });
      vuState[vuId].loggedIn = loginRes.status === 200;
    });
  }
  
  if (!vuState[vuId].loggedIn) return;

  sleep(2 + Math.random() * 3);

  group('Marketplace', () => {
    http.get(`${BASE_URL}/marketplace`, { jar: vuState[vuId].jar });
  });
  sleep(2 + Math.random() * 3);

  group('Marketplace Category', () => {
    http.get(`${BASE_URL}/marketplace?category=1`, { jar: vuState[vuId].jar });
  });
  sleep(2 + Math.random() * 3);

  group('Marketplace Search', () => {
    http.get(`${BASE_URL}/marketplace?search=shader`, { jar: vuState[vuId].jar });
  });
  sleep(2 + Math.random() * 3);

  group('Cart', () => {
    http.get(`${BASE_URL}/marketplace/cart`, { jar: vuState[vuId].jar });
  });
  sleep(2 + Math.random() * 3);

  group('Profile', () => {
    http.get(`${BASE_URL}/profile`, { jar: vuState[vuId].jar });
  });
  sleep(2 + Math.random() * 3);
}
