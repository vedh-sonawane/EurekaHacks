// Static demo data — destinations, vibes, and the swipe-feed shorts.

const VIBES = [
  { key: 'beach',     label: 'Beaches',         icon: 'beach_access' },
  { key: 'food',      label: 'Food tours',      icon: 'restaurant' },
  { key: 'hiking',    label: 'Hiking',          icon: 'hiking' },
  { key: 'culture',   label: 'Culture',         icon: 'temple_buddhist' },
  { key: 'nightlife', label: 'Nightlife',       icon: 'nightlife' },
  { key: 'family',    label: 'Family',          icon: 'family_restroom' },
  { key: 'adventure', label: 'Adventure',       icon: 'paragliding' },
  { key: 'spa',       label: 'Spa & wellness',  icon: 'spa' },
  { key: 'photo',     label: 'Photography',     icon: 'photo_camera' },
  { key: 'shopping',  label: 'Shopping',        icon: 'shopping_bag' },
  { key: 'wildlife',  label: 'Wildlife',        icon: 'pets' },
  { key: 'history',   label: 'History',         icon: 'account_balance' },
];

const DESTINATIONS = [
  { name: 'Bali, Indonesia',    emoji: '🌴', tag: 'Trending now' },
  { name: 'Lisbon, Portugal',   emoji: '🚋', tag: 'Editor pick' },
  { name: 'Tokyo, Japan',       emoji: '🗼', tag: 'Cherry blossom season' },
  { name: 'Mexico City',        emoji: '🌮', tag: 'Best for food' },
  { name: 'Reykjavík, Iceland', emoji: '❄️', tag: 'Aurora season' },
  { name: 'Cape Town, SA',      emoji: '🏔️', tag: 'Adventure' },
];

// Short-form video feed. Each item carries a "scene" descriptor we use to
// render a simulated short (gradient + caption + creator) — no real video assets.
const SHORTS = [
  { id: 'b1', creator: '@aria.travels',  caption: 'Sunrise at Uluwatu cliffs is unreal 🌅',                        vibe: ['beach','photo'],     loc: 'Uluwatu',      hue: 210, hue2: 30,  views: '1.2M' },
  { id: 'b2', creator: '@nomadnathan',   caption: '5 hidden warungs locals don\'t want you to find',                vibe: ['food','culture'],    loc: 'Ubud',         hue: 35,  hue2: 15,  views: '480K' },
  { id: 'b3', creator: '@lin.shoots',    caption: 'Tegalalang at golden hour — bring a wide lens',                  vibe: ['photo','culture'],   loc: 'Tegalalang',   hue: 130, hue2: 60,  views: '2.1M' },
  { id: 'b4', creator: '@surf.diaries',  caption: 'Day 3 of learning to surf in Canggu and I finally stood up',     vibe: ['beach','adventure'], loc: 'Canggu',       hue: 195, hue2: 220, views: '780K' },
  { id: 'b5', creator: '@hike.weekly',   caption: 'Mt. Batur sunrise hike — worth the 3am wake up',                 vibe: ['hiking','adventure'],loc: 'Mt. Batur',    hue: 265, hue2: 320, views: '950K' },
  { id: 'b6', creator: '@spa.escapes',   caption: 'Floating breakfast + jungle spa = perfect rest day',             vibe: ['spa','beach'],       loc: 'Ubud',         hue: 165, hue2: 195, views: '320K' },
  { id: 'b7', creator: '@nightowl.bali', caption: 'Beach club hopping in Seminyak after dark',                      vibe: ['nightlife','beach'], loc: 'Seminyak',     hue: 290, hue2: 340, views: '1.5M' },
  { id: 'b8', creator: '@temple.routes', caption: 'Tirta Empul water blessing — go early, skip the crowds',         vibe: ['culture','history'], loc: 'Tampaksiring', hue: 220, hue2: 180, views: '610K' },
  { id: 'b9', creator: '@waterfall.co',  caption: 'Sekumpul waterfall took 4 hours and was 100% worth it',          vibe: ['adventure','photo'], loc: 'Sekumpul',     hue: 175, hue2: 140, views: '890K' },
  { id: 'b10',creator: '@cafehopper',    caption: 'The smoothie bowl economy of Canggu, ranked',                    vibe: ['food'],              loc: 'Canggu',       hue: 12,  hue2: 340, views: '410K' },
  { id: 'b11',creator: '@island.dani',   caption: 'Nusa Penida day trip — Kelingking is a dream',                   vibe: ['beach','adventure'], loc: 'Nusa Penida',  hue: 200, hue2: 230, views: '3.1M' },
  { id: 'b12',creator: '@market.maya',   caption: 'Sunday morning at Ubud Art Market with my mom',                  vibe: ['shopping','family'], loc: 'Ubud',         hue: 50,  hue2: 20,  views: '210K' },
];

