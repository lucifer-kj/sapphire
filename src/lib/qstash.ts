import { Client, Receiver } from "@upstash/qstash";

let qstashClient: Client | null = null;
let qstashReceiver: Receiver | null = null;

export function getQStashClient(): Client | null {
  const token = process.env.QSTASH_TOKEN;
  if (!token) return null;

  if (!qstashClient) {
    qstashClient = new Client({ token });
  }
  return qstashClient;
}

export function getQStashReceiver(): Receiver | null {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!currentSigningKey || !nextSigningKey) return null;

  if (!qstashReceiver) {
    qstashReceiver = new Receiver({
      currentSigningKey,
      nextSigningKey,
    });
  }
  return qstashReceiver;
}
