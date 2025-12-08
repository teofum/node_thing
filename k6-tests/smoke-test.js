/**
 * Smoke Test - Health Check
 * 
 * Objective: Validate that critical endpoints are available and responding
 * VUs: 1 (no load, just availability check)
 * Duration: 1 minute
 * 
 * Flow:
 * 1. Login
 * 2. Marketplace (list shaders)
 * 3. Profile (view user data)
 * 
 * This is a quick sanity check to ensure the system is operational.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { users } from './shared.js';

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% errors
    http_req_duration: ['p(95)<2000'], // 95% under 2s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const user = users[0];

export default function smokeTest() {
  const jar = http.cookieJar();
  
  group('Login', () => {
    const loginRes = http.post(
      `${BASE_URL}/api/test-auth`,
      JSON.stringify(user),
      {
        headers: { 'Content-Type': 'application/json' },
        jar: jar,
      }
    );
    check(loginRes, { 'login successful': (r) => r.status === 200 });
  });

  sleep(1);

  group('Marketplace', () => {
    http.get(`${BASE_URL}/marketplace`, { jar: jar });
  });

  sleep(1);

  group('Profile', () => {
    http.get(`${BASE_URL}/profile`, { jar: jar });
  });

  sleep(1);
}
