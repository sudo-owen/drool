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
    "Description": "Gorillax attempts to pull the very ground beneath the target’s feet. If the opposing Mon is attempting to switch out, deals damage heavy damage (+1 priority). Otherwise, deals damage to Gorillax."
  },
  {
    "Name": "Chill Out",
    "Mon": "Pengym",
    "Power": "0",
    "Stamina": 2,
    "Accuracy": 90,
    "Type": "Ice",
    "Class": "Status",
    "Description": "Inflicts Frostbite, which lasts 5 turns. Frostbite deals 1/16 damage every turn, and also halves special attack."
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
  }
]
      };