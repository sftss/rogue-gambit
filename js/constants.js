// ==================== PIECE TYPES ====================
const PT = {
  // Standard
  PAWN: 'pawn', ROOK: 'rook', BISHOP: 'bishop',
  KNIGHT: 'knight', QUEEN: 'queen', KING: 'king',
  // Special Pawns
  BLUEPRINT: 'blueprint', EPEE_PAWN: 'epee_pawn',
  GOLDEN_PAWN: 'golden_pawn', HERO_PAWN: 'hero_pawn',
  IRON_PAWN: 'iron_pawn', KNIFE_PAWN: 'knife_pawn',
  WAR_AUTOMATOR: 'war_automator', WARP_JUMPER: 'warp_jumper',
  // Special Rooks
  PHASE_ROOK: 'phase_rook', SUMO_ROOK: 'sumo_rook',
  // Special Bishops
  ARISTOCRAT: 'aristocrat', BASILISK: 'basilisk',
  BLADE_RUNNER: 'blade_runner', BOUNCER: 'bouncer',
  CARDINAL: 'cardinal', DANCER: 'dancer',
  DJINN: 'djinn', GUNSLINGER: 'gunslinger',
  HORDE_MOTHER: 'horde_mother', ICICLE: 'icicle',
  MARAUDER: 'marauder', PILGRIM: 'pilgrim',
  // Special Knights
  ANTI_VIOLENCE: 'anti_violence', BANKER: 'banker',
  CAMEL: 'camel', ELECTRO_KNIGHT: 'electro_knight',
  FISH: 'fish', PINATA: 'pinata', KNIGHTMARE: 'knightmare',
  // Special Queens
  FISSION_REACTOR: 'fission_reactor',
  // Special Kings
  ROCKETMAN: 'rocketman',
  // Spawned pieces
  HORDELING: 'hordeling',
};

const TEAM = { WHITE: 'white', BLACK: 'black' };

// What base category each piece belongs to (for drafting/replacing)
const PIECE_CATEGORY = {};
const CAT_PAWN = [PT.PAWN, PT.BLUEPRINT, PT.EPEE_PAWN, PT.GOLDEN_PAWN, PT.HERO_PAWN,
  PT.IRON_PAWN, PT.KNIFE_PAWN, PT.WAR_AUTOMATOR, PT.WARP_JUMPER, PT.HORDELING];
const CAT_ROOK = [PT.ROOK, PT.PHASE_ROOK, PT.SUMO_ROOK];
const CAT_BISHOP = [PT.BISHOP, PT.ARISTOCRAT, PT.BASILISK, PT.BLADE_RUNNER, PT.BOUNCER,
  PT.CARDINAL, PT.DANCER, PT.DJINN, PT.GUNSLINGER, PT.HORDE_MOTHER, PT.ICICLE,
  PT.MARAUDER, PT.PILGRIM];
const CAT_KNIGHT = [PT.KNIGHT, PT.ANTI_VIOLENCE, PT.BANKER, PT.CAMEL,
  PT.ELECTRO_KNIGHT, PT.FISH, PT.PINATA, PT.KNIGHTMARE];
const CAT_QUEEN = [PT.QUEEN, PT.FISSION_REACTOR];
const CAT_KING = [PT.KING, PT.ROCKETMAN];

CAT_PAWN.forEach(t => PIECE_CATEGORY[t] = 'pawn');
CAT_ROOK.forEach(t => PIECE_CATEGORY[t] = 'rook');
CAT_BISHOP.forEach(t => PIECE_CATEGORY[t] = 'bishop');
CAT_KNIGHT.forEach(t => PIECE_CATEGORY[t] = 'knight');
CAT_QUEEN.forEach(t => PIECE_CATEGORY[t] = 'queen');
CAT_KING.forEach(t => PIECE_CATEGORY[t] = 'king');

