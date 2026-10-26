import dataSource from '../data-source.js';
import { USER_ROLES, isRole } from '../../../../domain-contracts/auth/index.js';
import { createAuth } from '../../../../modules/auth/infrastructure/better-auth/auth.factory.js';
import { createPgPool } from '../../../../modules/auth/infrastructure/better-auth/pg-pool.js';
import { seedDemoUsers } from './seed-demo-users.js';

const MIN_PASSWORD_LENGTH = 12;

/**
 * Admin command: sets a user's password, or creates the user when it does not
 * exist. Public sign-up is disabled and demo mailboxes cannot receive the
 * recovery email, so this is how a forgotten password is replaced.
 *
 *   USER_EMAIL=… USER_PASSWORD=… [USER_NAME=… USER_ROLE=ADVISOR|DIRECTOR USER_PHONE=…]
 */
async function run() {
  const email = process.env.USER_EMAIL?.trim().toLowerCase();
  const password = process.env.USER_PASSWORD;
  const role = process.env.USER_ROLE ?? USER_ROLES.ADVISOR;

  if (!email || !password) {
    throw new Error('Define USER_EMAIL and USER_PASSWORD');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `USER_PASSWORD must have at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
  if (!isRole(role)) {
    throw new Error('USER_ROLE must be ADVISOR or DIRECTOR');
  }

  await dataSource.initialize();
  const pool = createPgPool();
  try {
    const auth = createAuth(pool);
    const ctx = await auth.$context;
    const existing = await ctx.internalAdapter.findUserByEmail(email);

    if (!existing) {
      const name = process.env.USER_NAME?.trim();
      if (!name) {
        throw new Error(
          `${email} does not exist: define USER_NAME to create it`,
        );
      }
      await seedDemoUsers(auth, dataSource, [
        {
          name,
          email,
          password,
          role,
          advisor:
            role === USER_ROLES.ADVISOR
              ? { phone: process.env.USER_PHONE ?? '' }
              : undefined,
        },
      ]);
      console.log(`Created ${role} ${email}.`);
      return;
    }

    const hash = await ctx.password.hash(password);
    const accounts = await ctx.internalAdapter.findAccounts(existing.user.id);
    const credential = accounts.find((a) => a.providerId === 'credential');
    if (credential) {
      await ctx.internalAdapter.updateAccount(credential.id, {
        password: hash,
      });
    } else {
      await ctx.internalAdapter.linkAccount({
        userId: existing.user.id,
        providerId: 'credential',
        accountId: existing.user.id,
        password: hash,
      });
    }
    // Open sessions keep working until they expire; the new password applies
    // to the next sign-in
    console.log(`Password updated for ${email}.`);
  } finally {
    await pool.end();
    await dataSource.destroy();
  }
}

await run();
