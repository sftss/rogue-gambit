// ==================== GOLD SYSTEM ====================

const GoldSystem = {
  gold: 0,
  battleGold: 0,   // gold earned during current battle (shown in game screen)
  rerollCount: 0,  // how many times shop was rerolled this visit

  reset() {
    this.gold = 0;
    this.battleGold = 0;
    this.rerollCount = 0;
  },

  resetBattleGold() {
    this.battleGold = 0;
    this.rerollCount = 0;
  },

  earn(amount, source) {
    this.gold += amount;
    this.battleGold += amount;
    this.updateDisplay();
    if (source) {
      // Flash animation on gold display
      const el = document.getElementById('gold-display');
      if (el) {
        el.classList.remove('gold-earned');
        void el.offsetWidth; // reflow
        el.classList.add('gold-earned');
      }
    }
    return amount;
  },

  spend(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    this.updateDisplay();
    return true;
  },

  canAfford(amount) {
    return this.gold >= amount;
  },

  // Calculate interest: floor(gold / 5) capped at 5
  getInterest() {
    return Math.min(Math.floor(this.gold / GOLD.INTEREST_PER), GOLD.INTEREST_MAX);
  },

  // Apply end-of-round interest + win bonus
  applyRoundEnd(won) {
    if (!won) return 0;

    let earned = 0;
    const round = Draft.state.round;

    // Base win reward
    earned += GOLD.WIN_BASE;

    // Round bonus: extra gold equal to round number
    earned += round;

    // Interest
    const interest = this.getInterest();
    earned += interest;

    // Loan shark relic
    // (applied in shop itself)

    this.earn(earned, 'round_end');
    return earned;
  },

  getRerollCost() {
    return SHOP_COSTS.reroll + this.rerollCount;
  },

  reroll() {
    const cost = this.getRerollCost();
    if (!this.spend(cost)) return false;
    this.rerollCount++;
    return true;
  },

  updateDisplay() {
    // Update all gold display elements
    document.querySelectorAll('.gold-amount').forEach(el => {
      el.textContent = this.gold + 'g';
    });
    document.querySelectorAll('.gold-interest').forEach(el => {
      el.textContent = '+' + this.getInterest() + 'g interest';
    });
  },
};
