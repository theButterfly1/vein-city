// ─── Vein City — the complete story ──────────────────────────────────────────
// A comic plays before and after every level. Three acts, five characters,
// one buried heart.
//
// CAST
//  MARA  — city engineer, pragmatic, quietly curious
//  DORN  — her supervisor; gruff, evasive… and the last Keeper
//  THEO  — survey tech, Mara's friend, jokes when nervous
//  IMKA  — municipal archivist, knows where the maps lie
//  CITY  — speaks in amber, one word at a time

export const CAST = {
  mara: { name: 'MARA', color: '#C4922A' },
  dorn: { name: 'DORN', color: '#B5451B' },
  theo: { name: 'THEO', color: '#1B6B5E' },
  imka: { name: 'IMKA', color: '#9b7bb8' },
  city: { name: 'THE CITY', color: '#E8B84B' },
  cap:  { name: '', color: '#7a6a55' } // narration caption
};

const P = (bg, actors, lines) => ({ bg, actors, lines });

export const STORY = {
  1: {
    before: [
      P('office', ['dorn', 'mara'], [
        ['cap', 'Day 1. Municipal Works, Sector 9 — the Old District.'],
        ['dorn', "Work order 4471. Leak under the alley off Cooper's Lane. Patch it, file it, forget it."],
        ['mara', 'The pressure log shows a rhythm. Leaks don\'t have rhythms.'],
        ['dorn', 'Old pipes sing, Vasquez. Don\'t write poetry about it. Just fix the leak.']
      ])
    ],
    after: [
      P('alley', ['mara'], [
        ['mara', 'Patched. But the main was warm. Water mains are never warm.'],
        ['cap', 'She rests a palm on the brick. One beat. Then, sixty-two seconds of silence. Then another.'],
        ['mara', "…There's nothing unusual here. Just old pipes and a work order. That's what the report will say."]
      ])
    ]
  },
  2: {
    before: [
      P('street', ['theo', 'mara'], [
        ['theo', 'Crossroads block today! Two mains, one junction, zero coffee. Living the dream.'],
        ['mara', 'Theo — pull the 1968 blueprint for this block.'],
        ['theo', 'Already did. Fun fact: it shows ONE main. So either the map is wrong, or…'],
        ['mara', 'Or someone built something extra. And never filed it.']
      ])
    ],
    after: [
      P('street', ['mara', 'theo'], [
        ['theo', 'Both forks live. Nice work. So… do we report the mystery main?'],
        ['mara', 'Not yet. The blueprint doesn\'t match what\'s down here. I want to know why before Dorn buries it in paperwork.'],
        ['theo', 'Burying things in paperwork is literally his super-power.']
      ])
    ]
  },
  3: {
    before: [
      P('market', ['theo', 'mara'], [
        ['cap', 'Day 3. Under Market Street. The survey shows a loop that feeds nothing.'],
        ['theo', 'Careful down there — half these branches are decoys. Dead loops. They eat your shift.'],
        ['mara', 'A loop nobody uses, that somebody maintained for a century. Who maintains a decoy?']
      ])
    ],
    after: [
      P('tunnel', ['mara'], [
        ['mara', 'The loop wasn\'t dead. It was a bypass — around something. The pipes route AROUND a space the maps say is solid rock.'],
        ['cap', 'She photographs the wall. The mortar is newer than the brick.'],
        ['mara', 'I found something that shouldn\'t exist. I\'m not putting it in my report.']
      ])
    ]
  },
  4: {
    before: [
      P('gaslight', ['mara', 'theo'], [
        ['theo', 'Night shift on Gaslight Row. Romantic. The lamps here flicker in sync, you ever notice?'],
        ['mara', 'In sync with what?'],
        ['theo', '…I was kind of hoping you wouldn\'t ask that.']
      ])
    ],
    after: [
      P('gaslight', ['mara'], [
        ['cap', 'Day 4, 02:14. She times the flicker against her watch.'],
        ['mara', 'Sixty-two seconds. Same as the warm main. Same rhythm, half a district apart.'],
        ['mara', 'One coincidence is a coincidence. Two is a pattern.']
      ])
    ]
  },
  5: {
    before: [
      P('office', ['dorn', 'mara'], [
        ['dorn', 'Laundry Vaults next. And Vasquez — the pressure mains down there run hot. Two-man rule says don\'t poke them.'],
        ['mara', 'Hot how? The boilers were decommissioned in the eighties.'],
        ['dorn', '…Just route around the red zones. That\'s an order, not a riddle.']
      ])
    ],
    after: [
      P('tunnel', ['mara'], [
        ['mara', 'The pressure readings don\'t follow any standard model. No pump, no boiler — and it self-regulates.'],
        ['mara', 'Dorn knew the zones were hot before I filed anything. How did he know?']
      ])
    ]
  },
  6: {
    before: [
      P('clocktower', ['theo', 'mara'], [
        ['theo', 'Found something under the clocktower. Valve stamp. Read the date.'],
        ['mara', '"1824." Theo, the city charter is 1831. This valve is older than the city.'],
        ['theo', 'So who installed plumbing in a city that didn\'t exist yet?']
      ])
    ],
    after: [
      P('clocktower', ['mara', 'theo'], [
        ['mara', 'The network predates the streets. We didn\'t build pipes under a city. Someone built a city on top of pipes.'],
        ['theo', 'I hate how calm you sound right now.']
      ])
    ]
  },
  7: {
    before: [
      P('boiler', ['mara', 'theo'], [
        ['cap', 'Day 7. The Boiler District. Her tools begin to hum.'],
        ['theo', 'Whoa — when you scrape three panels in a line, the fourth one practically opens itself.'],
        ['mara', 'Resonance. The network carries the vibration ahead of us. It\'s… helping?']
      ])
    ],
    after: [
      P('boiler', ['mara'], [
        ['mara', 'Work WITH the rhythm and the city meets you halfway. Work against it and you fight for every panel.'],
        ['mara', 'I\'m starting to think the word for this isn\'t "infrastructure."']
      ])
    ]
  },
  8: {
    before: [
      P('office', ['dorn', 'mara'], [
        ['dorn', 'These photos from Market Street. Where are the originals?'],
        ['mara', 'On the camera you\'re holding, sir.'],
        ['dorn', 'Not anymore. Tannery Cut today. Stick to the work order. And Vasquez — some pipes are old for a reason.']
      ])
    ],
    after: [
      P('rooftop', ['mara'], [
        ['cap', 'Day 9, rooftop, after hours. She buys a notebook with her own money. Unofficial. Unfiled.'],
        ['mara', 'Dorn confiscated evidence. Fine. From now on the real report lives in my pocket.'],
        ['mara', 'Entry one: the city has a pulse, and my supervisor is afraid of it.']
      ])
    ]
  },
  9: {
    before: [
      P('archive', ['imka', 'mara'], [
        ['cap', 'Day 10. The Municipal Archive — basement of the basement.'],
        ['imka', 'You\'re the engineer asking about pre-charter plumbing. Sit. I\'m Imka. I keep what the city forgets.'],
        ['mara', 'Twin Reservoir — the old maps show two intakes that feed each other. That\'s hydraulically impossible.'],
        ['imka', 'The founders called it "the Conduit." The legend says the city drinks, dear. Impossible things usually have older names.']
      ])
    ],
    after: [
      P('tunnel', ['mara'], [
        ['mara', 'Two heartbeats tonight. The city breathed twice. I timed it.'],
        ['mara', 'Two sources, one rhythm. Like… chambers.']
      ])
    ]
  },
  10: {
    before: [
      P('archive', ['imka', 'mara'], [
        ['imka', 'Before you walk the Switchback — know that the survey maps of that block are wrong on purpose.'],
        ['mara', 'On purpose? Who falsifies a sewer map?'],
        ['imka', 'Someone who wanted the route to fold back on itself. A path that hides is a path that\'s guarded.']
      ])
    ],
    after: [
      P('tunnel', ['mara'], [
        ['mara', 'The folds aren\'t chaos. The pattern repeats at different scales, like a signal at different frequencies.'],
        ['mara', 'The pattern isn\'t random. It\'s a message. I just don\'t speak the language yet.']
      ])
    ]
  },
  11: {
    before: [
      P('underpass', ['theo', 'mara'], [
        ['theo', 'Heads up — Old Town Underpass has sealed grates. Original locks, no keys in the registry.'],
        ['mara', 'Then we find the keys where the builders left them. Inside the network itself.'],
        ['theo', 'Cool cool cool. Treasure hunt in a haunted sewer. Normal Tuesday.']
      ])
    ],
    after: [
      P('underpass', ['mara'], [
        ['mara', 'Key fragments, cached behind access panels. Whoever built this WANTED the right person to get through.'],
        ['mara', 'There are sections of this network that don\'t want to be found. And sections that are waiting to be.']
      ])
    ]
  },
  12: {
    before: [
      P('street', ['theo', 'mara'], [
        ['theo', 'Mara. Someone from the Council office was asking about you. By name. About your "off-book survey activity."'],
        ['mara', 'I haven\'t filed anything off-book.'],
        ['theo', 'Exactly. So how do they know?']
      ])
    ],
    after: [
      P('archive', ['mara', 'imka'], [
        ['imka', 'The Annex records you wanted — half are missing. Checked out in 1989 by an office that doesn\'t exist.'],
        ['mara', 'Trust no reports. Including mine. Especially mine.']
      ])
    ]
  },
  13: {
    before: [
      P('foundry', ['theo', 'mara'], [
        ['theo', 'Brought my seismic rig. If your "pulse" is real, this thing will see it. If it\'s not, I get to mock you forever.'],
        ['mara', 'Deal. Run it during the sixty-two-second window.']
      ])
    ],
    after: [
      P('foundry', ['theo', 'mara'], [
        ['theo', '…Mara. I ran it three times. This waveform — it\'s not mechanical. There\'s a refractory period.'],
        ['mara', 'Say it.'],
        ['theo', 'It looks biological. It looks like a pulse because it IS one.']
      ])
    ]
  },
  14: {
    before: [
      P('cistern', ['mara'], [
        ['cap', 'Day 13. The Cistern. Alone. The water is still — until it isn\'t.'],
        ['mara', 'Ripples. Concentric. No drip, no wind. Centered on… me.']
      ])
    ],
    after: [
      P('cistern', ['mara', 'city'], [
        ['cap', 'The completed network glows amber under the water. The ripples spell a rhythm she finally recognizes as deliberate.'],
        ['city', 'S E E N .'],
        ['mara', '…Okay. Okay. I see you too.']
      ])
    ]
  },
  15: {
    before: [
      P('depot', ['theo', 'mara'], [
        ['theo', 'I\'m being reassigned. North sector, effective tomorrow. Dorn signed it personally.'],
        ['mara', 'He\'s isolating me.'],
        ['theo', 'Or protecting you. Honestly with that man I can never tell. Keep the rig. And Mara — keep timing the silence.']
      ])
    ],
    after: [
      P('depot', ['mara'], [
        ['mara', 'Alone now. Fine. The depot junction is live and the rhythm is stronger near the old town core.'],
        ['mara', 'It\'s not spread under the city. It\'s centered. Something is DOWN there, and everything points inward.']
      ])
    ]
  },
  16: {
    before: [
      P('archive', ['imka', 'mara'], [
        ['imka', 'I found it. A maintenance ledger for "the Conduit" — two hundred years of entries. Same families, generation after generation.'],
        ['mara', 'A secret maintenance crew? For two centuries?'],
        ['imka', 'They signed every page the same way. One word: "Keepers."']
      ])
    ],
    after: [
      P('cellar', ['mara'], [
        ['mara', 'The Salt Cellars entry, 1924: "Fed the south chamber through the long winter. It was grateful."'],
        ['mara', 'Grateful. An engineer wrote "grateful" in a maintenance log. And I believe him.']
      ])
    ]
  },
  17: {
    before: [
      P('tunnel', ['mara'], [
        ['cap', 'Day 15. The Fractured Grid. The echoes here feel… wrong.'],
        ['mara', 'The ghost-marks are lying to me. Orientation hints that point AWAY from the connection.'],
        ['mara', 'Something is actively misleading me. But is it the city — or something planted in it?']
      ])
    ],
    after: [
      P('tunnel', ['mara'], [
        ['cap', 'Behind a false echo-plate she finds a modern device. Council asset tag, this fiscal year.'],
        ['mara', 'Jamming rigs. The lies aren\'t the city\'s. Someone is salting the network with false echoes to keep surveyors lost.'],
        ['mara', 'Which means someone official already knows the truth — and is hiding it.']
      ])
    ]
  },
  18: {
    before: [
      P('chapel', ['imka', 'mara'], [
        ['imka', 'The Chapel Undercroft. The oldest Keeper entries start here. And Mara — I pulled the Council\'s docket.'],
        ['mara', 'Tell me.'],
        ['imka', '"Old District Renewal." Demolition, excavation, a deep flush of the entire legacy network. They break ground in twelve days.']
      ])
    ],
    after: [
      P('chapel', ['mara'], [
        ['mara', 'A deep flush would scour every chamber down there at industrial pressure. If something lives in this network…'],
        ['mara', '…a flush isn\'t renovation. It\'s an execution.']
      ])
    ]
  },
  19: {
    before: [
      P('printing', ['imka', 'mara', 'city'], [
        ['imka', 'We print the proof. Ledger scans, your readings, Theo\'s waveform. If the public sees it, the Council can\'t quietly flush it.'],
        ['cap', 'The press lights flicker — sixty-two seconds apart. Then faster.'],
        ['city', 'H U R R Y .']
      ])
    ],
    after: [
      P('printing', ['mara'], [
        ['mara', 'Three intakes under the Printing Quarter, all syncing to one rhythm. Every district. Every block. They\'re all connected to the same thing.'],
        ['mara', 'And the rhythm is speeding up. It knows the clock is running.']
      ])
    ]
  },
  20: {
    before: [
      P('drain', ['dorn', 'mara'], [
        ['cap', 'Day 18. The Black Drain. She isn\'t alone.'],
        ['dorn', 'You shouldn\'t be down here, Vasquez.'],
        ['mara', 'Neither should you. Unless you\'re the one who\'s been re-greasing 1824 valves. Unless you\'re a Keeper.'],
        ['dorn', '…The LAST Keeper. And you\'ve just made yourself the second-to-last. Route the drain. Then we talk.']
      ])
    ],
    after: [
      P('drain', ['dorn', 'mara'], [
        ['dorn', 'My grandmother held this post. Her grandfather before her. We keep it alive; it keeps the city alive. The springs, the warmth, the quiet.'],
        ['mara', 'Why hide it?'],
        ['dorn', 'Because the last time the Council found a miracle under a city, they sold tickets until it died. I confiscated your photos to keep you off their list. I failed.']
      ])
    ]
  },
  21: {
    before: [
      P('office', ['dorn', 'mara', 'imka'], [
        ['dorn', 'The flush feeds through the Convergence — every legacy main meets there. The Council moved the schedule up. Nine days.'],
        ['imka', 'Then we re-route. Open the old relief paths, let the flush spend itself in the river channels.'],
        ['dorn', 'Three of us against a city budget. I\'ve had worse odds. Barely.']
      ])
    ],
    after: [
      P('tunnel', ['mara'], [
        ['mara', 'Convergence mapped and live. The relief plan can work — if every junction between here and the core holds.'],
        ['mara', 'Entry twenty-one: I\'m not investigating anymore. I\'m defending.']
      ])
    ]
  },
  22: {
    before: [
      P('gallery', ['dorn', 'mara', 'theo'], [
        ['cap', 'The Keepers\' Gallery — names carved in stone, two hundred years of them.'],
        ['theo', 'So I heard a rumor my best friend joined a secret pipe cult, and I simply could NOT miss that.'],
        ['mara', 'Theo! Your transfer—'],
        ['theo', 'Quit. Brought the rig. Brought snacks. Let\'s save a city-monster.']
      ])
    ],
    after: [
      P('gallery', ['theo', 'mara'], [
        ['theo', 'Full spectrum scan confirms it: one organism. Roots under every district like a vascular system. The pipes grew AROUND it.'],
        ['mara', 'It\'s alive. The whole time, the city\'s best-kept secret was that it\'s literally alive.']
      ])
    ]
  },
  23: {
    before: [
      P('aqueduct', ['dorn', 'mara'], [
        ['dorn', 'The Aqueduct Spine is the longest relief route. Open it end to end, no leaks, or the flush pressure finds the core.'],
        ['mara', 'Then we don\'t leak.']
      ])
    ],
    after: [
      P('aqueduct', ['mara'], [
        ['mara', 'Strange. The pressure zones eased exactly where we worked, exactly when we needed them to.'],
        ['mara', 'It\'s helping us help it. We\'re not fixing the city. We\'re cooperating with it.']
      ])
    ]
  },
  24: {
    before: [
      P('vault', ['imka', 'mara'], [
        ['imka', 'I "borrowed" the flush schedule from the Council vault records. Don\'t ask how. Bad news.'],
        ['mara', 'How long?'],
        ['imka', 'Three days. They moved it again. Someone upstairs is in a hurry to bury this.']
      ])
    ],
    after: [
      P('vault', ['mara'], [
        ['mara', 'Three days. Relief routes half-open. The vault junction is ours now, at least.'],
        ['mara', 'Funny — the deeper the Council pushes, the louder the city gets. It\'s done whispering.']
      ])
    ]
  },
  25: {
    before: [
      P('gates', ['dorn', 'mara', 'theo'], [
        ['dorn', 'The Flush Gates. When they fire the system, everything passes through here. We open the bypass weirs — legally, mind you. Keeper charter, section one: "preserve the waters."'],
        ['theo', 'Oh good, the secret cult has a LEGAL department.']
      ])
    ],
    after: [
      P('gates', ['mara'], [
        ['mara', 'Bypass set. If the flush comes early, the gates will spill it sideways into the storm channels.'],
        ['mara', 'First time in two hundred years these weirs have moved. They moved like they\'d been waiting.']
      ])
    ]
  },
  26: {
    before: [
      P('glassworks', ['mara', 'city'], [
        ['cap', 'Glassworks Hollow. The amber glow gathers in the old kiln glass and shows her something: a memory.'],
        ['city', 'R E M E M B E R .'],
        ['mara', 'I see it. The founders. They didn\'t discover the spring — the spring CALLED them. The first Keepers built the city as a shelter. For you.']
      ])
    ],
    after: [
      P('glassworks', ['mara'], [
        ['mara', 'Two hundred years ago, people built a city to protect a heart. Then their grandchildren forgot, and called the protection "infrastructure."'],
        ['mara', 'We didn\'t inherit a city. We inherited a promise.']
      ])
    ]
  },
  27: {
    before: [
      P('bridge', ['theo', 'mara'], [
        ['theo', 'Bridge root\'s unstable — Council crews started "pre-demolition survey blasting." Which is demolition with extra paperwork.'],
        ['mara', 'Then we route fast and we route clean. Stay close to me.']
      ])
    ],
    after: [
      P('bridge', ['theo', 'mara'], [
        ['cap', 'A charge collapses a gallery. Theo is cut off — until water surges through a main that should be dry, shoving the rubble aside.'],
        ['theo', '…The city just dug me out. The city. Dug me out.'],
        ['mara', 'It protects what protects it. Welcome to the family, Theo.']
      ])
    ]
  },
  28: {
    before: [
      P('junction', ['dorn', 'mara'], [
        ['dorn', 'Vein Junction. Council crews start at dawn — we hold this node or the relief plan dies here.'],
        ['mara', 'Then it doesn\'t die here.']
      ])
    ],
    after: [
      P('junction', ['dorn', 'mara'], [
        ['dorn', 'Junction holds. You route like a third-generation Keeper, Vasquez. My grandmother would have liked you.'],
        ['mara', 'Flattery, sir? From you? The end really is near.']
      ])
    ]
  },
  29: {
    before: [
      P('antechamber', ['dorn', 'mara'], [
        ['cap', 'The Antechamber. Beyond the last door: the core. The flush fires in one hour.'],
        ['dorn', 'The hold-valves up top need a hand on them the entire time. That\'s my post. The chamber below needs younger hands and an honest heart. That\'s yours.'],
        ['mara', 'Dorn—'],
        ['dorn', 'Take the seal. Two hundred years it\'s passed hand to hand. Don\'t drop it.']
      ])
    ],
    after: [
      P('antechamber', ['mara', 'city'], [
        ['cap', 'The last route closes. The great door breathes open along seams no map ever showed.'],
        ['city', 'C O M E .'],
        ['mara', 'Entry twenty-nine: I\'m going in. If anyone finds this notebook — the city is kind. Be kind back.']
      ])
    ]
  },
  30: {
    before: [
      P('heart', ['mara', 'city'], [
        ['cap', 'The chamber is a cathedral of living conduit. At its center, vast and patient, something glows in time with every lamp above.'],
        ['city', 'Y O U   C A M E .'],
        ['mara', 'Two hundred years you\'ve been beating. We built a city on top of you and never noticed. I noticed. Let me finish the circuit — the flush is coming.'],
        ['city', 'T O G E T H E R .']
      ])
    ],
    after: [
      P('heartlit', ['mara', 'city'], [
        ['cap', 'The flush roars in — and spends itself harmlessly through the open relief veins, a tide turned into a long, slow exhale.'],
        ['city', 'T H A N K   Y O U ,   K E E P E R .'],
        ['mara', 'Final entry: It\'s been beating for two hundred years. Now everyone will feel it — the warm streets, the kind water, the lamps that flicker like a wink.'],
        ['cap', 'Above ground, every district lights at once. The city doesn\'t have a grid. The city has a heartbeat.']
      ])
    ]
  }
};

