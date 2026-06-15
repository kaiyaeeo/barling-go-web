import Navbar from "@/components/layout/navbar"
import HeroSection from "@/components/landing/HeroSection"
import WhySection from "@/components/landing/WhySection"
import TopUMKMSection from "@/components/landing/TopUMKMSection"
import FavoritesSection from "@/components/landing/FavoritesSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import SponsorsSection from "@/components/landing/SponsorsSection"
import CTASection from "@/components/landing/CTASection"
import {
  getTopUMKM,
  getFavoriteProducts,
  getFeaturedTestimonials,
} from "@/lib/queries/landing"

export default async function HomePage() {
  const [topUMKM, favorites, testimonials] = await Promise.all([
    getTopUMKM(),
    getFavoriteProducts(),
    getFeaturedTestimonials(),
  ])

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <WhySection />
        <TopUMKMSection products={topUMKM} />
        <FavoritesSection initialProducts={favorites} />
        <TestimonialsSection testimonials={testimonials} />
        <SponsorsSection />
        <CTASection />
      </main>
    </>
  )
}
