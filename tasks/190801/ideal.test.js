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

let document, window;

jest.useFakeTimers();
jest.setTimeout(6000);

describe('Reaction Time Test App', () => {

  beforeEach(() => {
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    window = dom.window;
  });

  // Requirement 1 & Assumption 1
  it('should have a div with id "coloured-area"', () => {
    const colouredArea = document.getElementById('coloured-area');
    expect(colouredArea).toBeTruthy();
  });

  // Requirement 2 & Assumption 2
  it('should have a div with id "message"', () => {
    const message = document.getElementById('message');
    expect(message).toBeTruthy();
  });

  // Requirement 3 & Assumption 3
  it('should have initial color blue and message "Click the coloured box start the game."', () => {
    const colouredArea = document.getElementById('coloured-area');
    const message = document.getElementById('message');

    expect(colouredArea.style.backgroundColor).toBe('blue');
    expect(message.textContent).toBe('Click the coloured box start the game.');
  });

  // Requirement 4 & Assumption 4
  it('should change color to red and message on first click', () => {
    const colouredArea = document.getElementById('coloured-area');
    const message = document.getElementById('message');

    colouredArea.dispatchEvent(new window.MouseEvent('mousedown'));

    expect(colouredArea.style.backgroundColor).toBe('red');
    expect(message.textContent).toBe('Click the coloured box as soon as its colour changes.');
  });

  // Requirement 5 & Assumption 5
  it('should show early click message on click before 1 second', () => {
    const colouredArea = document.getElementById('coloured-area');
    const message = document.getElementById('message');

    colouredArea.dispatchEvent(new window.MouseEvent('mousedown')); // Start game

    jest.advanceTimersByTime(500); // Simulate 0.5 seconds
    colouredArea.dispatchEvent(new window.MouseEvent('mousedown'));

    expect(colouredArea.style.backgroundColor).toBe('blue');
    expect(message.textContent).toBe('You clicked too early. Click the box to restart.');
  });

  // Requirement 6 & Assumption 6
  it('should show reaction time and retry message on click after 5 seconds', () => {
    const colouredArea = document.getElementById('coloured-area');
    const message = document.getElementById('message');

    jest.useFakeTimers();
    colouredArea.dispatchEvent(new window.MouseEvent('mousedown')); // Start game

    jest.advanceTimersByTime(5000); // Simulate 5 seconds

    colouredArea.dispatchEvent(new window.MouseEvent('mousedown'));

    expect(colouredArea.style.backgroundColor).toBe('blue');
    expect(message.textContent).toMatch(/Your reaction time = \d+ ms\. Click the box to try again./);
  });

  // Requirement 7 & Assumption 7
  it('should use mousedown event listener on coloured area', () => {
    const colouredArea = document.getElementById('coloured-area');
    const eventListener = colouredArea.onmousedown;

    expect(eventListener).toBeTruthy();
  });
});