// Piece display info
const PIECE_INFO = {
  [PT.PAWN]: { name: 'Pawn', desc: 'Standard pawn.' },
  [PT.ROOK]: { name: 'Rook', desc: 'Standard rook.' },
  [PT.BISHOP]: { name: 'Bishop', desc: 'Standard bishop.' },
  [PT.KNIGHT]: { name: 'Knight', desc: 'Standard knight.' },
  [PT.QUEEN]: { name: 'Queen', desc: 'Standard queen.' },
  [PT.KING]: { name: 'King', desc: 'Standard king.' },
  [PT.BLUEPRINT]: { name: 'Blueprint', desc: 'Transforms into the pawn to its left at game start.' },
  [PT.EPEE_PAWN]: { name: 'Ep\u00e9e Pawn', desc: 'Can en passant any pawn anywhere on the board.' },
  [PT.GOLDEN_PAWN]: { name: 'Golden Pawn', desc: 'If this pawn promotes, win the game!' },
  [PT.HERO_PAWN]: { name: 'Hero Pawn', desc: 'If this pawn checks the enemy king, immediately promote.' },
  [PT.IRON_PAWN]: { name: 'Iron Pawn', desc: 'Invulnerable. Cannot capture or promote.' },
  [PT.KNIFE_PAWN]: { name: 'Knife Pawn', desc: '+1 diagonal capture range toward center.' },
  [PT.WAR_AUTOMATOR]: { name: 'War Automator', desc: 'Auto-moves forward 1 tile when any piece dies.' },
  [PT.WARP_JUMPER]: { name: 'Warp Jumper', desc: 'Can jump through enemy pawns.' },
  [PT.PHASE_ROOK]: { name: 'Phase Rook', desc: 'Passes through allies but cannot capture through them.' },
  [PT.SUMO_ROOK]: { name: 'Sumo Rook', desc: 'Knocks pieces back instead of capturing.' },
  [PT.ARISTOCRAT]: { name: 'Aristocrat', desc: 'Prevents ALL pawns from promoting.' },
  [PT.BASILISK]: { name: 'Basilisk', desc: 'Paralyzes enemies it threatens. Cannot capture.' },
  [PT.BLADE_RUNNER]: { name: 'Blade Runner', desc: 'Kills by passing through. Capture delayed 1 turn.' },
  [PT.BOUNCER]: { name: 'Bouncer', desc: 'Can bounce off the edge of the board once per move.' },
  [PT.CARDINAL]: { name: 'Cardinal', desc: 'Can move 1 tile directly backward without capturing.' },
  [PT.DANCER]: { name: 'Dancer', desc: 'If this checks the king, take two moves next turn (no capture).' },
  [PT.DJINN]: { name: 'Djinn', desc: 'Spend a turn to dissipate. Reforms when a piece is captured.' },
  [PT.GUNSLINGER]: { name: 'Gunslinger', desc: 'Mutual threat for a turn = spend a turn to destroy both.' },
  [PT.HORDE_MOTHER]: { name: 'Horde Mother', desc: 'Capture spawns a hordeling pawn. If mother dies, all die.' },
  [PT.ICICLE]: { name: 'Icicle', desc: 'Adjacent enemies for 2 turns become Frozen. Cannot capture.' },
  [PT.MARAUDER]: { name: 'Marauder', desc: 'Moves like king. +2 range per kill.' },
  [PT.PILGRIM]: { name: 'Pilgrim', desc: 'After traveling 20 squares, resurrect an ally.' },
  [PT.ANTI_VIOLENCE]: { name: 'Anti-Violence', desc: 'Adjacent enemies cannot capture. This piece cannot capture.' },
  [PT.BANKER]: { name: 'Banker', desc: 'Capture a pawn = transform one of your pawns into Golden.' },
  [PT.CAMEL]: { name: 'Camel', desc: 'Leaps 3+1 instead of 2+1.' },
  [PT.ELECTRO_KNIGHT]: { name: 'Electro Knight', desc: '3 consecutive moves = charged. Zaps adjacent on capture.' },
  [PT.FISH]: { name: 'Fish', desc: 'If moved last turn, can also move 1 tile any direction (no capture).' },
  [PT.PINATA]: { name: 'Pi\u00f1ata', desc: 'Transforms into a random piece at game start.' },
  [PT.KNIGHTMARE]: { name: 'Knightmare', desc: 'Can jump off the board (wraps around).' },
  [PT.FISSION_REACTOR]: { name: 'Fission Reactor', desc: 'Explodes on 5th capture, destroying itself + diagonal adjacents.' },
  [PT.ROCKETMAN]: { name: 'Rocketman', desc: 'Once per game, blast off to a random tile.' },
  [PT.HORDELING]: { name: 'Hordeling', desc: 'Spawned by Horde Mother. Cannot promote. Dies if mother dies.' },
};

// Tile size for rendering
const TILE_SIZE = 64;
const BOARD_SIZE = 8;
const CANVAS_SIZE = TILE_SIZE * BOARD_SIZE;

