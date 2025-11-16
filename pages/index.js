import Link from 'next/link'
import { shopifyFetch } from '../lib/shopify'

const QUERY = `query ProductList($first:Int!) {
  products(first:$first) {
    edges {
      node {
        id
        handle
        title
        description
        images(first:1) { edges { node { url, altText } } }
        variants(first:1) { edges { node { price { amount, currencyCode } } } }
      }
    }
  }
}`

export async function getStaticProps() {
  console.log('--- Starting getStaticProps for Home page ---');
  try {
    const data = await shopifyFetch(QUERY, { first: 12 });
    if (!data || !data.products) {
      console.error('ERROR: Invalid data structure received from Shopify:', data);
      throw new Error('Invalid data structure from Shopify.');
    }
    const products = data.products.edges.map(e => e.node);
    console.log(`SUCCESS: Fetched ${products.length} products for the Home page.`);
    return { props: { products }, revalidate: 60 };
  } catch (error) {
    console.error('FATAL: getStaticProps failed for the Home page.', error);
    // Re-throwing the error is important. It will cause the build to fail
    // and surface the error in the Vercel build logs.
    throw error;
  }
}

export default function Home({ products }) {
  return (
    <main style={{ maxWidth: 960, margin: '32px auto', padding: 16 }}>
      <h1>Perfume Shop — Products</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {products.map(p => (
          <article key={p.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
            <Link href={`/product/${encodeURIComponent(p.handle)}`}>
              <a style={{ textDecoration: 'none', color: 'inherit' }}>
                <img src={p.images?.edges?.[0]?.node?.url || '/placeholder.png'} alt={p.images?.edges?.[0]?.node?.altText || p.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6 }} />
                <h2>{p.title}</h2>
                <p>{p.description?.slice(0,100)}</p>
                <p><strong>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: p.variants.edges[0].node.price.currencyCode }).format(p.variants.edges[0].node.price.amount)}</strong></p>
              </a>
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}