// One torn journal page per level — Mara's private record.
export const JOURNAL = {
  1: "There's nothing unusual here. Just old pipes and a work order. (The main was warm. Mains aren't warm.)",
  2: "The blueprint doesn't match what's down here. Someone built something extra.",
  3: "I found something that shouldn't exist. I'm not putting it in my report.",
  4: 'The gaslights flicker every sixty-two seconds. So does the warm main. So, I suspect, do I.',
  5: "The pressure readings don't follow any standard model. Whatever is down here — it's self-regulating.",
  6: 'Valve stamp: 1824. City charter: 1831. The plumbing came first. Sit with that.',
  7: 'Scrape in rhythm and the panels loosen ahead of you. The city rewards a steady hand.',
  8: 'Dorn took the photos. So I bought a notebook he can\'t requisition. Entry one.',
  9: 'Two heartbeats. The city breathed twice. I timed it.',
  10: "The pattern isn't random. It's a message, repeated in different frequencies.",
  11: "There are sections of this network that don't want to be found. And keys for the ones that do.",
  12: 'Records checked out in 1989 by an office that never existed. Trust no reports. Especially mine.',
  13: "Theo's waveform has a refractory period. Machines don't rest between beats. Hearts do.",
  14: 'The water spelled a word tonight. SEEN. I said it back.',
  15: "They reassigned Theo. Fine. The rhythm is loudest toward the old core. Everything points inward.",
  16: 'A 1924 log reads "It was grateful." Engineers don\'t write grateful. Keepers do.',
  17: 'False echoes with Council asset tags. The city never lied to me. People did.',
  18: '"Renewal" means a deep flush at industrial pressure. For what lives down here, that\'s not renovation.',
  19: 'Three intakes, one rhythm, and it\'s speeding up. It knows about the clock.',
  20: "Dorn is the last Keeper. Was. There are two of us now.",
  21: "I'm not investigating anymore. I'm defending.",
  22: "Theo's scan: one organism, roots under every district. The pipes grew around it.",
  23: 'The pressure eased exactly where we worked. We are being helped.',
  24: 'Three days. The louder the Council gets, the louder the city gets. It\'s done whispering.',
  25: 'The bypass weirs moved like they\'d been waiting two hundred years. Maybe they had.',
  26: "We didn't inherit a city. We inherited a promise.",
  27: 'It dug Theo out of the rubble. It protects what protects it.',
  28: '"You route like a third-generation Keeper." From Dorn, that\'s a love letter.',
  29: 'Taking the seal below. If anyone finds this notebook: the city is kind. Be kind back.',
  30: "It's been beating for two hundred years. We built the city on top of it, and never noticed. Now we'll never forget."
};

