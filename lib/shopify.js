import fetch from 'node-fetch'

const domain = process.env.SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const endpoint = `https://${domain}/api/2024-10/graphql.json`

export async function shopifyFetch(query, variables = {}) {
  if (!domain || !token) {
    throw new Error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN in env.')
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query, variables })
  })

  const json = await res.json()
  if (json.errors) {
    console.error('Shopify GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    const errorMessage = json.errors.map(e => e.message).join('\n');
    const err = new Error(`Shopify GraphQL error:\n${errorMessage}`);
    throw err
  }
  return json.data
}
