export const monsterMovesData = {
        columns: [
  {
    "name": "Name",
    "type": "text",
    "editable": true
  },
  {
    "name": "Mon",
    "type": "text",
    "editable": false
  },
  {
    "name": "Power",
    "type": "text",
    "editable": true
  },
  {
    "name": "Stamina",
    "type": "number",
    "editable": true
  },
  {
    "name": "Accuracy",
    "type": "number",
    "editable": true
  },
  {
    "name": "Type",
    "type": "text",
    "editable": true
  },
  {
    "name": "Class",
    "type": "text",
    "editable": true
  },
  {
    "name": "Description",
    "type": "text",
    "editable": true
  }
],
        data: [
  {
    "Name": "Eternal Grudge",
    "Mon": "Ghouliath",
    "Power": "0",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Yang",
    "Class": "Self",
    "Description": "KO’s self, inflicts Grudge on the opponent. Halves all stats (or something)."
  },
  {
    "Name": "Wither Away",
    "Mon": "Ghouliath",
    "Power": "60",
    "Stamina": 3,
    "Accuracy": 100,
    "Type": "Yang",
    "Class": "Special",
    "Description": "Deals damage and then inflicts Spook on both parties."
  },
  {
    "Name": "Hellfire",
    "Mon": "Ghouliath",
    "Power": "120",
    "Stamina": 3,
    "Accuracy": 90,
    "Type": "Fire",
    "Class": "Special",
    "Description": "Deals damage, 10% chance of inflicting Burn."
  },
  {
    "Name": "Osteoporosis",
    "Mon": "Ghouliath",
    "Power": "90",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Yang",
    "Class": "Special",
    "Description": "Deals damage."
  },
  {
    "Name": "Rock Pull",
    "Mon": "Gorillax",
    "Power": "?",
    "Accuracy": 100,
    "Stamina": 3,
    "Type": "Earth",
    "Class": "Physical",
    "Description": "If the opposing Mon is attempting to switch out, deals damage heavy damage (+1 priority). Otherwise, deals damage to Gorillax. (Should implement this with a global onMonSwitchOut effect that expires at end of turn, with highest priority, and then deals damage to self if it doesn’t trigger)."
  },
  {
    "Name": "Punch",
    "Mon": "Gorillax",
    "Power": "90",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Earth",
    "Class": "Physical",
    "Description": "Deals damage."
  },
  {
    "Name": "Chain Expansion",
    "Mon": "Inutia",
    "Power": "0",
    "Stamina": 5,
    "Accuracy": 100,
    "Type": "Mythic",
    "Class": "Other",
    "Description": "Sets up long-lasting battlefield effect. Triggers on switch in for both opponent and self. Damages opponent (flat amount? % of HP?), and heals self. (Just flat # of turns)."
  },
  {
    "Name": "Warp Warp",
    "Mon": "Inutia",
    "Power": "20",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Mythic",
    "Class": "Special",
    "Description": "Deals damage and then swaps to another mon. (-1 priority)."
  },
  {
    "Name": "Big Bite",
    "Mon": "Inutia",
    "Power": "70",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Wild",
    "Class": "Physical",
    "Description": "Deals damage."
  },
  {
    "Name": "Chill Out",
    "Mon": "Pengym",
    "Power": "0",
    "Stamina": 2,
    "Accuracy": 90,
    "Type": "Ice",
    "Class": "Other",
    "Description": "Inflicts Frostbite, which lasts 5 turns. Frostbite deals 1/16 damage every turn, and also halves special attack."
  },
  {
    "Name": "Deep Freeze",
    "Mon": "Pengym",
    "Power": "75",
    "Stamina": 3,
    "Accuracy": 100,
    "Type": "Ice",
    "Class": "Physical",
    "Description": "If the target has Frostbite, consumes Frostbite and does double damage."
  },
  {
    "Name": "Deadlift",
    "Mon": "Pengym",
    "Power": "0",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Metal",
    "Class": "Self",
    "Description": "Increases ATK and DEF."
  },
  {
    "Name": "Pistol Squat",
    "Mon": "Pengym",
    "Power": "80",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Metal",
    "Class": "Physical",
    "Description": "Deals damage."
  },
  {
    "Name": "Gachachacha",
    "Mon": "Sofabbi",
    "Power": "?",
    "Stamina": 3,
    "Accuracy": 100,
    "Type": "Nature",
    "Class": "Physical",
    "Description": "Uniformly random power from 0 to 200. Maybe some extra effects (instant kill for either you or opponent)."
  },
  {
    "Name": "Baselight",
    "Mon": "Iblivion",
    "Power": "?",
    "Stamina": 0,
    "Accuracy": 100,
    "Type": "Yin",
    "Class": "Special",
    "Description": "Power and Stamina go up each time, up to a cap of 5."
  },
  {
    "Name": "Loop",
    "Mon": "Iblivion",
    "Power": "0",
    "Stamina": 1,
    "Accuracy": 100,
    "Type": "Cosmic",
    "Class": "Self",
    "Description": "Restores all Stamina to full."
  },
  {
    "Name": "Other Punch",
    "Mon": "Iblivion",
    "Power": "50",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Wild",
    "Class": "Physical",
    "Description": "Deals damage."
  }
]
      };