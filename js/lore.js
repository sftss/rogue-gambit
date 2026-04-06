// ==================== PIECE LORE ====================
// Dark fantasy codex entries for every piece type.
// No ES modules — all variables global.

const LORE = {

  // ── STANDARD PIECES ──────────────────────────────────────────────────────

  pawn: {
    title: 'Pawn',
    lore: 'Conscripted from every village, hamlet, and gutter the kingdom could reach, the pawn has no illusions about its worth. It marches forward because stopping is not permitted, and dying is merely expected. What it lacks in power it makes up for in sheer, grinding momentum — and, on rarest occasions, something more.',
    flavor: '"One step at a time. That\'s all they give us, and somehow it\'s enough."',
    tags: ['Offensive', 'Passive'],
  },

  rook: {
    title: 'Rook',
    lore: 'The rooks are the walls of the army given legs. They do not charge; they advance, relentlessly and without flourish, down the long corridors of the battlefield. To stand in a rook\'s lane is to stand in the path of an avalanche — it will not stop, and it will not notice you until it is already too late.',
    flavor: '"Straight lines. Honest work. No philosophy."',
    tags: ['Offensive', 'Defensive'],
  },

  bishop: {
    title: 'Bishop',
    lore: 'They call themselves holy, these slanting wanderers of the diagonal. They have never walked a straight path in their lives, and they see no reason to start. Blessed by gods whose names change with the season, the bishop moves across color-lines it can never cross, blessing fields it can never stand on.',
    flavor: '"The shortest distance between two points is, in my experience, never a straight line."',
    tags: ['Offensive', 'Tricky'],
  },

  knight: {
    title: 'Knight',
    lore: 'A knight does not travel — it arrives. One moment absent, the next moment threatening, the knight has mastered the art of the impossible approach. Enemy lines mean nothing to a creature that considers walls and bodies mere suggestions about where it should not be.',
    flavor: '"I took the long way. It was faster."',
    tags: ['Offensive', 'Tricky'],
  },

  queen: {
    title: 'Queen',
    lore: 'The queen does not ask permission from geometry. She moves in all directions at full extension, a convergence of every weapon at once. Armies break before she arrives; she is the threat more than the act, the shadow cast by power too vast to be opposed cleanly.',
    flavor: '"They say the queen has no weaknesses. They are correct."',
    tags: ['Offensive', 'Wild'],
  },

  king: {
    title: 'King',
    lore: 'The king is either the most important being on the battlefield or the most pathetically small — the soldiers cannot agree. He moves one careful step at a time, hedged in by duty and dread, the last man anyone wants to lose and the first man everyone blames. Somewhere beneath the crown is a terrified person who knows exactly what he is worth.',
    flavor: '"If I fall, we all fall. I find that motivating, mostly."',
    tags: ['Defensive', 'Passive'],
  },

  // ── SPECIAL PAWNS ─────────────────────────────────────────────────────────

  blueprint: {
    title: 'Blueprint',
    lore: 'Cast from a mold that was never filled in, the Blueprint arrived on the field as nothing — a soldier-shaped absence waiting to be defined. It watches its neighbor with an unsettling hunger, cataloguing every stance and scar. By the time the first horn sounds, it will have become something. It just does not yet know what.',
    flavor: '"I am whoever you need me to be. That is not a comfort."',
    tags: ['Tricky', 'Wild'],
  },

  epee_pawn: {
    title: 'Epée Pawn',
    lore: 'The rules of en passant were written by someone who never met the Epée Pawn. This fencer does not respect the doctrine that proximity is required for vengeance — it can catch a fleeing pawn from across the entire board, its blade arriving before its body, the wound appearing in a square no one was watching. Dueling masters refuse to acknowledge it exists.',
    flavor: '"Distance is an illusion. Your death, however, is not."',
    tags: ['Offensive', 'Tricky'],
  },

  golden_pawn: {
    title: 'Golden Pawn',
    lore: 'The prophecies were very specific: one pawn, gilded from birth, would march to the far end of the world and, in doing so, end the war. No one told the Golden Pawn this, which is perhaps why it presses forward with such uncomplicated determination. The enemy knows the prophecy too, which is why every sword on the board is already angled toward its throat.',
    flavor: '"The chosen one never asks to be chosen. They just walk."',
    tags: ['Offensive', 'Divine'],
  },

  hero_pawn: {
    title: 'Hero Pawn',
    lore: 'Most pawns become heroes in death. This one manages it while still breathing. The Hero Pawn has looked the king in the eye across the open field and seen not a ruler but a target — and in that moment of extraordinary, reckless audacity, something in it ignites. A check becomes a coronation. The uniform stays the same; the rank does not.',
    flavor: '"I didn\'t know I was brave. I was just too angry to be afraid."',
    tags: ['Offensive', 'Divine'],
  },

  iron_pawn: {
    title: 'Iron Pawn',
    lore: 'You cannot kill it. You also cannot convince it to kill anything, nor coax it to the far rank where it might become something greater. The Iron Pawn is an eternal sentinel, rusted into its post by a curse it no longer remembers. It blocks. It endures. It watches its comrades die around it and does not move, because moving was never really the point.',
    flavor: '"I was posted here in the third age. I will be here in the last."',
    tags: ['Defensive', 'Cursed'],
  },

  knife_pawn: {
    title: 'Knife Pawn',
    lore: 'Tournament judges have long debated whether the Knife Pawn\'s extra reach constitutes cheating. The Knife Pawn has long since stopped caring. It carries a blade angled toward the center of the board at all times — not for honor, not for strategy, simply because hitting someone from slightly further away has never once gotten a soldier in trouble. Not really.',
    flavor: '"Fair fights are for people who win them."',
    tags: ['Offensive', 'Tricky'],
  },

  war_automator: {
    title: 'War Automator',
    lore: 'Someone built this thing before the war began, wound it up, and pointed it forward. The War Automator does not move by choice — it moves by hunger, lurching ahead with each death on the field, drinking the violence around it like fuel. More blood means faster progress. It does not distinguish between friend and foe when feeding. It only counts.',
    flavor: '"The dying power it. The living merely aim it."',
    tags: ['Offensive', 'Mechanical', 'Wild'],
  },

  warp_jumper: {
    title: 'Warp Jumper',
    lore: 'The Warp Jumper does not go around enemy pawns. It does not stop. It slips through the gaps between soldiers as if they are made of smoke, emerging on the far side with the same bored expression it started with. Enemy commanders have tried to use it as proof that their lines are solid — they failed, because the Warp Jumper had already passed through twice during the demonstration.',
    flavor: '"The line held. I just didn\'t notice it."',
    tags: ['Offensive', 'Tricky'],
  },

  hordeling: {
    title: 'Hordeling',
    lore: 'Hatched from the Horde Mother\'s terrible need, the Hordeling does not have a name, only a number — and even that number changes daily as siblings are born and die. It cannot become more than it is; promotion is a mercy reserved for those with a future. It fights because its mother fights, and it dies when its mother dies, and perhaps, somewhere in its tiny, expendable chest, it resents this arrangement.',
    flavor: '"We are not soldiers. We are math."',
    tags: ['Offensive', 'Cursed'],
  },

  // ── SPECIAL ROOKS ─────────────────────────────────────────────────────────

  phase_rook: {
    title: 'Phase Rook',
    lore: 'The Phase Rook is not quite here. Its edges blur against whatever light falls on it, and allied soldiers report a cold, wrong feeling when it passes through them — not painful, exactly, but deeply unnatural. It cannot capture what it passes through, which is perhaps the only mercy in its design. The architects who built it were never fully seen again either.',
    flavor: '"It walked through me. I am choosing not to think about that."',
    tags: ['Tricky', 'Mechanical'],
  },

  sumo_rook: {
    title: 'Sumo Rook',
    lore: 'The Sumo Rook does not believe in killing. It believes in rearranging. Enemy pieces do not die to its advance — they are flung backwards, tumbling across the board with an expression of profound personal offense. This is either more humane than a standard rook or considerably more terrifying, depending on how far back you land.',
    flavor: '"I don\'t want to kill you. I want to put you somewhere inconvenient."',
    tags: ['Offensive', 'Wild'],
  },

  // ── SPECIAL BISHOPS ───────────────────────────────────────────────────────

  aristocrat: {
    title: 'Aristocrat',
    lore: 'The Aristocrat has decided, by virtue of birth and absolutely nothing else, that promotion is vulgar. A pawn that marches to the end rank and expects reward is simply a pawn with ambitions above its station. The Aristocrat\'s mere presence on the field smothers this possibility entirely — not through violence, but through the suffocating weight of established social order.',
    flavor: '"You may advance to the end of the board. You may not advance beyond what you are."',
    tags: ['Defensive', 'Cursed'],
  },

  basilisk: {
    title: 'Basilisk',
    lore: 'It does not need to touch you. The Basilisk moves across its diagonal lines with an almost lazy patience, and every piece that enters its gaze finds its limbs locking, its joints seizing into cold stone. It cannot finish the job itself — capture is beyond it, perhaps beneath it — but it does not need to. It turns an army into a sculpture garden and waits for allies to do the rest.',
    flavor: '"Don\'t look at it. Don\'t look at it. Don\'t —"',
    tags: ['Defensive', 'Cursed'],
  },

  blade_runner: {
    title: 'Blade Runner',
    lore: 'The Blade Runner cuts as it passes, and the cruelty is in the delay. An enemy piece it slides through does not fall immediately — it takes one more turn, completing whatever move it planned, before the wound catches up with it. They say the worst part is the moment of realization: standing on a square you chose, dying from a cut you had already forgotten.',
    flavor: '"You\'re already dead. You just haven\'t stopped moving yet."',
    tags: ['Offensive', 'Tricky'],
  },

  bouncer: {
    title: 'Bouncer',
    lore: 'The edge of the board is, to most pieces, the edge of the world. To the Bouncer, it is merely a wall. It ricochets off the boundary like a thought that refuses to leave — one moment charging toward the rim, the next moment hurtling back along a reflected angle that no one was defending. Tacticians who face it for the first time have been known to briefly question reality.',
    flavor: '"Walls are just floors that are standing up."',
    tags: ['Offensive', 'Wild'],
  },

  cardinal: {
    title: 'Cardinal',
    lore: 'Every bishop is bound by orthodoxy — forward, always forward, along the diagonal. The Cardinal has read the doctrine carefully and found one exception, tucked into a footnote: it may, without capturing, retreat one square backward. The Church considers this a minor heresy. The Cardinal considers it good tactics. The debate has been ongoing for three hundred years.',
    flavor: '"Retreating is not cowardice. It is an alternative interpretation of advance."',
    tags: ['Defensive', 'Tricky'],
  },

  dancer: {
    title: 'Dancer',
    lore: 'The Dancer fights the way it moves — in flowing sequences, each gesture bleeding into the next. To check a king is to catch its rhythm, and in that moment of grace and terror, the Dancer is rewarded with two full moves on the following turn. No captures allowed; this is performance, not butchery. The king watches it approach and cannot decide whether it is watching art or death.',
    flavor: '"The second move is the one that ends you. The first is just the introduction."',
    tags: ['Offensive', 'Tricky', 'Wild'],
  },

  djinn: {
    title: 'Djinn',
    lore: 'The Djinn has learned to unmake itself. Spending a turn, it dissolves — not retreating, not hiding, simply ceasing — and waits inside the invisible seams of the world until blood is spilled somewhere nearby. Then it reforms, drawn by violence the way smoke is drawn by wind. Soldiers who thought they had a clear board have discovered, to their profound regret, that the Djinn counts every corpse.',
    flavor: '"I was here before you arrived. I will be here after you are gone."',
    tags: ['Tricky', 'Cursed', 'Wild'],
  },

  gunslinger: {
    title: 'Gunslinger',
    lore: 'The Gunslinger has a code: if you point a weapon at it, it points a weapon back. Both parties stand there for exactly one turn, staring. If neither moves, the Gunslinger spends the following turn pulling the trigger on them both — itself included. No one wins a gunfight with the Gunslinger. You can only avoid having one, and by the time you\'re in range, that choice is already behind you.',
    flavor: '"I didn\'t want this fight. But I\'ll finish it."',
    tags: ['Offensive', 'Wild'],
  },

  horde_mother: {
    title: 'Horde Mother',
    lore: 'She does not capture to kill. She captures to breed. Every piece that falls to the Horde Mother leaves a hordeling in its place — a small, disposable child born already marching. The terrible elegance of her design is this: her children are her armor and her anchor at once. Destroy them all at once, or do not try, because they die when she dies, and she dies knowing it.',
    flavor: '"I am not one creature. I am a colony that has not finished growing."',
    tags: ['Offensive', 'Wild', 'Cursed'],
  },

  icicle: {
    title: 'Icicle',
    lore: 'Cold does not hurry. The Icicle understands this. It cannot capture — it is not a weapon of sudden violence — but any enemy that lingers within its reach for two turns finds itself encased in frost, immovable, watching helplessly as the board shifts around them. The Icicle\'s patience is absolute. It was formed over a thousand winters. It can wait one more turn.',
    flavor: '"The slow freeze is kinder than the blade. I tell myself this often."',
    tags: ['Defensive', 'Cursed'],
  },

  marauder: {
    title: 'Marauder',
    lore: 'The Marauder begins as almost nothing — a single step in any direction, a king\'s reach packed into a bishop\'s body. But it feeds. Each kill extends its reach by two full squares, and the thing that stood timidly at the back of the formation after three battles commands the entire board. Commanders pray they can stop it before the third kill. They rarely stop it before the second.',
    flavor: '"I was small once. I remember it fondly. I remember it from a great distance."',
    tags: ['Offensive', 'Wild'],
  },

  pilgrim: {
    title: 'Pilgrim',
    lore: 'Twenty squares. That is the price of a miracle. The Pilgrim walks not to kill but to accumulate distance — twenty squares of diagonal wandering across a battlefield soaked in grief, and at the end of that journey, it kneels and an ally rises. It does not ask which ally. It does not need to know. The road is the prayer, and the resurrection is merely the answer.',
    flavor: '"I have walked through fire and mud and worse things. My feet remember where I am going."',
    tags: ['Passive', 'Divine'],
  },

  // ── SPECIAL KNIGHTS ───────────────────────────────────────────────────────

  anti_violence: {
    title: 'Anti-Violence',
    lore: 'The Anti-Violence arrived on the field carrying no weapon and has never thrown a punch. It does not need to. Its mere presence radiates a compulsion so strong that every enemy within reach finds its killing instinct shutting down, weapons lowering, hands going still. The pacifist champion wins not by fighting but by making fighting impossible. Commanders find this outcome, philosophically, very difficult to argue with.',
    flavor: '"Put it down. You don\'t want to do this. Neither do I, and I have made that permanent."',
    tags: ['Defensive', 'Divine'],
  },

  banker: {
    title: 'Banker',
    lore: 'The Banker has no ideology. It has a ledger. Every enemy pawn it captures is assessed at market value, weighed against the needs of the portfolio, and a single allied pawn is quietly elevated — gilded, chosen, made into the instrument of victory. The Banker is not cruel and not kind. It is simply very, very good at turning someone else\'s loss into your gain.',
    flavor: '"I don\'t make wars. I merely profit from the existing infrastructure."',
    tags: ['Offensive', 'Tricky'],
  },

  camel: {
    title: 'Camel',
    lore: 'The knight leaps two squares and one. The Camel leaps three and one, a stretched, loping trajectory that lands consistently just outside where the enemy expected. It comes from a land where the standard L-shape was considered inefficient, and it has never seen reason to change. Trying to pin down a Camel is the tactical equivalent of trying to corner smoke in a desert.',
    flavor: '"I\'m not hard to find. I\'m simply never quite where you thought."',
    tags: ['Offensive', 'Tricky'],
  },

  electro_knight: {
    title: 'Electro Knight',
    lore: 'The Electro Knight does not arrive crackling. It arrives quietly — first move, second move, third move, a routine soldier building toward nothing obvious. And then the charge completes, invisible current peaking in the gap between heartbeats. The next capture does not simply kill; it arcs. Adjacent pieces discover that proximity to death has its own kind of voltage.',
    flavor: '"Three moves. That\'s how long it takes. I\'ve always been patient."',
    tags: ['Offensive', 'Mechanical', 'Wild'],
  },

  fish: {
    title: 'Fish',
    lore: 'The Fish is a creature of momentum, not planning. Sit still and it is a perfectly ordinary knight, unremarkable and easily predicted. Move it, and something shifts — it carries its previous motion like a current, able to slip one extra square in any direction, a small wriggling unpredictability that is somehow worse than a larger threat. Generals have been embarrassed by the Fish. This is never spoken of.',
    flavor: '"I\'m not faster. I\'m just still moving from last time."',
    tags: ['Tricky', 'Wild'],
  },

  pinata: {
    title: 'Piñata',
    lore: 'No one knows what the Piñata is. The Piñata does not know what the Piñata is. At the opening of battle, something inside it cracks, the painted exterior falls away, and out comes — well, that varies. Rook, bishop, something stranger. The commanders who deploy it have accepted that uncertainty is the strategy, and the enemy, who cannot plan against a piece that does not yet exist, would have to agree.',
    flavor: '"It\'s a surprise. I mean that literally. Even for me."',
    tags: ['Wild', 'Tricky'],
  },

  knightmare: {
    title: 'Knightmare',
    lore: 'The edge of the board means nothing to the Knightmare. When its leap would carry it past the boundary, it simply does not stop — it wraps, emerging from the opposite edge with the same murderous momentum. Soldiers on the far flank have been startled by a knight that should, geometrically, have landed in empty space. The Knightmare does not believe in empty space. It believes in arrival.',
    flavor: '"The board ends. I do not."',
    tags: ['Offensive', 'Cursed', 'Wild'],
  },

  // ── SPECIAL QUEENS ────────────────────────────────────────────────────────

  fission_reactor: {
    title: 'Fission Reactor',
    lore: 'The Fission Reactor was built to win wars. The people who built it understood, in abstract terms, that it would eventually destroy itself — five kills and the accumulated energy of slaughter exceeds what any single piece can contain. They considered this an acceptable price. The Fission Reactor, having now killed four, is beginning to suspect it was not consulted on this arrangement.',
    flavor: '"Four. I try not to think about five."',
    tags: ['Offensive', 'Mechanical', 'Wild'],
  },

  // ── SPECIAL KINGS ─────────────────────────────────────────────────────────

  rocketman: {
    title: 'Rocketman',
    lore: 'Every king has a contingency plan, and the Rocketman\'s is more honest than most: a single-use contraption strapped to its back that, when activated, flings it to a completely random location on the board. This is either brilliant strategy or blatant cowardice, depending on where it lands. Advisors have pointed out that "random" is not a plan. The Rocketman has pointed out that it is still alive.',
    flavor: '"I didn\'t say it was a good escape plan. I said it was the one I had."',
    tags: ['Defensive', 'Wild', 'Tricky'],
  },

};
