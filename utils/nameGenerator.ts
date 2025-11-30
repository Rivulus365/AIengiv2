
const NAME_DATA = {
  human: {
    prefixes: ["Al", "Ber", "Ced", "Dav", "Ed", "Fal", "Gar", "Hal", "Ias", "Jar", "Kal", "Lan", "Mar", "Ned", "Os", "Per", "Quin", "Red", "Sar", "Tal", "Ul", "Val", "War", "Xan", "Yar", "Zan"],
    suffixes: ["ric", "ard", "ic", "en", "win", "k", "ret", "mon", "or", "od", "an", "ic", "ek", "iles", "ric", "in", "nn", "ald", "in", "p", "f", "ric", "ton", "der", "bert", "ic"],
    titles: ["the Brave", "the Just", "the Swift", "the Strong", "Stormborn", "Ironheart", "Walker", "Lightbringer", "Shadowstep"]
  },
  elf: {
    prefixes: ["Ad", "Ae", "Bal", "Cael", "Dae", "El", "Fae", "Gae", "Ha", "Ia", "Ja", "Kae", "Lae", "Ma", "Na", "Pa", "Qu", "Rae", "Sa", "Tae", "Va", "Xa", "Ya", "Za"],
    suffixes: ["las", "ian", "or", "in", "a", "ae", "i", "o", "u", "y", "wyn", "riel", "dor", "thas", "dil", "mar", "lith", "n", "s", "th"],
    titles: ["Moonwhisper", "Starlight", "Sunstrider", "Leafwalker", "Dawnseeker", "Nightbreeze", "Starfall"]
  },
  dwarf: {
    prefixes: ["Bal", "Bo", "Dur", "Dwo", "Gan", "Gim", "Kil", "Kor", "Mor", "No", "Tho", "Tor", "Bram", "Grum"],
    suffixes: ["in", "on", "ar", "or", "ur", "ik", "ok", "uk", "al", "ol", "ul", "am", "um", "an", "un", "li", "ri"],
    titles: ["Ironfoot", "Stonehelm", "Hammerhand", "Goldfinder", "Deepdelver", "Anvilbreaker", "Forgefire"]
  },
  orc: {
    prefixes: ["Gr", "Kr", "Br", "Tr", "Dr", "Mr", "Nr", "Zr", "Gl", "Kl", "Bl", "Grom", "Throk", "Mog", "Zog"],
    suffixes: ["ak", "ok", "uk", "ash", "ush", "osh", "ar", "or", "ur", "ag", "ug", "og", "tar", "gar"],
    titles: ["the Crusher", "Bloodfist", "Skullcleaver", "Bonebreaker", "Doomhammer", "Ragebringer"]
  }
};

function getRandomElement(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFantasyName(race: string, gender?: string): string {
  const normalizedRace = race.toLowerCase();
  
  let data = NAME_DATA.human;
  if (normalizedRace.includes('elf') || normalizedRace.includes('fey') || normalizedRace.includes('sylv') || normalizedRace.includes('aasimar')) data = NAME_DATA.elf;
  else if (normalizedRace.includes('dwarf') || normalizedRace.includes('gnome') || normalizedRace.includes('halfling')) data = NAME_DATA.dwarf;
  else if (normalizedRace.includes('orc') || normalizedRace.includes('goblin') || normalizedRace.includes('troll') || normalizedRace.includes('dragon')) data = NAME_DATA.orc;
  else if (normalizedRace.includes('goliath') || normalizedRace.includes('barbarian')) data = NAME_DATA.orc; // Harsh names for big folks

  let name = getRandomElement(data.prefixes) + getRandomElement(data.suffixes);
  
  // 15% chance for a title
  if (Math.random() < 0.15) {
    name += " " + getRandomElement(data.titles);
  }

  return name;
}
