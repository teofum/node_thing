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

const jar = http.cookieJar();
const user = users[0];

export default function smokeTest() {
  // Login
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

  // Marketplace
  group('Marketplace', () => {
    const marketplaceRes = http.get(`${BASE_URL}/marketplace`, { jar: jar });
    check(marketplaceRes, { 'marketplace available': (r) => r.status === 200 });
  });

  sleep(1);

  // Profile
  group('Profile', () => {
    const profileRes = http.get(`${BASE_URL}/profile`, { jar: jar });
    check(profileRes, { 'profile available': (r) => r.status === 200 });
  });

  sleep(1);
}
