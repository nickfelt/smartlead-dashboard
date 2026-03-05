import { Users, Settings, Eye, LayoutDashboard, Server, BarChart2, Layers } from 'lucide-react'
import SolutionTemplate from '../../components/SolutionTemplate'

export default function Agencies() {
  return (
    <SolutionTemplate
      badge="For Agencies"
      headline={`Scale your agency\nwithout the chaos`}
      subheadline="Bookd gives lead gen agencies a single command center to run unlimited client campaigns, with white-label portals your clients will love."
      heroBg="from-[#2A1F0A] via-[#6B4E2A] to-[#C47A2A]"
      painHeadline="The problems every agency knows too well"
      painPoints={[
        {
          icon: <Users size={20} />,
          title: 'Client sprawl',
          desc: 'Jumping between five different logins, spreadsheets, and Slack threads just to get a status update on one client.',
        },
        {
          icon: <Settings size={20} />,
          title: 'Manual everything',
          desc: 'Building sequences from scratch, manually rotating mailboxes, hand-crafting reports — it kills your margins.',
        },
        {
          icon: <Eye size={20} />,
          title: 'No visibility',
          desc: "Clients want dashboards. You're exporting CSVs and pasting numbers into slide decks every week.",
        },
      ]}
      solutionBadge="The Bookd Difference"
      solutionHeadline="One platform. Every client. Full control."
      solutionBody="Bookd centralizes every client campaign under one roof. Each client gets their own white-labeled portal — they see their data, you control everything. Scale from 5 to 50 clients without adding a single headcount."
      solutionStats={[
        { value: '4×',  label: 'More clients managed per operator' },
        { value: '70%', label: 'Reduction in campaign setup time' },
        { value: '22',  label: 'Average clients per Bookd agency' },
        { value: '98%', label: 'Client retention rate' },
      ]}
      features={[
        {
          icon: <LayoutDashboard size={18} />,
          title: 'White-label client portals',
          desc: 'Every client logs into their own branded dashboard. They see their campaigns, analytics, and inbox — nothing else.',
        },
        {
          icon: <Server size={18} />,
          title: 'Smart Senders',
          desc: 'Buy pre-warmed mailboxes directly inside Bookd. DNS auto-configured, ready to send in hours — not weeks.',
        },
        {
          icon: <BarChart2 size={18} />,
          title: 'Advanced analytics',
          desc: 'Reply rates, open rates, bounce rates, and sequence performance — all in real time, per client.',
        },
        {
          icon: <Layers size={18} />,
          title: 'Bulk campaign management',
          desc: 'Clone campaigns across clients, push sequence updates in bulk, and manage all sending schedules from one screen.',
        },
      ]}
      testimonial={{
        quote: "We scaled from 3 to 22 clients in four months without adding headcount. The admin controls are exactly what we needed.",
        author: 'Priya Nair',
        role: 'Head of Growth, LeadFlow Agency',
        avatar: 'PN',
      }}
      ctaHeadline="Ready to run a better agency?"
      ctaBody="Join 180+ agencies already using Bookd to manage more clients, send smarter, and close faster."
    />
  )
}
