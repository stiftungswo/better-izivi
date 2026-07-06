import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { client } from './client';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const API_CONTAINER = 'better_izivi_api';
const API_SERVICE = 'api';

function dockerCompose(args: string[], env: NodeJS.ProcessEnv = process.env): void {
  execFileSync('docker', ['compose', ...args], { cwd: REPO_ROOT, env, stdio: 'pipe' });
}

/**
 * Recreates the `api` container from docker-compose.yml with API_URI_DIME
 * pointed at our mock (or, called with no argument, back at whatever
 * docker-compose.yml defaults it to). This is the only way to change it:
 * AuthenticateInDime reads `ENV.fetch('API_URI_DIME')` fresh on every call,
 * but that env var is only ever set once, at process boot — `docker exec`
 * into the running container wouldn't reach the already-running Puma
 * process's environment.
 */
export function recreateApiContainer(apiUriDime?: string): void {
  const env = { ...process.env };
  if (apiUriDime) {
    env.API_URI_DIME = apiUriDime;
  } else {
    delete env.API_URI_DIME;
  }

  dockerCompose(['up', '-d', '--force-recreate', API_SERVICE], env);
}

/**
 * Installs `certPem` as a trusted CA inside the (freshly recreated) api
 * container. AuthenticateInDime hardcodes `verify_mode = VERIFY_PEER`, so
 * without this the container's Ruby process will refuse to complete the
 * TLS handshake with our self-signed mock.
 */
export function installCaCertInApiContainer(certPem: string): void {
  const tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dime-mock-ca-')), 'dime-mock.crt');
  fs.writeFileSync(tmpFile, certPem);

  try {
    execFileSync('docker', ['cp', tmpFile, `${API_CONTAINER}:/tmp/dime-mock.crt`], { stdio: 'pipe' });
    execFileSync(
      'docker',
      [
        'exec',
        '-u',
        'root',
        API_CONTAINER,
        'sh',
        '-c',
        'cp /tmp/dime-mock.crt /usr/local/share/ca-certificates/dime-mock.crt && update-ca-certificates',
      ],
      { stdio: 'pipe' }
    );
  } finally {
    fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
  }
}

export async function waitForApiReady(timeoutMs = 60000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await client.get('/v1/regional_centers', { timeout: 2000 });
      if (response.status === 200) {
        return;
      }
    } catch {
      // still booting — fall through and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`api container did not become ready within ${timeoutMs}ms`);
}
