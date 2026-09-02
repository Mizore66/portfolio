import { hashPassword } from "../src/lib/cms/password";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: npm run cms:hash -- 'your-passphrase'");
    process.exit(1);
  }
  const hash = await hashPassword(password);
  process.stdout.write(`${hash}\n`);
}

void main();
