import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { hashPassword } from "../src/lib/cms/password";

async function readPassphrase(): Promise<string> {
  const fromArg = process.argv[2];
  if (fromArg) return fromArg;
  if (input.isTTY) {
    const rl = createInterface({ input, output });
    const typed = await rl.question("New passphrase (will not be stored): ");
    rl.close();
    return typed;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of input) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8").trim();
}

async function main() {
  const password = await readPassphrase();
  if (!password) {
    console.error("Usage: npm run cms:hash");
    console.error("Type a passphrase at the prompt, or pipe one in. Put only the Argon2id hash in ADMIN_PASSWORD_HASH.");
    process.exit(1);
  }
  const hash = await hashPassword(password);
  process.stdout.write(`${hash}\n`);
}

void main();
