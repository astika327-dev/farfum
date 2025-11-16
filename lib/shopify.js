import fetch from 'node-fetch'

const domain = process.env.SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const endpoint = `https://${domain}/api/2024-10/graphql.json`

export async function shopifyFetch(query, variables = {}) {
  console.log('--- Shopify Fetch Diagnostic ---');
  console.log('SHOPIFY_STORE_DOMAIN:', domain);
  console.log('SHOPIFY_STOREFRONT_ACCESS_TOKEN is set:', !!token);

  if (!domain || !token) {
    console.error('ERROR: Missing Shopify environment variables.');
    throw new Error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN in env.')
  }

  try {
    const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query, variables })
    })

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`ERROR: Shopify API request failed with status ${res.status}:`, errorText);
      throw new Error(`Shopify API request failed: ${res.statusText}`);
    }

    const json = await res.json()
    if (json.errors) {
      console.error('ERROR: Shopify GraphQL Errors:', JSON.stringify(json.errors, null, 2));
      const errorMessage = json.errors.map(e => e.message).join('\n');
      const err = new Error(`Shopify GraphQL error:\n${errorMessage}`);
      throw err
    }
    console.log('SUCCESS: Shopify data fetched successfully.');
    return json.data
  } catch (error) {
    console.error('FATAL: An unexpected error occurred during the Shopify fetch operation:', error);
    throw error;
  }
}
