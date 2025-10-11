import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { users } from './shared.js';

export const options = {
  stages: [
    { duration: '5m', target: 50 },    // Ramp-up to 50
    { duration: '5m', target: 50 },    // Stay at 50
    { duration: '5m', target: 100 },   // Ramp-up to 100
    { duration: '5m', target: 100 },   // Stay at 100
    { duration: '5m', target: 150 },   // Ramp-up to 150
    { duration: '15m', target: 150 },  // Stay at 150
    { duration: '5m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],      // <10% errors acceptable
    http_req_duration: ['p(95)<5000'],  // 95% under 5s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Global state per VU
const vuState = {};

export default function stressTest() {
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

  // Heavy DB queries
  group('Marketplace', () => {
    http.get(`${BASE_URL}/marketplace`, { jar: vuState[vuId].jar });
  });
  sleep(1);

  group('Profile', () => {
    http.get(`${BASE_URL}/profile`, { jar: vuState[vuId].jar });
  });
  sleep(1);
}
