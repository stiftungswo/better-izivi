import fs from 'fs';
import path from 'path';

// The dev API's ActionMailer delivery_method is `letter_opener` (see
// config/environments/development.rb), which writes each outgoing email as
// an HTML file under api/tmp/letter_opener/<id>/rich.html instead of
// actually sending it. docker-compose bind-mounts ./api into the container,
// so this directory is readable from the host too.
const LETTER_OPENER_DIR =
  process.env.LETTER_OPENER_DIR ?? path.resolve(__dirname, '..', '..', 'api', 'tmp', 'letter_opener');

/**
 * Polls for a password-reset email delivered after `since` and returns the
 * raw reset token embedded in its body. Devise only ever stores a digest of
 * this token (`users.reset_password_token` in the DB is not the token
 * itself), so the delivered email is the only place the raw value appears.
 */
export async function waitForPasswordResetToken(since: Date, timeoutMs = 5000): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const token = findPasswordResetToken(since);
    if (token) {
      return token;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`No password reset email appeared in ${LETTER_OPENER_DIR} after ${since.toISOString()}`);
}

function findPasswordResetToken(since: Date): string | undefined {
  if (!fs.existsSync(LETTER_OPENER_DIR)) {
    return undefined;
  }

  const candidates = fs
    .readdirSync(LETTER_OPENER_DIR)
    .map((name) => {
      const dir = path.join(LETTER_OPENER_DIR, name);
      return { dir, mtimeMs: fs.statSync(dir).mtimeMs };
    })
    .filter((entry) => entry.mtimeMs >= since.getTime())
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  for (const { dir } of candidates) {
    const filePath = path.join(dir, 'rich.html');
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const match = fs.readFileSync(filePath, 'utf8').match(/passwords\/edit\/([A-Za-z0-9_-]+)/);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}
