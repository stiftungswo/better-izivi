const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.TEST_DB_HOST || 'localhost';
const DB_PORT = Number(process.env.TEST_DB_PORT || 23306);
const DB_USER = process.env.TEST_DB_USER || 'root';
const DB_PASSWORD = process.env.TEST_DB_PASSWORD || '';
const DB_NAME = process.env.TEST_DB_NAME || 'better_izivi_development';

// Devise's default `stretches` (bcrypt cost) outside the test environment.
// This app's initializer doesn't override it, so it applies to the
// development database this suite runs against.
const BCRYPT_COST = 12;

const REGIONAL_CENTER_SHORT_NAME = 'IT-Bootstrap';
const ADMIN_EMAIL = 'integration-test-admin@example.com';
const ADMIN_PASSWORD = 'password123';
const ADMIN_ZDP = 900001;

/**
 * Bootstraps the two fixtures the API itself has no way to create and every
 * other test in this suite needs transitively: a RegionalCenter (no create
 * endpoint exists, but User#regional_center_id is a required FK) and one
 * admin user (self-registration can never produce an admin).
 *
 * This talks to MySQL directly instead of going through `rails db:seed` /
 * ActiveRecord on purpose: seeding is Ruby application code, so it can be
 * broken by exactly the kind of mid-upgrade regression this suite exists to
 * catch (see api/db/seed_data/services.rb, which was broken on `develop` by
 * an unrelated model change and nobody noticed because nothing exercised
 * `db:seed`). This bootstrap only depends on the DB schema being loaded, so
 * it keeps working even while the Rails app itself is mid-breakage.
 */
module.exports = async function globalSetup() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    const regionalCenterId = await ensureRegionalCenter(connection);
    await ensureAdminUser(connection, regionalCenterId);
  } finally {
    await connection.end();
  }
};

async function ensureRegionalCenter(connection) {
  const [existing] = await connection.execute('SELECT id FROM regional_centers WHERE short_name = ?', [
    REGIONAL_CENTER_SHORT_NAME,
  ]);
  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await connection.execute(
    'INSERT INTO regional_centers (name, address, short_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    ['Integration Test Regional Center', 'Bootstrapped by integration-tests/globalSetup.js', REGIONAL_CENTER_SHORT_NAME]
  );
  return result.insertId;
}

async function ensureAdminUser(connection, regionalCenterId) {
  const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL]);
  if (existing.length > 0) {
    return;
  }

  const encryptedPassword = bcrypt.hashSync(ADMIN_PASSWORD, BCRYPT_COST);

  await connection.execute(
    `INSERT INTO users (
       email, encrypted_password, zdp, first_name, last_name, address, zip, role,
       city, hometown, birthday, phone, bank_iban, health_insurance,
       regional_center_id, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      ADMIN_EMAIL,
      encryptedPassword,
      ADMIN_ZDP,
      'Integration',
      'Admin',
      'Teststrasse 1',
      8000,
      1, // enum role: admin
      'Testcity',
      'Testhometown',
      '2000-01-01',
      '079 000 00 00',
      'CH9300762011623852957',
      'Testversicherung',
      regionalCenterId,
    ]
  );
}
