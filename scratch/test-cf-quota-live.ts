import fs from "fs";
import path from "path";

function loadEnv() {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  } catch (e) {
    console.error("Could not load .env.local", e);
  }
}

loadEnv();

async function testCloudflareGraphQLUsage() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  console.log("Querying Cloudflare GraphQL API for live AI usage...");

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)).toISOString();
  const todayEnd = now.toISOString();

  console.log(`Time window (UTC): ${todayStart} to ${todayEnd}`);

  const query = `
    query GetWorkersAIUsage($accountTag: String!, $start: String!, $end: String!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          aiInferenceAdaptiveGroups(
            filter: { datetime_geq: $start, datetime_leq: $end }
            limit: 10
          ) {
            sum {
              totalNeurons
            }
            dimensions {
              model
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          accountTag: accountId,
          start: todayStart,
          end: todayEnd,
        },
      }),
    });

    console.log(`GraphQL HTTP Status: ${res.status}`);
    const data = await res.json();
    console.log("GraphQL Response:", JSON.stringify(data, null, 2));

    if (data.data?.viewer?.accounts?.[0]?.aiInferenceAdaptiveGroups) {
      const groups = data.data.viewer.accounts[0].aiInferenceAdaptiveGroups;
      let total = 0;
      for (const g of groups) {
        total += g.sum?.totalNeurons || 0;
        console.log(`Model: ${g.dimensions?.model} -> ${g.sum?.totalNeurons || 0} neurons`);
      }
      console.log(`\n🔥 TOTAL NEURONS CONSUMED TODAY: ${total} / 10,000`);
      console.log(`REMAINING NEURONS: ${Math.max(0, 10000 - total)}`);
    }
  } catch (err: any) {
    console.error("GraphQL Error:", err);
  }
}

testCloudflareGraphQLUsage();
