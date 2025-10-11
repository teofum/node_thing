import http from 'k6/http';
import { check, sleep } from 'k6';
import { users } from './shared.js';

const BASE_URL = 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '5m', target: 20 },   // Ramp-up a 20 VUs
    { duration: '50m', target: 20 },  // Mantener 20 VUs por 50 minutos
    { duration: '5m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],      // <5% errores
    http_req_duration: ['p(95)<3000'],   // p95 < 3s
    http_req_duration: ['p(99)<5000'],   // p99 < 5s
  },
};

const vuState = {};

export default function miniSoakTest() {
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

  http.get(`${BASE_URL}/marketplace`, {
    jar: vuState[__VU].jar,
  });
  sleep(2);

  http.get(`${BASE_URL}/marketplace?category=1`, {
    jar: vuState[__VU].jar,
  });
  sleep(2);

  http.get(`${BASE_URL}/marketplace?search=shader`, {
    jar: vuState[__VU].jar,
  });
  sleep(2);

  http.get(`${BASE_URL}/profile`, {
    jar: vuState[__VU].jar,
  });
  sleep(2);
}