// Colors
const COLORS = {
  BOARD_LIGHT: '#2a2a3a',
  BOARD_DARK: '#1a1a28',
  HIGHLIGHT: 'rgba(255,255,100,0.3)',
  MOVE_DOT: 'rgba(100,255,100,0.5)',
  CAPTURE_DOT: 'rgba(255,80,80,0.5)',
  CHECK: 'rgba(255,0,0,0.4)',
  LAST_MOVE: 'rgba(100,100,255,0.2)',
  SELECTED: 'rgba(255,255,0,0.3)',
  WHITE_PRIMARY: '#e8e0d0',
  WHITE_SECONDARY: '#c8b8a0',
  WHITE_OUTLINE: '#887860',
  BLACK_PRIMARY: '#484058',
  BLACK_SECONDARY: '#302838',
  BLACK_OUTLINE: '#181020',
};

// Draft config
const DRAFT_PICKS = 4; // pieces to pick each round
const STARTING_LIVES = 3;

// Piece accent colors for special pieces
const ACCENT_COLORS = {
  [PT.BLUEPRINT]: '#4af',
  [PT.EPEE_PAWN]: '#ccc',
  [PT.GOLDEN_PAWN]: '#fc0',
  [PT.HERO_PAWN]: '#f44',
  [PT.IRON_PAWN]: '#888',
  [PT.KNIFE_PAWN]: '#f66',
  [PT.WAR_AUTOMATOR]: '#4c4',
  [PT.WARP_JUMPER]: '#a4f',
  [PT.PHASE_ROOK]: '#4af',
  [PT.SUMO_ROOK]: '#a84',
  [PT.ARISTOCRAT]: '#c4f',
  [PT.BASILISK]: '#4c4',
  [PT.BLADE_RUNNER]: '#f44',
  [PT.BOUNCER]: '#4f4',
  [PT.CARDINAL]: '#f44',
  [PT.DANCER]: '#f4a',
  [PT.DJINN]: '#48f',
  [PT.GUNSLINGER]: '#a84',
  [PT.HORDE_MOTHER]: '#484',
  [PT.ICICLE]: '#8ef',
  [PT.MARAUDER]: '#f44',
  [PT.PILGRIM]: '#a84',
  [PT.ANTI_VIOLENCE]: '#fff',
  [PT.BANKER]: '#fc0',
  [PT.CAMEL]: '#ca8',
  [PT.ELECTRO_KNIGHT]: '#ff0',
  [PT.FISH]: '#48f',
  [PT.PINATA]: '#f4a',
  [PT.KNIGHTMARE]: '#408',
  [PT.FISSION_REACTOR]: '#f80',
  [PT.ROCKETMAN]: '#f80',
  [PT.HORDELING]: '#484',
};

// ==================== GOLD SYSTEM ====================
const GOLD = {
  WIN_BASE: 3,         // gold for winning a round
  CAPTURE_REWARD: 1,   // gold per capture (special pieces only)
  INTEREST_MAX: 5,     // max gold earned from interest
  INTEREST_PER: 5,     // 1 interest per X gold held
  REROLL_BASE_COST: 1, // first reroll costs 1
};

