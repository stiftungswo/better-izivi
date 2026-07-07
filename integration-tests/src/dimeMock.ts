import { execFileSync } from 'child_process';
import fs from 'fs';
import https from 'https';
import os from 'os';
import path from 'path';

// AuthenticateInDime (api/app/services/authenticate_in_dime.rb) hardcodes
// `use_ssl = true` and `verify_mode = OpenSSL::SSL::VERIFY_PEER`, and always
// connects to whatever host ends up in API_URI_DIME by IP once we point it
// at this mock (see dockerDime.ts) — so the mock has to actually terminate
// TLS with a certificate the container is willing to trust, not just listen
// on plain HTTP.
export const MOCK_HOST_IP = '172.20.0.1'; // the docker-compose bridge network's gateway, reachable from the api container as "the host"

export interface RecordedRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
}

export interface DimeMock {
  port: number;
  certPem: string;
  requests: () => RecordedRequest[];
  setProjectEffortsCount: (count: number) => void;
  setEmployeeFound: (found: boolean) => void;
  stop: () => Promise<void>;
}

function generateSelfSignedCert(): { certPem: string; keyPem: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dime-mock-cert-'));
  const keyPath = path.join(dir, 'key.pem');
  const certPath = path.join(dir, 'cert.pem');

  execFileSync('openssl', [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    keyPath,
    '-out',
    certPath,
    '-days',
    '1',
    '-subj',
    '/CN=dime-mock',
    '-addext',
    `subjectAltName=IP:${MOCK_HOST_IP}`,
  ]);

  const certPem = fs.readFileSync(certPath, 'utf8');
  const keyPem = fs.readFileSync(keyPath, 'utf8');
  fs.rmSync(dir, { recursive: true, force: true });

  return { certPem, keyPem };
}

export const MOCK_DIME_TOKEN = 'mock-dime-token';
export const MOCK_DIME_EMPLOYEE_ID = 4242;

export async function startDimeMock(): Promise<DimeMock> {
  const { certPem, keyPem } = generateSelfSignedCert();
  const requests: RecordedRequest[] = [];
  let projectEffortsCount = 1;
  let employeeFound = true;

  const server = https.createServer({ cert: certPem, key: keyPem }, (req, res) => {
    requests.push({ method: req.method ?? '', url: req.url ?? '', headers: req.headers });

    const url = new URL(req.url ?? '', `https://${MOCK_HOST_IP}`);

    if (req.method === 'POST' && url.pathname === '/v2/employees/sign_in') {
      res.writeHead(200, { Authorization: MOCK_DIME_TOKEN, 'Content-Type': 'application/json' });
      res.end('{}');
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v2/employees') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: employeeFound ? [{ id: MOCK_DIME_EMPLOYEE_ID }] : [] }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v2/project_efforts') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(Array.from({ length: projectEffortsCount }, (_, i) => ({ id: i }))));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `mock DIME server has no handler for ${req.method} ${url.pathname}` }));
  });

  const port = await new Promise<number>((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '0.0.0.0', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        reject(new Error('Expected the mock DIME server to bind to a TCP port'));
        return;
      }
      resolve(address.port);
    });
  });

  return {
    port,
    certPem,
    requests: () => requests,
    setProjectEffortsCount: (count: number) => {
      projectEffortsCount = count;
    },
    setEmployeeFound: (found: boolean) => {
      employeeFound = found;
    },
    stop: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}
