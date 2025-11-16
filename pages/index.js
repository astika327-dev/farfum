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
  const data = await shopifyFetch(QUERY, { first: 12 })
  const products = data.products.edges.map(e => e.node)
  return { props: { products }, revalidate: 60 }
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
