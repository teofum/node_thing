/**
 * Spike Test - Sudden Traffic Burst
 * 
 * Objective: Validate system recovery from sudden traffic spikes
 * VUs: 10 (20-30 real users)
 * Duration: 3 minutes (30s spike, 2m hold, 30s drop)
 * 
 * Flow:
 * 1. Login (once per VU)
 * 2. Marketplace (list shaders)
 * 3. Marketplace with category filter
 * 
 * Simulates sudden traffic burst.
 * Tests if system can handle and recover from unexpected load spikes.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { users } from './shared.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Spike to 10 users
    { duration: '2m', target: 10 },  // Stay at 10 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],   // <10% errors
    http_req_duration: ['p(95)<3000'], // 95% under 3s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const vuState = {};

export default function spikeTest() {
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
      check(loginRes, { 'login success': (r) => r.status === 200 });
      vuState[vuId].loggedIn = loginRes.status === 200;
    });
  }
  
  if (!vuState[vuId].loggedIn) return;

  sleep(1);

  group('Marketplace', () => {
    http.get(`${BASE_URL}/marketplace`, { jar: vuState[vuId].jar });
  });

  sleep(2);

  group('Marketplace Category', () => {
    http.get(`${BASE_URL}/marketplace?category=1`, { jar: vuState[vuId].jar });
  });

  sleep(2);
}
