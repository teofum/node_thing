/**
 * Soak Test - Long-term Stability
 * 
 * Objective: Detect memory leaks and performance degradation over time
 * VUs: 20 (40-60 real users)
 * Duration: 3 hours (10m ramp-up, 2h40m stable, 10m ramp-down)
 * 
 * Flow (continuous loop with variation):
 * 1. Login (once per VU)
 * 2. Marketplace (list all shaders)
 * 3. Marketplace with rotating category filter
 * 4. Marketplace with search query
 * 5. Cart (every 3rd iteration)
 * 6. Profile (every 4th iteration)
 * 
 * Simulates users browsing marketplace for extended periods.
 * Validates system stability under sustained moderate load.
 * Variation in flow makes it more realistic than fixed pattern.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { users } from './shared.js';

const BASE_URL = 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '10m', target: 20 },   // Ramp-up to 20 users
    { duration: '160m', target: 20 },  // Stay at 20 users (2h40m)
    { duration: '10m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],      // <5% errors
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],   // 95% under 3s, 99% under 5s
  },
};

const vuState = {};

export default function soakTest() {
  if (!vuState[__VU]) {
    vuState[__VU] = {
      jar: http.cookieJar(),
      loggedIn: false,
    };

    sleep(__VU * 0.1);

    const user = users[__VU % users.length];
    const loginRes = http.post(
      `${BASE_URL}/api/test-auth`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        jar: vuState[__VU].jar,
      }
    );

    vuState[__VU].loggedIn = check(loginRes, {
      'login successful': (r) => r.status === 200,
    });

    if (!vuState[__VU].loggedIn) {
      console.error(`VU ${__VU}: Login failed`);
      return;
    }
  }

  const iteration = __ITER;

  http.get(`${BASE_URL}/marketplace`, {
    jar: vuState[__VU].jar,
  });
  sleep(2 + Math.random() * 3);

  http.get(`${BASE_URL}/marketplace?category=${(iteration % 3) + 1}`, {
    jar: vuState[__VU].jar,
  });
  sleep(2 + Math.random() * 3);

  http.get(`${BASE_URL}/marketplace?search=shader`, {
    jar: vuState[__VU].jar,
  });
  sleep(2 + Math.random() * 3);

  if (iteration % 3 === 0) {
    http.get(`${BASE_URL}/marketplace/cart`, {
      jar: vuState[__VU].jar,
    });
    sleep(2 + Math.random() * 3);
  }

  if (iteration % 4 === 0) {
    http.get(`${BASE_URL}/profile`, {
      jar: vuState[__VU].jar,
    });
    sleep(2 + Math.random() * 3);
  }
}
