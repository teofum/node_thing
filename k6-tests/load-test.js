import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { users } from './shared.js';

export const options = {
  stages: [
    { duration: '5m', target: 50 },   // Ramp-up to 50 users
    { duration: '30m', target: 50 },  // Stay at 50 users
    { duration: '5m', target: 0 },    // Ramp-down to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],     // <5% errors
    http_req_duration: ['p(95)<3000'],  // 95% under 3s
    http_req_duration: ['p(99)<5000'],  // 99% under 5s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Global state per VU
const vuState = {};

export default function loadTest() {
  const vuId = __VU;
  
  // Login only once per VU
  if (!vuState[vuId]) {
    vuState[vuId] = {
      jar: http.cookieJar(),
      user: users[vuId % users.length],
      loggedIn: false,
    };
    
    // Stagger initial logins
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

  sleep(1);

  // Marketplace with filters
  group('Marketplace', () => {
    http.get(`${BASE_URL}/marketplace`, { jar: vuState[vuId].jar });
  });
  sleep(2);

  group('Marketplace Filter', () => {
    http.get(`${BASE_URL}/marketplace?category=Effects`, { jar: vuState[vuId].jar });
  });
  sleep(2);

  group('Marketplace Search', () => {
    http.get(`${BASE_URL}/marketplace?search=blur`, { jar: vuState[vuId].jar });
  });
  sleep(2);

  group('Profile', () => {
    http.get(`${BASE_URL}/profile`, { jar: vuState[vuId].jar });
  });
  sleep(2);
}