// Relic fragments — one per level (F-05 District Collections).
const RICONS = ['valve', 'token', 'blueprint', 'gear', 'key', 'lens', 'seal', 'coin', 'vial', 'bolt'];
export const RELICS = {};
const RNAMES = [
  'Rusted Valve Wheel', 'Brass Junction Token', 'Blueprint Corner (1824)', 'Worm-Gear Fragment', 'Underpass Skeleton Key',
  'Surveyor\'s Cracked Lens', 'Wax Keeper Seal', 'Charter-Year Coin', 'Amber Water Vial', 'Resonant Anchor Bolt',
  'Tram Depot Punch Card', 'Salt-Crusted Hinge', 'Echo Plate (False)', 'Chapel Stone Chip', 'Press Type Slug',
  'Black Drain Grate Ring', 'Convergence Survey Pin', 'Gallery Name Rubbing', 'Aqueduct Capstone Shard', 'Council Docket Stamp',
  'Weir Crank Handle', 'Kiln Glass Droplet', 'Bridge Root Rivet', 'Junction Signal Bell', 'Antechamber Door Scale',
  'First Keeper\'s Pen Nib', 'Sixty-Two-Second Watch', 'Theo\'s Lucky Stylus', 'Imka\'s Index Card', 'A Single Warm Pebble'
];
for (let i = 1; i <= 30; i++) {
  RELICS[i] = { name: RNAMES[i - 1], icon: RICONS[(i - 1) % RICONS.length] };
}

// Mara's Intuition — cryptic hints (F-04), cycled per level.
export const HINTS = [
  'The pressure always finds the path of least resistance…',
  'Old pipes run straight until the street forces them to turn.',
  'When in doubt, follow the warmth from the source outward.',
  'The city never wastes a junction. If a branch exists, something needed it.',
  'Three panels in a line, and the fourth loosens itself. Keep the rhythm.',
  'A ghost-mark is a memory. In the deep blocks, memories can be planted.',
  'Red zones cost double. The long way around is sometimes the short way through.',
  'Locked grates mean a key was cached nearby. Builders were practical people.',
  'Scan first. Move second. The budget forgives the patient.',
  'Every sink is fed eventually. Work backwards from where the water must arrive.'
];

export const ENDING = {
  threeStar: 'PERFECT CIRCUIT — the city\'s pulse rings clear across every district. Somewhere above, every gaslight winks at once.',
  normal: 'The circuit holds. The flush spends itself in the relief veins, and the heart beats on.'
};
