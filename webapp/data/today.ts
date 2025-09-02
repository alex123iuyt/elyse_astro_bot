export type Story = { id: string; title: string; text: string; image: string }
export type Summary = {
  transitsCount: number;
  focus: string[];
  troubles: string[];
  leadTitle?: string;
  leadParagraphs: string[];
}
export type LunarPhase = { dateISO: string; phase: 'new'|'waxing'|'full'|'waning'; label: string }
export type AltHoroscope = { id: string; title: string; image: string }

export const stories: Story[] = [
  {
    id: 'love',
    title: 'Love',
    text: "Don’t be afraid to open up and be vulnerable. Vulnerability can bring you closer together and strengthen your love.",
    image: 'https://images.unsplash.com/photo-1519120944692-1a8d8cfc1056?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'balance',
    title: 'Stay grounded',
    text: 'Center yourself with simple rituals: mindful breathing, short walks, and journaling will keep your energy balanced.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'luck',
    title: 'Today’s luck',
    text: 'Fortune favors calm persistence. Choose one important task — and gently move it forward today.',
    image: 'https://images.unsplash.com/photo-1520248730239-095647cc37f1?q=80&w=1200&auto=format&fit=crop',
  },
]

export const summaryToday: Summary = {
  transitsCount: 5,
  focus: ['Communication','Relationships','Creativity'],
  troubles: ['Misunderstandings','Conflicts','Delays'],
  leadTitle: 'Stay Grounded',
  leadParagraphs: [
    'During this time, expect misunderstandings due to conflicting energies. Practice clear communication.',
    'Creative outlets will help you release stress and find balance.'
  ],
}

export const lunarWeek: LunarPhase[] = [
  { dateISO:'2025-08-01', phase:'new',   label:'Aug 1'  },
  { dateISO:'2025-08-09', phase:'full',  label:'Aug 9'  },
  { dateISO:'2025-08-16', phase:'waning',label:'Aug 16' },
  { dateISO:'2025-08-23', phase:'new',   label:'Aug 23' },
]

export const altHoroscopes: AltHoroscope[] = [
  { id:'indian-lunar', title:'Indian lunar', image:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop' },
  { id:'indian-solar', title:'Indian solar', image:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop' },
  { id:'mayan',        title:'Mayan',        image:'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop' },
]


















