const fs = require('fs');
const path = require('path');

const util = require('util');
[ TextEncoder, TextDecoder ] = [util.TextEncoder, util.TextDecoder]
Object.assign(global, { TextDecoder, TextEncoder });

const { JSDOM } = require('jsdom');

const html = fs.readFileSync(
  path.resolve(__dirname, 'ideal.html'),
  'utf8'
);

let document;
let window;
beforeEach(() => {
  const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
  document = dom.window.document;
  window = dom.window;
});

// Requirement 1.
test('User presented with a pair of foods for comparison', () => {
  const choiceContainer = document.getElementById('choice-container');
  expect(choiceContainer.children.length).toBe(2);

  const choices = Array.from(choiceContainer.children).map(choice => choice.textContent);
  expect(choices.length).toBe(2);
  expect(window.foods.includes(choices[0])).toBeTruthy();
  expect(window.foods.includes(choices[1])).toBeTruthy();
});

// Requirement 2.
test('Clicking a food increases its ELO and decreases the other', () => {
  const choiceContainer = document.getElementById('choice-container');
  const choices = choiceContainer.querySelectorAll('.choice');

  const food1 = choices[0].textContent;
  const food2 = choices[1].textContent;
  const elo1 = window.eloScores[food1];
  const elo2 = window.eloScores[food2];

  choices[0].click();

  expect(window.eloScores[food1] > elo1).toBeTruthy();
  expect(window.eloScores[food2] < elo2).toBeTruthy();
});

// Requirement 3.
test('UI shows the number of comparisons left', () => {
  const comparisonCount = document.getElementById('comparisons-remaining');
  expect(comparisonCount.textContent).toBe(`${window.comparisonsRemaining}`);
});

// Requirement 4.
test('Clicking a choice decreases the value of remaining comparisons by 1', () => {
  const initialCount = parseInt(document.getElementById('comparisons-remaining').textContent);
  const choiceContainer = document.getElementById('choice-container');
  choiceContainer.querySelector('.choice').click();

  expect(document.getElementById('comparisons-remaining').textContent).toBe(`${initialCount - 1}`);
});

// Requirement 5, 6 and 8.
test('Results are shown with food ranking when comparisons reach 0', () => {
  // Simulate 15 clicks (all comparisons)
  while (window.comparisonsRemaining > 0) {
    document.getElementById('choice-container').querySelector('.choice').click();
  }

  expect(document.getElementById('choice-container').children.length).toBe(0); // Choice container cleared
  expect(document.getElementById('comparison-counter').style.display === 'none').toBeTruthy();
  expect(document.getElementById('results').textContent).toContain('Your Food Ranking:');
  expect(document.getElementById('results').querySelector('ol')).toBeTruthy(); // Ordered list exists
});

// Requirement 9.
test('On load, all foods have same elo score', () => {
  const valSet = new Set(Object.entries(window.eloScores).map(([, val]) => val));
  expect(valSet.size === 1).toBeTruthy();
  valSet.forEach(val => expect(val == 0 || parseInt(val)));
});

// Requirement 10.
test('Foods picked using pick2RandomFoods function are random and different.', () => {
  const {food1, food2} = window.pick2RandomFoods();
  const {food1: food12, food2: food22} = window.pick2RandomFoods();

  expect(food1 !== food2).toBeTruthy();
  expect(food12 !== food22).toBeTruthy();

  for (var i=0; i<50; i++) {
    expect((food1 !== food12) || (food2 !== food22)).toBeTruthy();
  }
});
