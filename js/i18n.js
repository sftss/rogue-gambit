// ==================== I18N / LOCALIZATION ====================
// Centralized localization layer with EN fallback and FR support.
// No ES modules - all variables global.

const I18n = {
  supported: ['en', 'fr'],
  current: 'en',
  _listeners: [],

  messages: {
    en: {
      common: {
        on: 'ON',
        off: 'OFF',
        back: '\u2190 BACK',
        codex: 'CODEX',
      },
      title: {
        tagline: 'Draft. Battle. Survive.',
        newRun: 'NEW RUN',
        continue: 'CONTINUE',
        options: 'OPTIONS',
        footer: 'v0.1 - use arrow keys or click to navigate',
      },
      draft: {
        yourRelics: 'YOUR RELICS',
        choosePieces: 'Choose your pieces',
        chooseHint: '(up to 4)',
        confirmPicks: 'CONFIRM PICKS',
        skip: 'SKIP',
        round: 'Round {round}',
        info: 'Wins: {wins} | Pick up to {count} pieces',
        replaces: 'Replaces: {name} (pos {pos})',
      },
      shop: {
        shopTitle: 'Shop',
        piecesForSale: 'PIECES FOR SALE',
        relics: 'RELICS',
        yourArmy: 'YOUR ARMY',
        yourRelics: 'YOUR RELICS',
        reroll: 'REROLL ({cost}g)',
        continueToDraft: 'CONTINUE TO DRAFT',
        noRelics: 'No relics available - you own them all!',
        restoreLifeName: 'Restore Life',
        restoreLifeDesc: 'Recover 1 lost life. Keep fighting.',
        sold: 'SOLD',
        healed: 'HEALED',
        roundTitle: 'Round {round} Shop',
        earnedBanner: '+{earned}g earned ({winBase}g win + {roundBonus}g round bonus + {interest}g interest)',
      },
      game: {
        yourTurn: 'YOUR TURN',
        enemyTurn: 'ENEMY TURN...',
        clickPieceInfo: 'Click a piece to see info',
        captured: 'CAPTURED',
        resign: 'RESIGN',
        promotePawn: 'Promote Pawn',
        saveInfo: 'Saved: Round {round} | {wins} wins | {gold}g | {relics} relics ({date})',
        statKills: 'Kills: {value}',
        statDist: 'Dist: {current}/{max}',
        statCharged: 'CHARGED!',
        statFrozen: 'FROZEN',
        statCombo: 'Combo: {current}/{max}',
        reason: {
          resigned: 'Resigned.',
          checkmate: 'Checkmate!',
          stalemate: 'Stalemate!',
          whiteKingDestroyed: 'White king destroyed!',
          blackKingDestroyed: 'Black king destroyed!',
          goldenPawn: 'Golden Pawn promotion!',
        },
        log: {
          roundStarted: 'Round {round} started!',
          unfreezes: '{piece} unfreezes!',
          djinnDissipates: 'Djinn dissipates...',
          rocketmanBlast: 'Rocketman blasts off!',
          enPassant: '{attacker} en passants {target}!',
          captures: '{attacker} captures {target}!',
          bladeMarks: 'Blade Runner marks {target} for death!',
          heroPawnPromotes: 'Hero Pawn checks the king - promotes!',
          dancerChecks: 'Dancer checks the king! Extra moves incoming!',
          goldenPawnVictory: 'GOLDEN PAWN PROMOTES - VICTORY!',
          sumoPush: 'Sumo Rook pushes {target}!',
          sumoCrush: 'Sumo Rook crushes {target}!',
          gunslingerDuel: 'Gunslinger duel - both destroyed!',
          pilgrimResurrects: 'Pilgrim resurrects {target}!',
          bankerGolden: 'Banker creates a Golden Pawn!',
          hordeSpawn: 'Horde Mother spawns a Hordeling!',
          fissionExplodes: 'FISSION REACTOR EXPLODES!',
          explosionDestroys: 'Explosion destroys {target}!',
          electroZaps: 'Electro Knight zaps {target}!',
          pawnPromotesQueen: 'Pawn promotes to Queen!',
          pawnPromotes: 'Pawn promotes to {piece}!',
          bladeFalls: '{piece} falls to Blade Runner\'s mark!',
          isFrozen: '{piece} is FROZEN!',
          dancerBonus: 'Dancer - bonus move!',
          resurrectionStone: 'Resurrection Stone activates - life spared!',
        },
      },
      gameover: {
        victory: 'VICTORY!',
        defeat: 'DEFEAT',
        draw: 'DRAW',
        goToShop: 'GO TO SHOP',
        continueRun: 'CONTINUE RUN',
        newRun: 'NEW RUN',
        title: 'TITLE',
        statRound: 'ROUND',
        statWins: 'WINS',
        statGold: 'GOLD',
        statRelics: 'RELICS',
        statTurns: 'TURNS',
      },
      codex: {
        title: 'CODEX',
        unlockAll: 'UNLOCK ALL',
        all: 'ALL',
        pawns: 'PAWNS',
        rooks: 'ROOKS',
        bishops: 'BISHOPS',
        knights: 'KNIGHTS',
        queens: 'QUEENS',
        kings: 'KINGS',
        selectEntry: 'Select a piece to view its entry',
        ability: 'ABILITY',
        inYourArmy: '\u2714 In your army',
        locked: '???',
        classLabel: '{category} CLASS',
      },
      options: {
        title: 'OPTIONS',
        musicVolume: 'Music Volume',
        sfxVolume: 'SFX Volume',
        aiDifficulty: 'AI Difficulty',
        easy: 'EASY',
        medium: 'MEDIUM',
        hard: 'HARD',
        language: 'Language',
        langEn: 'ENGLISH',
        langFr: 'FRANCAIS',
        coordinates: 'Coordinates',
        deleteSave: 'Delete Save',
        delete: 'DELETE',
      },
      confirm: {
        startNewRun: 'Start a new run? This will delete your current save.',
        resign: 'Resign this game?',
        deleteSave: 'Delete save? This cannot be undone.',
      },
      gold: {
        interest: '+{amount}g interest',
      },
      category: {
        pawn: 'pawn',
        rook: 'rook',
        bishop: 'bishop',
        knight: 'knight',
        queen: 'queen',
        king: 'king',
        unknown: 'unknown',
      },
      rarity: {
        common: 'common',
        uncommon: 'uncommon',
        rare: 'rare',
      },
      tags: {
        Offensive: 'Offensive',
        Defensive: 'Defensive',
        Passive: 'Passive',
        Tricky: 'Tricky',
        Wild: 'Wild',
        Cursed: 'Cursed',
        Divine: 'Divine',
        Mechanical: 'Mechanical',
      },
    },

    fr: {
      common: {
        on: 'ON',
        off: 'OFF',
        back: '\u2190 RETOUR',
        codex: 'CODEX',
      },
      title: {
        tagline: 'Draft. Combat. Survis.',
        newRun: 'NOUVELLE RUN',
        continue: 'CONTINUER',
        options: 'OPTIONS',
        footer: 'v0.1 - utilise les fleches ou la souris pour naviguer',
      },
      draft: {
        yourRelics: 'TES RELIQUES',
        choosePieces: 'Choisis tes pieces',
        chooseHint: '(jusqu\'a 4)',
        confirmPicks: 'CONFIRMER LES CHOIX',
        skip: 'PASSER',
        round: 'Manche {round}',
        info: 'Victoires : {wins} | Choisis jusqu\'a {count} pieces',
        replaces: 'Remplace : {name} (pos {pos})',
      },
      shop: {
        shopTitle: 'Boutique',
        piecesForSale: 'PIECES EN VENTE',
        relics: 'RELIQUES',
        yourArmy: 'TON ARMEE',
        yourRelics: 'TES RELIQUES',
        reroll: 'RELANCE ({cost}g)',
        continueToDraft: 'CONTINUER VERS LE DRAFT',
        noRelics: 'Aucune relique disponible - tu les possedes toutes !',
        restoreLifeName: 'Restaurer une vie',
        restoreLifeDesc: 'Recupere 1 vie perdue. Continue le combat.',
        sold: 'VENDU',
        healed: 'SOIGNE',
        roundTitle: 'Boutique - manche {round}',
        earnedBanner: '+{earned}g gagnes ({winBase}g victoire + {roundBonus}g bonus manche + {interest}g interet)',
      },
      game: {
        yourTurn: 'TON TOUR',
        enemyTurn: 'TOUR ENNEMI...',
        clickPieceInfo: 'Clique une piece pour voir ses infos',
        captured: 'CAPTURES',
        resign: 'ABANDONNER',
        promotePawn: 'Promouvoir le pion',
        saveInfo: 'Sauvegarde : manche {round} | {wins} victoires | {gold}g | {relics} reliques ({date})',
        statKills: 'Elims : {value}',
        statDist: 'Dist : {current}/{max}',
        statCharged: 'CHARGE !',
        statFrozen: 'GELE',
        statCombo: 'Combo : {current}/{max}',
        reason: {
          resigned: 'Abandon.',
          checkmate: 'Echec et mat !',
          stalemate: 'Pat !',
          whiteKingDestroyed: 'Roi blanc detruit !',
          blackKingDestroyed: 'Roi noir detruit !',
          goldenPawn: 'Promotion du pion d\'or !',
        },
        log: {
          roundStarted: 'Manche {round} commencee !',
          unfreezes: '{piece} se degele !',
          djinnDissipates: 'Le Djinn se dissipe...',
          rocketmanBlast: 'Rocketman decolle !',
          enPassant: '{attacker} prend {target} en passant !',
          captures: '{attacker} capture {target} !',
          bladeMarks: 'Blade Runner marque {target} pour la mort !',
          heroPawnPromotes: 'Le Hero Pawn met le roi en echec - promotion !',
          dancerChecks: 'La Danseuse met le roi en echec ! Mouvements bonus !',
          goldenPawnVictory: 'LE PION D\'OR PROMEUT - VICTOIRE !',
          sumoPush: 'Le Sumo Rook pousse {target} !',
          sumoCrush: 'Le Sumo Rook ecrase {target} !',
          gunslingerDuel: 'Duel de Gunslinger - les deux sont detruits !',
          pilgrimResurrects: 'Le Pelerin ressuscite {target} !',
          bankerGolden: 'Le Banquier cree un pion d\'or !',
          hordeSpawn: 'La Mere de Horde invoque un Hordeling !',
          fissionExplodes: 'LE REACTEUR A FISSION EXPLOSE !',
          explosionDestroys: 'L\'explosion detruit {target} !',
          electroZaps: 'Le Chevalier Electrique foudroie {target} !',
          pawnPromotesQueen: 'Le pion promeut en Reine !',
          pawnPromotes: 'Le pion promeut en {piece} !',
          bladeFalls: '{piece} succombe a la marque de Blade Runner !',
          isFrozen: '{piece} est GELE !',
          dancerBonus: 'Danseuse - mouvement bonus !',
          resurrectionStone: 'La Pierre de Resurrection s\'active - vie sauvee !',
        },
      },
      gameover: {
        victory: 'VICTOIRE !',
        defeat: 'DEFAITE',
        draw: 'NUL',
        goToShop: 'ALLER A LA BOUTIQUE',
        continueRun: 'CONTINUER LA RUN',
        newRun: 'NOUVELLE RUN',
        title: 'TITRE',
        statRound: 'MANCHE',
        statWins: 'VICTOIRES',
        statGold: 'OR',
        statRelics: 'RELIQUES',
        statTurns: 'TOURS',
      },
      codex: {
        title: 'CODEX',
        unlockAll: 'TOUT DEBLOQUER',
        all: 'TOUT',
        pawns: 'PIONS',
        rooks: 'TOURS',
        bishops: 'FOUS',
        knights: 'CAVALIERS',
        queens: 'REINES',
        kings: 'ROIS',
        selectEntry: 'Selectionne une piece pour voir son entree',
        ability: 'CAPACITE',
        inYourArmy: '\u2714 Dans ton armee',
        locked: '???',
        classLabel: 'CLASSE {category}',
      },
      options: {
        title: 'OPTIONS',
        musicVolume: 'Volume musique',
        sfxVolume: 'Volume SFX',
        aiDifficulty: 'Difficulte IA',
        easy: 'FACILE',
        medium: 'MOYEN',
        hard: 'DIFFICILE',
        language: 'Langue',
        langEn: 'ANGLAIS',
        langFr: 'FRANCAIS',
        coordinates: 'Coordonnees',
        deleteSave: 'Supprimer la sauvegarde',
        delete: 'SUPPRIMER',
      },
      confirm: {
        startNewRun: 'Commencer une nouvelle run ? Cela supprimera la sauvegarde actuelle.',
        resign: 'Abandonner cette partie ?',
        deleteSave: 'Supprimer la sauvegarde ? Cette action est irreversible.',
      },
      gold: {
        interest: '+{amount}g interet',
      },
      category: {
        pawn: 'pion',
        rook: 'tour',
        bishop: 'fou',
        knight: 'cavalier',
        queen: 'reine',
        king: 'roi',
        unknown: 'inconnu',
      },
      rarity: {
        common: 'commun',
        uncommon: 'peu commun',
        rare: 'rare',
      },
      tags: {
        Offensive: 'Offensif',
        Defensive: 'Defensif',
        Passive: 'Passif',
        Tricky: 'Tactique',
        Wild: 'Chaotique',
        Cursed: 'Maudit',
        Divine: 'Divin',
        Mechanical: 'Mecanique',
      },
    },
  },

  frPieceInfo: {
    pawn: { name: 'Pion', desc: 'Pion standard.' },
    rook: { name: 'Tour', desc: 'Tour standard.' },
    bishop: { name: 'Fou', desc: 'Fou standard.' },
    knight: { name: 'Cavalier', desc: 'Cavalier standard.' },
    queen: { name: 'Reine', desc: 'Reine standard.' },
    king: { name: 'Roi', desc: 'Roi standard.' },
    blueprint: { name: 'Blueprint', desc: 'Se transforme en pion a sa gauche au debut de la partie.' },
    epee_pawn: { name: 'Pion Epee', desc: 'Peut prendre en passant n\'importe quel pion sur l\'echiquier.' },
    golden_pawn: { name: 'Pion d\'or', desc: 'Si ce pion promeut, tu gagnes la partie !' },
    hero_pawn: { name: 'Hero Pawn', desc: 'Si ce pion met le roi ennemi en echec, il promeut immediatement.' },
    iron_pawn: { name: 'Pion de fer', desc: 'Invulnerable. Ne peut ni capturer ni promouvoir.' },
    knife_pawn: { name: 'Knife Pawn', desc: '+1 de portee diagonale de capture vers le centre.' },
    war_automator: { name: 'War Automator', desc: 'Avance automatiquement de 1 case quand une piece meurt.' },
    warp_jumper: { name: 'Warp Jumper', desc: 'Peut sauter au travers des pions ennemis.' },
    phase_rook: { name: 'Phase Rook', desc: 'Traverse les allies, mais ne peut pas capturer au travers.' },
    sumo_rook: { name: 'Sumo Rook', desc: 'Repousse les pieces au lieu de les capturer.' },
    aristocrat: { name: 'Aristocrate', desc: 'Empeche TOUS les pions de promouvoir.' },
    basilisk: { name: 'Basilic', desc: 'Paralyse les ennemis menaces. Ne peut pas capturer.' },
    blade_runner: { name: 'Blade Runner', desc: 'Tue en traversant. Capture differee d\'un tour.' },
    bouncer: { name: 'Bouncer', desc: 'Peut rebondir une fois sur le bord de l\'echiquier par mouvement.' },
    cardinal: { name: 'Cardinal', desc: 'Peut reculer d\'une case en ligne droite sans capturer.' },
    dancer: { name: 'Danseuse', desc: 'Si elle met le roi en echec, joue deux coups au prochain tour (sans capture).' },
    djinn: { name: 'Djinn', desc: 'Depense un tour pour se dissiper. Revient quand une piece est capturee.' },
    gunslinger: { name: 'Gunslinger', desc: 'Menace mutuelle pendant un tour = detruit les deux au tour suivant.' },
    horde_mother: { name: 'Mere de Horde', desc: 'Une capture invoque un pion hordeling. Si la mere meurt, tous meurent.' },
    icicle: { name: 'Icicle', desc: 'Les ennemis adjacents pendant 2 tours deviennent GELES. Ne peut pas capturer.' },
    marauder: { name: 'Maraudeur', desc: 'Bouge comme un roi. +2 de portee par elimination.' },
    pilgrim: { name: 'Pelerin', desc: 'Apres 20 cases parcourues, ressuscite un allie.' },
    anti_violence: { name: 'Anti-Violence', desc: 'Les ennemis adjacents ne peuvent pas capturer. Cette piece ne peut pas capturer.' },
    banker: { name: 'Banquier', desc: 'Capturer un pion transforme un de tes pions en pion d\'or.' },
    camel: { name: 'Chameau', desc: 'Saute en 3+1 au lieu de 2+1.' },
    electro_knight: { name: 'Chevalier Electrique', desc: '3 mouvements consecutifs = charge. Foudroie les adjacents en capture.' },
    fish: { name: 'Poisson', desc: 'S\'il a bouge au tour precedent, peut aussi bouger d\'une case dans toute direction (sans capture).' },
    pinata: { name: 'Pinata', desc: 'Se transforme en piece aleatoire au debut de la partie.' },
    knightmare: { name: 'Knightmare', desc: 'Peut sauter hors du plateau (apparition de l\'autre cote).' },
    fission_reactor: { name: 'Reacteur a Fission', desc: 'Explose a la 5e capture, se detruisant avec les diagonales adjacentes.' },
    rocketman: { name: 'Rocketman', desc: 'Une fois par partie, decolle vers une case aleatoire.' },
    hordeling: { name: 'Hordeling', desc: 'Invoque par la Mere de Horde. Ne peut pas promouvoir. Meurt si la mere meurt.' },
  },

  frRelics: {
    iron_will: { name: 'Volonte de Fer', desc: 'Tes pions de fer peuvent capturer (mais restent invulnerables).', flavor: '"Inarretables, inevitables, eternels."' },
    golden_touch: { name: 'Toucher d\'Or', desc: 'Au debut de chaque combat, un pion aleatoire devient un pion d\'or.', flavor: '"Tout ce qu\'il touche devient victoire."' },
    conductors_baton: { name: 'Baguette du Chef', desc: 'Le Chevalier Electrique se charge apres 2 mouvements consecutifs au lieu de 3.', flavor: '"La tempete n\'attend pas."' },
    pack_leader: { name: 'Chef de Meute', desc: 'La Mere de Horde invoque 2 hordelings par capture au lieu de 1.', flavor: '"Ils arrivent par vagues."' },
    blessed_blade: { name: 'Lame Benie', desc: 'Les victimes de Blade Runner meurent immediatement.', flavor: '"Ils n\'ont jamais vu la coupure."' },
    frozen_heart: { name: 'Coeur Gele', desc: 'Icicle gele apres 1 tour adjacent au lieu de 2.', flavor: '"Le froid vient vite pour ceux qui trainent."' },
    pilgrims_blessing: { name: 'Benediction du Pelerin', desc: 'Le Pelerin n\'a besoin que de 10 cases parcourues pour ressusciter.', flavor: '"Le voyage etait deja en toi."' },
    battle_hardened: { name: 'Aguerris', desc: 'Toutes tes pieces commencent chaque combat avec 1 elimination.', flavor: '"Les veterans se souviennent de chaque bataille."' },
    speed_demon: { name: 'Demon de Vitesse', desc: 'La Danseuse gagne 3 mouvements bonus apres un echec au roi au lieu de 2.', flavor: '"Elle danse jusqu\'a leur chute."' },
    loan_shark: { name: 'Usurier', desc: 'Gagne +3 or au debut de chaque visite de boutique.', flavor: '"La maison gagne toujours. Aujourd\'hui, c\'est toi la maison."' },
    warchief: { name: 'Chef de Guerre', desc: 'Les War Automators avancent de 2 cases par elimination au lieu de 1.', flavor: '"Le sang est du carburant."' },
    resurrection_stone: { name: 'Pierre de Resurrection', desc: 'Une fois par run, quand tu devrais perdre une vie, tu n\'en perds pas.', flavor: '"La mort est une porte. Ceci est la cle."' },
    tacticians_manual: { name: 'Manuel du Tacticien', desc: 'La difficulte de l\'IA ennemie est reduite de 1 niveau.', flavor: '"Connais ton ennemi."' },
    warp_beacon: { name: 'Balise Warp', desc: 'Les Warp Jumpers peuvent aussi sauter au travers des pions allies.', flavor: '"La balise appelle. Rien ne l\'arrete."' },
    royal_decree: { name: 'Decret Royal', desc: 'Une fois par combat, ton Roi (ou Rocketman) peut bouger de 2 cases.', flavor: '"La couronne ordonne. Les obstacles obeissent."' },
    blood_money: { name: 'Argent du Sang', desc: 'Gagne 1 or pour chaque piece ennemie capturee (standard et speciale).', flavor: '"Chaque vie a un prix."' },
    mirror_shield: { name: 'Bouclier Miroir', desc: 'Ton Roi est immunise contre le premier echec de chaque combat.', flavor: '"Reflete la menace."' },
  },

  _readPath(obj, path) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length; i++) {
      if (!cur || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  },

  _interpolate(str, vars) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, (m, key) => {
      if (vars && Object.prototype.hasOwnProperty.call(vars, key)) {
        return String(vars[key]);
      }
      return m;
    });
  },

  t(key, vars) {
    const localized = this._readPath(this.messages[this.current], key);
    const fallback = this._readPath(this.messages.en, key);
    const value = localized !== undefined ? localized : (fallback !== undefined ? fallback : key);
    return this._interpolate(value, vars);
  },

  getLanguage() {
    return this.current;
  },

  getLocale() {
    return this.current === 'fr' ? 'fr-FR' : 'en-US';
  },

  setLanguage(lang, options) {
    const opts = options || {};
    const next = this.supported.includes(lang) ? lang : 'en';
    this.current = next;

    if (document && document.documentElement) {
      document.documentElement.lang = next;
    }

    if (opts.persist !== false && typeof Saves !== 'undefined' && Saves && typeof Saves.loadSettings === 'function') {
      const s = Saves.loadSettings();
      s.language = next;
      Saves.saveSettings(s);
    }

    if (opts.apply !== false) {
      this.applyToDOM();
      this._notify();
    }
  },

  onChange(handler) {
    if (typeof handler === 'function') {
      this._listeners.push(handler);
    }
  },

  _notify() {
    this._listeners.forEach(fn => {
      try { fn(this.current); } catch (e) {
        console.warn('I18n listener error:', e);
      }
    });
  },

  applyToDOM(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    scope.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.t(key);
    });
  },

  pieceInfo(type) {
    const base = (typeof PIECE_INFO !== 'undefined' && PIECE_INFO[type]) ? PIECE_INFO[type] : { name: type, desc: '' };
    if (this.current !== 'fr') return base;
    const fr = this.frPieceInfo[type];
    if (!fr) return base;
    return {
      name: fr.name || base.name,
      desc: fr.desc || base.desc,
    };
  },

  pieceName(type) {
    return this.pieceInfo(type).name;
  },

  pieceDesc(type) {
    return this.pieceInfo(type).desc;
  },

  relicInfo(id) {
    if (typeof RELICS === 'undefined') return null;
    const base = RELICS[id];
    if (!base) return null;
    if (this.current !== 'fr') return base;
    const fr = this.frRelics[id];
    if (!fr) return base;
    return {
      ...base,
      name: fr.name || base.name,
      desc: fr.desc || base.desc,
      flavor: fr.flavor || base.flavor,
    };
  },

  loreInfo(type) {
    if (typeof LORE === 'undefined') return null;
    const base = LORE[type];
    if (!base) return null;
    const tags = Array.isArray(base.tags)
      ? base.tags.map(tag => this.t('tags.' + tag))
      : base.tags;
    return {
      ...base,
      tags,
    };
  },

  categoryName(category, upper) {
    const value = this.t('category.' + (category || 'unknown'));
    return upper ? value.toUpperCase() : value;
  },

  rarityName(rarity) {
    return this.t('rarity.' + rarity);
  },
};
