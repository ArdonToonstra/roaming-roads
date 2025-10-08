import 'dotenv/config';
import payload from 'payload';

async function run() {
  const { PAYLOAD_SECRET, DATABASE_URI, SEED_USER_EMAILS } = process.env;
  if (!PAYLOAD_SECRET) throw new Error('PAYLOAD_SECRET is required');
  if (!DATABASE_URI) throw new Error('DATABASE_URI is required');

  // Allow override of default emails via env var (comma separated)
  const emails = (SEED_USER_EMAILS || 'you@example.com,other@example.com')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

  console.log('Seeding users:', emails);

  await payload.init({
    config: (await import('../src/payload.config')).default,
  });

  for (const email of emails) {
    const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 });
    if (existing.docs.length > 0) {
      console.log(`User already exists: ${email}`);
      continue;
    }
    const password = process.env.SEED_DEFAULT_PASSWORD || 'ChangeMe!123';
    await payload.create({
      collection: 'users',
      data: { email, password },
    });
    console.log(`Created user ${email} with temporary password '${password}'`);
  }

  console.log('User seeding complete.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
