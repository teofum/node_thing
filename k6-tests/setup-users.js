import http from 'k6/http';
import { users } from './shared.js';

export const options = {
  vus: 1,
  iterations: 1,
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function setupUsers() {
  const res = http.post(
    `${BASE_URL}/api/test-setup`,
    JSON.stringify(users),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  console.log(`Setup result: ${res.body}`);
}
