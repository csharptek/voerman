export const MOVES = [
  { id: 'VGM-2026-0847', ref: 'VM-NL-2026-8472', date: '20 Feb 2026', customer: 'Van der Berg Family', from: 'Amsterdam, Netherlands', to: 'Singapore', volume: '42 m³', revenue: '€11,800', points: 4850, status: 'Credited', invoice: 'Paid' },
  { id: 'VGM-2026-0846', ref: 'VM-DE-2026-3341', date: '18 Feb 2026', customer: 'Schmidt GmbH', from: 'Berlin, Germany', to: 'New York, USA', volume: '68 m³', revenue: '€17,500', points: 5200, status: 'Approved', invoice: 'Paid' },
  { id: 'VGM-2026-0845', ref: 'VM-CN-2026-1129', date: '15 Feb 2026', customer: 'Chen Corporation', from: 'Shanghai, China', to: 'Rotterdam, Netherlands', volume: '95 m³', revenue: '€20,800', points: 6100, status: 'Pending', invoice: 'Pending' },
  { id: 'VGM-2026-0844', ref: 'VM-UK-2026-7755', date: '12 Feb 2026', customer: 'Johnson Relocation', from: 'London, UK', to: 'Sydney, Australia', volume: '112 m³', revenue: '€26,900', points: 7300, status: 'Credited', invoice: 'Paid' },
  { id: 'VGM-2026-0843', ref: 'VM-FR-2026-5521', date: '10 Feb 2026', customer: 'Dubois Family', from: 'Paris, France', to: 'Tokyo, Japan', volume: '78 m³', revenue: '€15,900', points: 4200, status: 'Credited', invoice: 'Paid' },
  { id: 'VGM-2026-0842', ref: 'VM-BE-2026-9384', date: '08 Feb 2026', customer: 'Brussels Corp', from: 'Brussels, Belgium', to: 'Dubai, UAE', volume: '55 m³', revenue: '€13,400', points: 3850, status: 'Rejected', invoice: 'Paid' },
  { id: 'VGM-2026-0841', ref: 'VM-NL-2026-2267', date: '05 Feb 2026', customer: 'Utrecht Family', from: 'Utrecht, Netherlands', to: 'Toronto, Canada', volume: '64 m³', revenue: '€18,200', points: 5100, status: 'Credited', invoice: 'Paid' },
  { id: 'VGM-2026-0840', ref: 'VM-ES-2026-4498', date: '03 Feb 2026', customer: 'Garcia Relocation', from: 'Madrid, Spain', to: 'São Paulo, Brazil', volume: '88 m³', revenue: '€20,100', points: 5800, status: 'Approved', invoice: 'Paid' },
]

export const REWARDS = [
  { id: 1, icon: '✈️', name: 'Business Class Upgrade', desc: 'Upgrade any flight to business class for you or your team on international routes.', points: 5000, color: 'rgba(0,102,204,0.1)' },
  { id: 2, icon: '🏨', name: 'Hotel Voucher – 3 Nights', desc: 'Stay at 4-star hotels worldwide, valid at 200+ properties across 60 countries.', points: 3500, color: 'rgba(16,185,129,0.1)' },
  { id: 3, icon: '🎁', name: 'Amazon Gift Card €100', desc: 'Redeemable on Amazon.com or Amazon.eu for any purchase.', points: 2000, color: 'rgba(245,158,11,0.1)' },
  { id: 4, icon: '📦', name: 'Priority Move Processing', desc: 'Your next move gets VIP processing — faster customs, priority scheduling.', points: 1500, color: 'rgba(139,92,246,0.1)' },
  { id: 5, icon: '🍽️', name: 'Fine Dining Experience', desc: 'Dinner for two at Michelin-starred restaurants across Europe and Asia.', points: 4000, color: 'rgba(239,68,68,0.1)' },
  { id: 6, icon: '💳', name: 'Voerman Move Credit', desc: 'Apply points as a direct discount on your next international move invoice.', points: 1000, color: 'rgba(16,185,129,0.1)' },
  { id: 7, icon: '🚢', name: 'Premium Storage – 3 Months', desc: 'Climate-controlled storage at any Voerman facility worldwide.', points: 2500, color: 'rgba(0,102,204,0.1)' },
  { id: 8, icon: '🎓', name: 'Training Workshop', desc: 'Access to Voerman partner training and certification programs.', points: 1200, color: 'rgba(245,158,11,0.1)' },
  { id: 9, icon: '🌍', name: 'VIP Concierge Service', desc: 'Dedicated move concierge for your top client — white-glove treatment end-to-end.', points: 8000, color: 'rgba(23,22,48,0.1)' },
]

export const GROUP_CODES = [
  { id: 'VMG-EMEA-2024', name: 'EMEA Group', members: 14, moves: 892, pooledPts: 47200, yourPts: 21450, status: 'Active' },
  { id: 'VMG-APAC-2024', name: 'Asia Pacific', members: 7, moves: 341, pooledPts: 18500, yourPts: 3130, status: 'Active' },
  { id: 'VMG-AMER-2025', name: 'Americas', members: 9, moves: 475, pooledPts: 26100, yourPts: 0, status: 'Observer' },
]

export const MONTHLY_DATA = [
  { month: 'Jan', moves: 0, points: 0, revenue: 0 },
  { month: 'Feb', moves: 8, points: 38550, revenue: 144600 },
  { month: 'Mar', moves: 0, points: 0, revenue: 0 },
  { month: 'Apr', moves: 0, points: 0, revenue: 0 },
  { month: 'May', moves: 0, points: 0, revenue: 0 },
  { month: 'Jun', moves: 0, points: 0, revenue: 0 },
  { month: 'Jul', moves: 0, points: 0, revenue: 0 },
  { month: 'Aug', moves: 0, points: 0, revenue: 0 },
  { month: 'Sep', moves: 0, points: 0, revenue: 0 },
  { month: 'Oct', moves: 0, points: 0, revenue: 0 },
  { month: 'Nov', moves: 0, points: 0, revenue: 0 },
  { month: 'Dec', moves: 0, points: 0, revenue: 0 },
]
