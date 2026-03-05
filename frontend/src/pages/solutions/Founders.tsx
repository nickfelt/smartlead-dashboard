import { DollarSign, UserX, Timer, Upload, Sparkles, BarChart2, Play } from 'lucide-react'
import SolutionTemplate from '../../components/SolutionTemplate'

export default function Founders() {
  return (
    <SolutionTemplate
      badge="For Founders"
      headline={`Your first 100 customers\nstart here`}
      subheadline="No sales team? No problem. Bookd lets solo founders and early-stage startups run professional cold email campaigns with zero technical setup."
      heroBg="from-[#1A1A3A] via-[#3A2A6A] to-[#8A5AC2]"
      painHeadline="The founder outreach problem"
      painPoints={[
        {
          icon: <UserX size={20} />,
          title: 'No dedicated sales team',
          desc: "You're the CEO, the product manager, and the SDR all at once. Outreach falls to the bottom of the list.",
        },
        {
          icon: <DollarSign size={20} />,
          title: 'Limited budget',
          desc: "Enterprise outreach tools cost thousands per month. You need something that punches above its weight at a price that makes sense.",
        },
        {
          icon: <Timer size={20} />,
          title: 'Need to move fast',
          desc: 'You need to talk to customers now — not after a 2-week setup, 3 integrations, and a training session.',
        },
      ]}
      solutionBadge="Simple by design"
      solutionHeadline="From zero to first reply in under an hour"
      solutionBody="Bookd is built for speed. Upload your lead list, let the AI write your sequence, connect your inbox, and you're live. No enterprise contract, no sales call required. Start on the Starter plan and scale as you grow."
      solutionStats={[
        { value: '<1hr', label: 'Time to first campaign live' },
        { value: '$149', label: 'Starter plan, per month' },
        { value: '3',    label: 'Active campaigns included' },
        { value: '14d',  label: 'Free trial, no card needed' },
      ]}
      features={[
        {
          icon: <Upload size={18} />,
          title: 'CSV import',
          desc: "Export your prospect list from LinkedIn, Apollo, or any source. Drop it in Bookd and you're ready to go.",
        },
        {
          icon: <Sparkles size={18} />,
          title: 'AI custom first lines',
          desc: 'Bookd reads each prospect\'s profile and writes a personalized opening line that sounds like you wrote it yourself.',
        },
        {
          icon: <BarChart2 size={18} />,
          title: 'Basic analytics',
          desc: 'See exactly who opened, clicked, and replied — so you know which messages are landing and can double down.',
        },
        {
          icon: <Play size={18} />,
          title: 'Guided quick-start',
          desc: "Our setup wizard walks you through connecting your mailbox, importing leads, and launching your first campaign in minutes.",
        },
      ]}
      testimonial={{
        quote: "I booked 11 demos in my first month using Bookd. I was the only person doing sales. Game changer.",
        author: 'Alex Torres',
        role: 'Founder & CEO, Shipyard Labs',
        avatar: 'AT',
      }}
      ctaHeadline="Your pipeline starts with one email"
      ctaBody="Start for free. No credit card, no sales call, no enterprise contract. Just results."
    />
  )
}