// ==================== RELICS ====================
const RELICS = {
  iron_will: {
    id: 'iron_will',
    name: 'Iron Will',
    desc: 'Your Iron Pawns can capture enemies (but remain invulnerable).',
    flavor: '"Unstoppable, inescapable, eternal."',
    icon: '\u2699',
    cost: 4,
    rarity: 'uncommon',
  },
  golden_touch: {
    id: 'golden_touch',
    name: 'Golden Touch',
    desc: 'At the start of each battle, one random pawn becomes a Golden Pawn.',
    flavor: '"Everything it steps on turns to victory."',
    icon: '\u2728',
    cost: 6,
    rarity: 'rare',
  },
  conductors_baton: {
    id: 'conductors_baton',
    name: "Conductor's Baton",
    desc: 'Electro Knight charges after 2 consecutive moves instead of 3.',
    flavor: '"The storm does not wait."',
    icon: '\u26a1',
    cost: 3,
    rarity: 'common',
  },
  pack_leader: {
    id: 'pack_leader',
    name: 'Pack Leader',
    desc: 'Horde Mother spawns 2 hordelings per capture instead of 1.',
    flavor: '"They come in waves."',
    icon: '\ud83d\udc1d',
    cost: 4,
    rarity: 'uncommon',
  },
  blessed_blade: {
    id: 'blessed_blade',
    name: 'Blessed Blade',
    desc: "Blade Runner's kills are immediate — no delay.",
    flavor: '"They never even saw the cut."',
    icon: '\u2694',
    cost: 4,
    rarity: 'uncommon',
  },
  frozen_heart: {
    id: 'frozen_heart',
    name: 'Frozen Heart',
    desc: 'Icicle freezes enemies after only 1 adjacent turn instead of 2.',
    flavor: '"Cold comes quickly to those who linger."',
    icon: '\u2744',
    cost: 3,
    rarity: 'common',
  },
  pilgrims_blessing: {
    id: 'pilgrims_blessing',
    name: "Pilgrim's Blessing",
    desc: 'Pilgrim needs only 10 squares traveled to trigger resurrection.',
    flavor: '"The journey was always within."',
    icon: '\u271d',
    cost: 5,
    rarity: 'uncommon',
  },
  battle_hardened: {
    id: 'battle_hardened',
    name: 'Battle Hardened',
    desc: 'All your pieces start each battle with 1 kill already counted.',
    flavor: '"Veterans remember every fight they survived."',
    icon: '\ud83d\udca2',
    cost: 5,
    rarity: 'uncommon',
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    desc: 'Dancer gets 3 bonus moves after checking the king instead of 2.',
    flavor: '"She dances until they all fall."',
    icon: '\ud83d\udc83',
    cost: 4,
    rarity: 'uncommon',
  },
  loan_shark: {
    id: 'loan_shark',
    name: 'Loan Shark',
    desc: 'Gain +3 gold at the start of each shop visit.',
    flavor: '"The house always wins. Today, you are the house."',
    icon: '\ud83d\udcb0',
    cost: 3,
    rarity: 'common',
  },
  warchief: {
    id: 'warchief',
    name: 'Warchief',
    desc: 'War Automators advance 2 squares per kill instead of 1.',
    flavor: '"Bloodshed is fuel. The engine never stops."',
    icon: '\ud83e\udd16',
    cost: 4,
    rarity: 'uncommon',
  },
  resurrection_stone: {
    id: 'resurrection_stone',
    name: 'Resurrection Stone',
    desc: 'Once per run, when you would lose a life, lose nothing instead.',
    flavor: '"Death is a door. This is the key."',
    icon: '\ud83d\udc8e',
    cost: 8,
    rarity: 'rare',
  },
  tacticians_manual: {
    id: 'tacticians_manual',
    name: "Tactician's Manual",
    desc: 'Enemy AI difficulty is reduced by 1 level.',
    flavor: '"Know thine enemy. Memorize their playbook."',
    icon: '\ud83d\udcda',
    cost: 5,
    rarity: 'uncommon',
  },
  warp_beacon: {
    id: 'warp_beacon',
    name: 'Warp Beacon',
    desc: 'Warp Jumpers can also jump through allied pawns.',
    flavor: '"The beacon calls. It passes through anything."',
    icon: '\ud83d\udfe3',
    cost: 3,
    rarity: 'common',
  },
  royal_decree: {
    id: 'royal_decree',
    name: 'Royal Decree',
    desc: 'Once per battle, your King (or Rocketman) may move 2 squares instead of 1.',
    flavor: '"The crown commands. Barriers obey."',
    icon: '\ud83d\udc51',
    cost: 5,
    rarity: 'uncommon',
  },
  blood_money: {
    id: 'blood_money',
    name: 'Blood Money',
    desc: 'Earn 1 gold for every enemy piece you capture (standard + special).',
    flavor: '"Every life has a price. Every kill, a payout."',
    icon: '\ud83d\udc80',
    cost: 4,
    rarity: 'uncommon',
  },
  mirror_shield: {
    id: 'mirror_shield',
    name: 'Mirror Shield',
    desc: 'Your King is immune to the first check each battle.',
    flavor: '"Reflects the gaze. Returns the threat."',
    icon: '\ud83d\udee1',
    cost: 6,
    rarity: 'rare',
  },
};

// Relic rarity order for shop display
const RELIC_RARITY_ORDER = ['common', 'uncommon', 'rare'];

// Shop costs
const SHOP_COSTS = {
  piece_standard: 2,
  piece_special: 4,
  piece_rare: 6,
  heal: 3,
  reroll: 1,
};

// Gold rewards
const GOLD_REWARDS = {
  win: 3,
  capture_special: 1,
  capture_any: 0,  // set to 1 with blood_money relic
  round_bonus: true,  // round_number extra gold on win
};
