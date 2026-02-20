
/**
 * Hitung EXP yang dibutuhkan untuk naik ke level tertentu
 * @param level Level yang ingin dicapai
 * @returns Jumlah EXP yang dibutuhkan
 */
export function expNeededForLevel(level: number): number {
  // Rumus: 100 * (level^1.5)
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Hitung EXP yang dibutuhkan dari level sekarang ke level berikutnya
 * @param currentLevel Level saat ini
 * @returns EXP yang dibutuhkan untuk naik 1 level
 */
export function expToNextLevel(currentLevel: number): number {
  return expNeededForLevel(currentLevel + 1) - expNeededForLevel(currentLevel);
}


interface UserData {
  id: string;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  totalExp: number;
}

interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  remainingExp: number;
  expToNextLevel: number;
  totalExp: number;
  levelUpCount: number;  // Berapa kali naik level (bisa lebih dari 1)
}

/**
 * Proses penambahan EXP dan cek level up
 * @param user Data user sebelum nambah EXP
 * @param expGained EXP yang didapat dari quest
 * @returns Hasil level up
 */
export function processExpGain(user: UserData, expGained: number): LevelUpResult {
  let { level, currentExp, totalExp } = user;
  let remainingExp = currentExp + expGained;
  let levelUpCount = 0;
  
  // Hitung total EXP baru
  totalExp += expGained;
  
  // Selama EXP masih cukup untuk naik level, naik terus
  while (remainingExp >= expToNextLevel(level)) {
    // Kurangi EXP dengan yang dibutuhkan ke level berikutnya
    remainingExp -= expToNextLevel(level);
    
    // Naikkan level
    level++;
    levelUpCount++;
  }
  
  // Hitung EXP yang dibutuhkan ke level berikutnya
  const newExpToNextLevel = expToNextLevel(level);
  
  return {
    leveledUp: levelUpCount > 0,
    newLevel: level,
    remainingExp,
    expToNextLevel: newExpToNextLevel,
    totalExp,
    levelUpCount
  };
}