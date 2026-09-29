export interface ActivityItem {
  id: string;
  title: string;
  category: 'Ritual' | 'Welfare' | 'Cultural' | 'Sports';
  date: string;
  time: string;
  location: string;
  description: string;
  featured?: boolean;
  imageSrc?: string;
}

export const activitiesData: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Murti Sthapana & Vedic Prana Pratishtha',
    category: 'Ritual',
    date: 'Day 1 • 28 Sept 2026',
    time: '8:00 AM – 11:30 AM',
    location: 'Main Sanctum, Mahaveer Pandal Ground',
    description:
      'Auspicious installation of our eco-friendly clay Ganesha with traditional Vedic chants, 108 coconut offerings, and holy Kalash Sthapana by revered priests.',
    featured: true,
  },
  {
    id: 'act-2',
    title: 'Daily Morning & Evening Maha Aarti',
    category: 'Ritual',
    date: 'Daily (All 10 Days)',
    time: '7:30 AM & 8:00 PM',
    location: 'Main Sanctum, Mahaveer Pandal Ground',
    description:
      'Grand community Aarti with traditional Dhaak drums, conch blowing, and sacred Deeparadhana. Devotees receive holy Charanamrit and Prasad.',
    featured: true,
  },
  {
    id: 'act-3',
    title: 'Annual Voluntary Blood Donation Camp',
    category: 'Welfare',
    date: 'Day 4 • 1 Oct 2026',
    time: '9:00 AM – 4:00 PM',
    location: 'Club Community Hall',
    description:
      'Our signature philanthropic initiative in partnership with the State Red Cross Blood Bank. Open for all healthy community members and youth volunteers.',
    featured: true,
  },
  {
    id: 'act-4',
    title: 'Bhakti Sandhya & Devotional Music Night',
    category: 'Cultural',
    date: 'Day 5 • 2 Oct 2026',
    time: '6:30 PM – 10:00 PM',
    location: 'Open Air Cultural Stage',
    description:
      'An evening of soulful devotional bhajans, classical flute recitals, and group kirtan performed by local youth artists and invited devotional singers.',
  },
  {
    id: 'act-5',
    title: 'Inter-Ward Youth Cricket & Sports Championship',
    category: 'Sports',
    date: 'Day 6 & 7 • 3–4 Oct 2026',
    time: '8:00 AM – 5:00 PM',
    location: 'Mahaveer Club Sports Ground',
    description:
      'Annual box cricket tournament promoting fitness, youth fellowship, and healthy sportsmanship among neighborhood youth teams.',
  },
  {
    id: 'act-6',
    title: 'Community Anna Seva (Maha Bhog Distribution)',
    category: 'Welfare',
    date: 'Day 8 • 5 Oct 2026',
    time: '12:30 PM – 4:00 PM',
    location: 'Pandal Annakshetra Dining Area',
    description:
      'Serving sanctified Khichdi, Payasam, and traditional satvik bhog to over 3,500 devotees and underprivileged community families.',
  },
  {
    id: 'act-7',
    title: 'Grand Visarjan Shobhayatra & Eco-Immersion',
    category: 'Ritual',
    date: 'Day 10 • 7 Oct 2026',
    time: '3:00 PM Onwards',
    location: 'Procession route to Designated Eco-Waterbody',
    description:
      'Grand farewell procession with traditional folk dances, flower showers, and disciplined eco-friendly immersion in compliance with environmental standards.',
    featured: true,
  },
];
