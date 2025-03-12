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
    "Name": "Warp Warp",
    "Mon": "Inutia",
    "Power": "20",
    "Stamina": 2,
    "Accuracy": 100,
    "Type": "Wild",
    "Class": "Special",
    "Description": "Deals damage and then swaps to another mon. (-1 priority)."
  },
  {
    "Name": "Chain Expansion",
    "Mon": "Inutia",
    "Power": "0",
    "Stamina": 5,
    "Accuracy": 100,
    "Type": "Mythic",
    "Class": "Other",
    "Description": "Sets up long-lasting battlefield effect. Triggers on switch in for both opponent and self. Damages opponent (flat amount? % of HP?), and heals self."
  },
  {
    "Name": "Deep Freeze",
    "Mon": "Pengym",
    "Power": "50",
    "Stamina": 3,
    "Accuracy": 100,
    "Type": "Ice",
    "Class": "Special",
    "Description": "If the target has Frostbite, consumes Frostbite and does double damage."
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
    "Class": "Physical",
    "Description": "Deals damage and then inflicts Spook on both parties."
  }
]
      };