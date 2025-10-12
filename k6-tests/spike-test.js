/**
 * Spike Test - Sudden Traffic Burst
 * 
 * Objective: Validate system recovery from sudden traffic spikes
 * VUs: 80 (160-240 real users)
 * Duration: 5 minutes (instant spike, 3m hold, 2m recovery)
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
    { duration: '30s', target: 80 }, // Instant spike to 80 users
    { duration: '30s', target: 80 },  // Hold spike
    { duration: '2m', target: 0 },   // Recovery period
  ],
  thresholds: {
    http_req_failed: ['rate<0.15'],  // <15% errors (spike tolerance)
    http_req_duration: ['p(95)<5000'], // 95% under 5s
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
    
    sleep(vuId * 2);
    
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

  sleep(2 + Math.random() * 3);

  group('Marketplace', () => {
    http.get(`${BASE_URL}/marketplace`, { jar: vuState[vuId].jar });
  });

  sleep(2 + Math.random() * 3);

  group('Marketplace Category', () => {
    http.get(`${BASE_URL}/marketplace?category=1`, { jar: vuState[vuId].jar });
  });

  sleep(2 + Math.random() * 3);
}
