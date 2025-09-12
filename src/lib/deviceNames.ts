// Device name generator with creative, memorable combinations
// Inspired by the user's examples: cookievanilla, zedblade, pikanika

const adjectives = [
  // Food & Flavors
  "cookie",
  "vanilla",
  "chocolate",
  "caramel",
  "mint",
  "berry",
  "honey",
  "spice",
  "lemon",
  "cherry",
  "banana",
  "mango",
  "coconut",
  "almond",
  "coffee",
  "sugar",

  // Cool/Tech Words
  "cyber",
  "neon",
  "pixel",
  "quantum",
  "digital",
  "chrome",
  "steel",
  "iron",
  "laser",
  "plasma",
  "atomic",
  "sonic",
  "electric",
  "magnetic",
  "crystal",
  "diamond",

  // Fantasy/Gaming
  "shadow",
  "flame",
  "frost",
  "storm",
  "mystic",
  "magic",
  "ancient",
  "golden",
  "silver",
  "ruby",
  "emerald",
  "cosmic",
  "stellar",
  "lunar",
  "solar",
  "void",

  // Animals & Creatures
  "fox",
  "wolf",
  "bear",
  "tiger",
  "eagle",
  "shark",
  "dolphin",
  "penguin",
  "panda",
  "koala",
  "gecko",
  "falcon",
  "raven",
  "lynx",
  "otter",
  "seal",

  // Nature
  "ocean",
  "forest",
  "mountain",
  "river",
  "meadow",
  "desert",
  "tundra",
  "jungle",
  "canyon",
  "valley",
  "ridge",
  "peak",
  "cliff",
  "shore",
  "island",
  "glacier",
];

const nouns = [
  // Weapons & Tools (like zedblade)
  "blade",
  "sword",
  "arrow",
  "spear",
  "hammer",
  "axe",
  "shield",
  "bow",
  "staff",
  "wand",
  "dagger",
  "lance",
  "mace",
  "saber",
  "katana",
  "scythe",

  // Tech & Gaming
  "core",
  "chip",
  "byte",
  "code",
  "link",
  "node",
  "grid",
  "mesh",
  "cache",
  "buffer",
  "stack",
  "queue",
  "thread",
  "pipe",
  "port",
  "socket",

  // Characters/Creatures (like pikanika)
  "ninja",
  "samurai",
  "warrior",
  "ranger",
  "mage",
  "wizard",
  "knight",
  "scout",
  "hunter",
  "guardian",
  "sentinel",
  "champion",
  "master",
  "legend",
  "hero",
  "sage",

  // Objects & Things
  "stone",
  "gem",
  "crystal",
  "orb",
  "prism",
  "mirror",
  "lens",
  "beacon",
  "spark",
  "flash",
  "burst",
  "wave",
  "pulse",
  "surge",
  "glow",
  "shimmer",

  // Abstract Concepts
  "dream",
  "echo",
  "whisper",
  "shadow",
  "spirit",
  "essence",
  "force",
  "power",
  "energy",
  "aura",
  "vibe",
  "flow",
  "rhythm",
  "harmony",
  "symphony",
  "melody",
];

// Special combinations for extra creativity
const specialCombos = [
  "cookievanilla",
  "zedblade",
  "pikanika", 
  "cyberpunk",
  "shadowfox",
  "moonbeam",
  "starfire",
  "thunderbolt",
  "icestorm",
  "goldenwolf",
  "silverarrow",
  "crystalcore",
  "plasmawave",
  "quantumleap",
  "voidwalker",
  "dragonheart",
  "phoenixwing",
  "tigerclaw",
  "eagleeye",
  "sharkbite",
  "foxfire",
  "forestmist",
  "oceandepth",
  "mountainpeak",
  "desertstorm",
  "glacierflow",
  "valleysong",
];

/**
 * Generates a creative, memorable device name
 * @returns {string} A unique device name like 'cookievanilla', 'zedblade', 'pikanika'
 */
export const generateDeviceName = (): string => {
  // 20% chance to use a special combo
  if (Math.random() < 0.2 && specialCombos.length > 0) {
    return specialCombos[Math.floor(Math.random() * specialCombos.length)];
  }

  // 80% chance to generate from adjective + noun
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adjective}${noun}`;
};

/**
 * Generates multiple unique device names
 * @param {number} count - Number of names to generate
 * @returns {string[]} Array of unique device names
 */
export const generateUniqueDeviceNames = (count: number): string[] => {
  const names = new Set<string>();

  while (names.size < count) {
    names.add(generateDeviceName());
  }

  return Array.from(names);
};

/**
 * Gets a device name with fallback to generated name
 * @param {string} [customName] - Optional custom name
 * @returns {string} Device name (custom or generated)
 */
export const getDeviceName = (customName?: string): string => {
  if (customName && customName.trim().length > 0) {
    return customName.trim();
  }

  return generateDeviceName();
};

// Export some collections for testing/preview
export { adjectives, nouns, specialCombos };
