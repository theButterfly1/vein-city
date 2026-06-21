// English — the complete base. Every other locale falls back to these keys
// until translated. Keys are grouped: ui (menu/HUD chrome), ads, ach
// (achievements), and — added during string extraction — levels and story.

export default {
  // ── menu / town ────────────────────────────────────────────────────────────
  'ui.title': 'VEIN CITY',
  'ui.tagline': '“The city doesn\'t have a grid. The city has a heartbeat.”',
  'ui.districtsAlive': '{n} / 30 DISTRICTS ALIVE',
  'ui.play': '▸ LEVEL {n} — {name}',
  'ui.replay': 'REPLAY BLOCKS',
  'ui.districts': 'DISTRICTS',
  'ui.journal': 'JOURNAL',
  'ui.language': 'LANGUAGE',
  'ui.soundOn': 'SOUND ◉',
  'ui.soundOff': 'SOUND ○',
  'ui.hint': 'drag to slide · pinch / wheel to zoom · twist or dials to rotate · tap the beacon to play',
  'ui.comesAlive': '{name} — COMES ALIVE',
  'ui.blockDark': 'THIS BLOCK IS STILL DARK — solve the marked district first',
  'ui.cityDistricts': 'CITY DISTRICTS',
  'ui.open': 'OPEN',
  'ui.solved': 'LEVEL {n} — SOLVED',

  // ── comic ────────────────────────────────────────────────────────────────────
  'ui.skip': 'SKIP ▸▸',

  // ── advertising ──────────────────────────────────────────────────────────────
  'ads.outOfMoves': 'NOT ENOUGH MOVES',
  'ads.watchForMoves': '▸ WATCH AD · +5 MOVES',
  'ads.rewardMoves': '+5 MOVES',

  // ── achievements ─────────────────────────────────────────────────────────────
  'ach.title': 'ACHIEVEMENTS',
  'ach.unlocked': 'ACHIEVEMENT — {name}',
  'ach.act1_clear': 'Apprentice Surveyor',
  'ach.act1_clear.desc': 'Finish Act I — The Assignment.',
  'ach.act2_clear': 'Keeper of Secrets',
  'ach.act2_clear.desc': 'Finish Act II.',
  'ach.act3_clear': 'The Last Keeper',
  'ach.act3_clear.desc': 'Finish Act III and save the Heart.',
  'ach.first_three_star': 'Perfect Circuit',
  'ach.first_three_star.desc': 'Earn three stars on a district.',
  'ach.all_relics': 'City Archivist',
  'ach.all_relics.desc': 'Collect every district relic.',
  'ach.game_finished': 'The City Has a Heartbeat',
  'ach.game_finished.desc': 'Complete every district.'
};
