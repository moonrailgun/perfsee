import { Layout, Advantages, HomeBanner, HomeFeatures, HomePrices } from './components'

export function Home() {
  return (
    <Layout title="Perfsee" description="">
      <HomeBanner />
      <Advantages />
      <HomeFeatures />
      <HomePrices />
    </Layout>
  )
}