// Built itinerary used in Review + Trip screens.
const SAMPLE_ITINERARY = {
  destination: 'Bali, Indonesia',
  dates: 'May 12 – May 16',
  days: [
    { day: 1, label: 'Mon', date: 'May 12', subtitle: 'Arrival + south coast', activities: [
      { time: '09:30', dur: '1h', title: 'Breakfast at Crate Café',         where: 'Canggu',         icon: 'breakfast_dining', vibe: 'food',     inspiredBy: 'b10' },
      { time: '11:00', dur: '2h', title: 'Surf lesson — beginner break',    where: 'Batu Bolong Beach', icon: 'surfing',       vibe: 'beach',    inspiredBy: 'b4'  },
      { time: '15:00', dur: '3h', title: 'Sunset at Uluwatu cliffs',        where: 'Uluwatu Temple', icon: 'landscape',        vibe: 'photo',    inspiredBy: 'b1'  },
      { time: '20:00', dur: '2h', title: 'Beach club dinner — Single Fin',  where: 'Uluwatu',        icon: 'nightlife',        vibe: 'nightlife',inspiredBy: 'b7'  },
    ]},
    { day: 2, label: 'Tue', date: 'May 13', subtitle: 'Up the mountain',     activities: [
      { time: '03:15', dur: '5h', title: 'Mt. Batur sunrise hike',          where: 'Kintamani',       icon: 'hiking',           vibe: 'hiking',   inspiredBy: 'b5'  },
      { time: '11:00', dur: '1h', title: 'Hot springs recovery',            where: 'Toya Devasya',    icon: 'spa',              vibe: 'spa',      inspiredBy: 'b6'  },
      { time: '14:00', dur: '2h', title: 'Tegalalang rice terraces',        where: 'Tegalalang',      icon: 'eco',              vibe: 'photo',    inspiredBy: 'b3'  },
      { time: '19:00', dur: '2h', title: 'Dinner at Locavore To Go',        where: 'Ubud',            icon: 'restaurant',       vibe: 'food',     inspiredBy: 'b2'  },
    ]},
    { day: 3, label: 'Wed', date: 'May 14', subtitle: 'Temples + waterfalls', activities: [
      { time: '07:00', dur: '2h', title: 'Tirta Empul blessing',            where: 'Tampaksiring',    icon: 'temple_hindu',     vibe: 'culture',  inspiredBy: 'b8'  },
      { time: '10:30', dur: '4h', title: 'Sekumpul waterfall trek',         where: 'North Bali',      icon: 'water',            vibe: 'adventure',inspiredBy: 'b9'  },
      { time: '17:00', dur: '2h', title: 'Floating jungle spa',             where: 'Ubud',            icon: 'spa',              vibe: 'spa',      inspiredBy: 'b6'  },
    ]},
    { day: 4, label: 'Thu', date: 'May 15', subtitle: 'Island day trip',     activities: [
      { time: '07:00', dur: '10h',title: 'Nusa Penida — Kelingking + Diamond Beach', where: 'Nusa Penida', icon: 'sailing',     vibe: 'adventure',inspiredBy: 'b11' },
      { time: '20:00', dur: '2h', title: 'Late dinner at La Brisa',         where: 'Canggu',          icon: 'restaurant',       vibe: 'food',     inspiredBy: 'b10' },
    ]},
    { day: 5, label: 'Fri', date: 'May 16', subtitle: 'Slow morning + flight', activities: [
      { time: '09:00', dur: '2h', title: 'Ubud Art Market',                 where: 'Ubud',            icon: 'storefront',       vibe: 'shopping', inspiredBy: 'b12' },
      { time: '12:00', dur: '1h', title: 'Goodbye smoothie bowl',           where: 'Crate Café',      icon: 'breakfast_dining', vibe: 'food',     inspiredBy: 'b10' },
      { time: '15:00', dur: '1h', title: 'Transfer to DPS',                 where: 'Denpasar Airport',icon: 'flight_takeoff',   vibe: '',         inspiredBy: null  },
    ]},
  ],
};

window.AppData = { VIBES, DESTINATIONS, SHORTS, SAMPLE_ITINERARY };
