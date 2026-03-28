/**
 * Load Test - Expected Peak Traffic
 * 
 * Objective: Validate performance under expected peak load
 * VUs: 20 (40-60 real users)
 * Duration: 40 minutes (5m ramp-up, 30m stable, 5m ramp-down)
 * 
 * Flow:
 * 1. Login (once per VU)
 * 2. Marketplace (list all shaders)
 * 3. Marketplace with category filter
 * 4. Marketplace with search query
 * 5. Cart (view shopping cart)
 * 6. Profile (view purchases and owned shaders)
 * 
 * Simulates realistic user behavior during peak hours.
 * Represents typical marketplace browsing session before purchase.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { users } from './shared.js';

export const options = {
  stages: [
    { duration: '5m', target: 20 },   // Ramp-up to 20 users
    { duration: '30m', target: 20 },  // Stay at 20 users
    { duration: '5m', target: 0 },    // Ramp-down to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],     // <5% errors
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],  // 95% under 3s, 99% under 5s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const vuState = {};

export default function loadTest() {
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
