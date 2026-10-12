// Teleport hunting zones above level 105. IDs match the game's teleport list
// and are the keys of saved comparisons, so never renumber them.

// Zones listed under the in-game "Hunting Zones" (party) teleport tab.
const PARTY_ZONE_IDS = new Set([
    2, 4, 10, 33, 66, 79, 132, 134, 137, 148, 189,
    195, 205, 207, 211, 387, 425, 426, 437, 438, 443, 444,
]);

const HUNTING_ZONES = Object.freeze([
    { id: 69, name: 'Shadow of the Mother Tree', level: 130 },
    { id: 132, name: 'Kasha Orc Fortress', level: 130 },
    { id: 427, name: 'Sel Mahum Base', level: 130 },
    { id: 193, name: 'Wall of Argos', level: 128 },
    { id: 438, name: 'Langk Lizardmen Temple', level: 128 },
    { id: 148, name: 'Plunderous Plains', level: 127 },
    { id: 2, name: 'Execution Grounds', level: 126 },
    { id: 134, name: "Kasha Orcs' Logging Site", level: 126 },
    { id: 184, name: 'Hot Springs', level: 126 },
    { id: 211, name: 'Swamp of Screams', level: 126 },
    { id: 387, name: 'Fafurion Temple', level: 126 },
    { id: 437, name: 'Langk Lizardmen Barracks', level: 126 },
    { id: 444, name: 'Baluan Battleground', level: 126 },
    { id: 104, name: 'Cemetery', level: 124 },
    { id: 425, name: 'Dragon Valley - West', level: 124 },
    { id: 426, name: 'Dragon Valley - East', level: 124 },
    { id: 79, name: 'Sea of Spores', level: 122 },
    { id: 118, name: 'Fields of Massacre', level: 122 },
    { id: 137, name: 'Immortal Plateau', level: 122 },
    { id: 205, name: 'Beast Farm', level: 122 },
    { id: 443, name: 'Snowy Volcano', level: 122 },
    { id: 84, name: 'Plains of the Lizardmen', level: 120 },
    { id: 189, name: 'Ketra Orc Outpost', level: 120 },
    { id: 195, name: 'Varka Silenos Barracks', level: 120 },
    { id: 85, name: 'Sel Mahum Training Grounds', level: 118 },
    { id: 207, name: 'Valley of Saints', level: 118 },
    { id: 4, name: 'Cruma Marshlands', level: 116 },
    { id: 123, name: 'Field of Whispers', level: 116 },
    { id: 33, name: 'Wasteland', level: 114 },
    { id: 122, name: 'Field of Silence', level: 114 },
    { id: 66, name: 'Neutral Zone', level: 112 },
    { id: 234, name: 'Isle of Prayer', level: 112 },
    { id: 125, name: 'Alligator Island', level: 110 },
    { id: 105, name: 'Forest of Mirrors', level: 108 },
    { id: 10, name: 'Tanor Canyon', level: 108 },
    { id: 276, name: 'Phantasmal Ridge', level: 106 },
].map((zone) => Object.freeze({ ...zone, isParty: PARTY_ZONE_IDS.has(zone.id) })));
