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
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
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
    const res = http.get(`${BASE_URL}/marketplace`, { jar: vuState[vuId].jar });
    check(res, { 'marketplace success': (r) => r.status === 200 });
  });

  sleep(1);
}
