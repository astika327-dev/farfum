import { shopifyFetch } from '../../lib/shopify'

const QUERY = `query ProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id
    title
    description
    images(first:5) { edges { node { url, altText } } }
    variants(first:10) { edges { node { id, price, title } } }
  }
}`

export async function getStaticPaths() {
  // Simple: fetch first 50 product handles
  const PATHS_QUERY = `query Handles($first:Int!){ products(first:$first){ edges { node { handle } } } }`
  const data = await shopifyFetch(PATHS_QUERY, { first: 50 })
  const handles = data.products.edges.map(e => e.node.handle)
  return {
    paths: handles.map(h => ({ params: { id: h } })),
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  const data = await shopifyFetch(QUERY, { handle: params.id })
  const product = data.productByHandle
  if (!product) return { notFound: true }
  return { props: { product }, revalidate: 60 }
}

export default function ProductPage({ product }) {
  return (
    <main style={{ maxWidth: 900, margin: '32px auto', padding: 16 }}>
      <h1>{product.title}</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <img src={product.images.edges?.[0]?.node?.url || '/placeholder.png'} alt={product.title} style={{ width: '100%', borderRadius: 8 }} />
        </div>
        <div style={{ flex: 1 }}>
          <p>{product.description}</p>
          <h3>Variants</h3>
          <ul>
            {product.variants.edges.map(v => (
              <li key={v.node.id}>{v.node.title} — {v.node.price}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
