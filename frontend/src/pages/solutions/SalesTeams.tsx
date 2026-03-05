import { MessageCircle, Clock, ShieldOff, Zap, Flame, Inbox, Link2 } from 'lucide-react'
import SolutionTemplate from '../../components/SolutionTemplate'

export default function SalesTeams() {
  return (
    <SolutionTemplate
      badge="For Sales Teams"
      headline={`More replies.\nLess busywork.`}
      subheadline="Bookd arms SDR teams with AI-written sequences, auto-warmed inboxes, and a unified reply queue — so your reps spend time selling, not configuring."
      heroBg="from-[#1A2A1A] via-[#2A4A30] to-[#4A8A50]"
      painHeadline="Why most cold email programs underperform"
      painPoints={[
        {
          icon: <MessageCircle size={20} />,
          title: 'Low reply rates',
          desc: "Generic sequences, no personalization, and emails that read like they were written by a robot. Prospects ignore them.",
        },
        {
          icon: <Clock size={20} />,
          title: 'Manual personalization',
          desc: 'Writing custom first lines for 300 prospects takes hours. Most teams skip it entirely and wonder why nobody replies.',
        },
        {
          icon: <ShieldOff size={20} />,
          title: 'Deliverability problems',
          desc: 'Cold inboxes, no warmup, and shared domains tanking your sender reputation before you even get going.',
        },
      ]}
      solutionBadge="How Bookd Helps"
      solutionHeadline="Built for SDR teams that need results fast"
      solutionBody="Bookd combines AI-powered copywriting with automated inbox warmup and a centralized reply queue. Your reps wake up to warm conversations — not a list of follow-ups to send manually."
      solutionStats={[
        { value: '38%', label: 'Average open rate' },
        { value: '12%', label: 'Average reply rate' },
        { value: '63%', label: 'Reply lift vs manual copy' },
        { value: '94%', label: 'Inbox placement rate' },
      ]}
      features={[
        {
          icon: <Zap size={18} />,
          title: 'AI copy engine',
          desc: 'Generate full multi-step sequences and custom first lines for every prospect in seconds — powered by GPT-4o.',
        },
        {
          icon: <Flame size={18} />,
          title: 'Automated mailbox warmup',
          desc: 'New inboxes warm up automatically. Bookd manages sending ramp-up so your domain reputation stays healthy at scale.',
        },
        {
          icon: <Inbox size={18} />,
          title: 'Unified reply inbox',
          desc: "All replies across every mailbox and campaign land in one queue. Label, snooze, and reply without context-switching.",
        },
        {
          icon: <Link2 size={18} />,
          title: 'CRM integrations',
          desc: 'Sync replied leads directly to HubSpot, Salesforce, or Pipedrive — no manual data entry, no dropped handoffs.',
        },
      ]}
      testimonial={{
        quote: "Bookd cut our meeting-booked time in half. The AI first lines get replies that our old templates never could.",
        author: 'James Okafor',
        role: 'VP of Sales, Momentum B2B',
        avatar: 'JO',
      }}
      ctaHeadline="Book more meetings, automatically"
      ctaBody="Give your SDR team the AI edge. Start sending smarter sequences today."
    />
  )
}
