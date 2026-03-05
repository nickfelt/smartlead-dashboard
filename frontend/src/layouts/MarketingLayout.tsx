import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import MarketingNav from '../components/MarketingNav'
import MarketingFooter from '../components/MarketingFooter'

export default function MarketingLayout() {
  const { pathname } = useLocation()

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  )
}
