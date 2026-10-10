/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assessment, CodeQuestion, McqQuestion } from './types.ts';

// -------------------------------------------------------------
// SECTION A: Easy (q01 to q08) - 6 MCQs + 2 CODING (Weight 1)
// -------------------------------------------------------------

export const frontendSectionA: (McqQuestion | CodeQuestion)[] = [
  // q01 · Easy · MCQ
  {
    id: 'q01',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which HTML element is the most semantic choice for a block of main navigation links?`,
    prompt: `Which HTML element is the most semantic choice for a block of main navigation links?`,
    mcq_options: [
      'A. <nav>',
      'B. <div>',
      'C. <span>',
      'D. <section>',
    ],
    options: [
      { id: 'A', text: '<nav>' },
      { id: 'B', text: '<div>' },
      { id: 'C', text: '<span>' },
      { id: 'D', text: '<section>' },
    ],
    correct_answer: 'A. <nav>',
    correctOptionId: 'A',
    explanation: `<nav> tells browsers and assistive technology that the content is a navigation region.`,
    skills: ['frontend.html'],
  },

  // q02 · Easy · MCQ
  {
    id: 'q02',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which CSS property changes the color of text?`,
    prompt: `Which CSS property changes the color of text?`,
    mcq_options: [
      'A. font-color',
      'B. foreground',
      'C. text-style',
      'D. color',
    ],
    options: [
      { id: 'A', text: 'font-color' },
      { id: 'B', text: 'foreground' },
      { id: 'C', text: 'text-style' },
      { id: 'D', text: 'color' },
    ],
    correct_answer: 'D. color',
    correctOptionId: 'D',
    explanation: `color sets the text color. background-color sets the background.`,
    skills: ['frontend.css'],
  },

  // q03 · Easy · MCQ
  {
    id: 'q03',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which of these is NOT a primitive type in JavaScript?`,
    prompt: `Which of these is NOT a primitive type in JavaScript?`,
    mcq_options: [
      'A. String',
      'B. Number',
      'C. Boolean',
      'D. Object',
    ],
    options: [
      { id: 'A', text: 'String' },
      { id: 'B', text: 'Number' },
      { id: 'C', text: 'Boolean' },
      { id: 'D', text: 'Object' },
    ],
    correct_answer: 'D. Object',
    correctOptionId: 'D',
    explanation: `String, Number and Boolean are primitives. Objects (including arrays and functions) are reference types.`,
    skills: ['frontend.javascript'],
  },

  // q04 · Easy · MCQ
  {
    id: 'q04',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `In the CSS box model, which order is correct from the inside to the outside of an element?`,
    prompt: `In the CSS box model, which order is correct from the inside to the outside of an element?`,
    mcq_options: [
      'A. Content, border, padding, margin',
      'B. Padding, content, margin, border',
      'C. Margin, border, padding, content',
      'D. Content, padding, border, margin',
    ],
    options: [
      { id: 'A', text: 'Content, border, padding, margin' },
      { id: 'B', text: 'Padding, content, margin, border' },
      { id: 'C', text: 'Margin, border, padding, content' },
      { id: 'D', text: 'Content, padding, border, margin' },
    ],
    correct_answer: 'D. Content, padding, border, margin',
    correctOptionId: 'D',
    explanation: `Content is surrounded by padding, then the border, then the margin.`,
    skills: ['frontend.css'],
  },

  // q05 · Easy · MCQ
  {
    id: 'q05',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What does the \`===\` operator do in JavaScript?`,
    prompt: `What does the \`===\` operator do in JavaScript?`,
    mcq_options: [
      'A. Compares only the value after converting types',
      'B. Compares object references only',
      'C. Assigns a value and compares it',
      'D. Compares value and type without type coercion',
    ],
    options: [
      { id: 'A', text: 'Compares only the value after converting types' },
      { id: 'B', text: 'Compares object references only' },
      { id: 'C', text: 'Assigns a value and compares it' },
      { id: 'D', text: 'Compares value and type without type coercion' },
    ],
    correct_answer: 'D. Compares value and type without type coercion',
    correctOptionId: 'D',
    explanation: `=== is strict equality: 5 === "5" is false because the types differ, while 5 == "5" is true.`,
    skills: ['frontend.javascript'],
  },

  // q06 · Easy · MCQ
  {
    id: 'q06',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which HTML attribute provides alternative text for an image?`,
    prompt: `Which HTML attribute provides alternative text for an image?`,
    mcq_options: [
      'A. title',
      'B. alt',
      'C. src',
      'D. caption',
    ],
    options: [
      { id: 'A', text: 'title' },
      { id: 'B', text: 'alt' },
      { id: 'C', text: 'src' },
      { id: 'D', text: 'caption' },
    ],
    correct_answer: 'B. alt',
    correctOptionId: 'B',
    explanation: `alt is read by screen readers and shown if the image fails to load.`,
    skills: ['frontend.html'],
  },

  // q07 · Easy · CODING · Count Words
  {
    id: 'q07',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Easy',
    question_type: 'CODING',
    type: 'code',
    title: 'Count Words',
    question_text: `**Problem:**

Count the words in a line of text. Words are separated by one or more whitespace characters, and leading or trailing spaces must be ignored.

**Input:** one line of text.
**Output:** a single integer, the number of words.`,
    statement: `Count the words in a line of text, ignoring leading/trailing whitespace.`,
    inputFormat: 'One line of text.',
    outputFormat: 'A single integer, the number of words.',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['0 <= text.length <= 10^5'],
    examples: [
      { input: 'hello world', output: '2' },
      { input: '  many   spaces  here ', output: '3' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const text = lines[0];
// TODO: count the words in text
console.log(0);`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const text = lines[0];
// TODO: count the words in text
console.log(0);`,
    },
    test_cases: [
      { input: 'hello world', expected_output: '2', is_hidden: false },
      { input: '  many   spaces  here ', expected_output: '3', is_hidden: false },
      { input: 'single', expected_output: '1', is_hidden: true },
      { input: 'a b c d e', expected_output: '5', is_hidden: true },
      { input: 'one,two three', expected_output: '2', is_hidden: true },
    ],
    visibleTests: [
      { input: 'hello world', expected: '2' },
      { input: '  many   spaces  here ', expected: '3' },
    ],
    hiddenTests: [
      { input: 'single', expected: '1', category: 'basic' },
      { input: 'a b c d e', expected: '5', category: 'basic' },
      { input: 'one,two three', expected: '2', category: 'basic' },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const text = lines[0].trim();
console.log(text === '' ? 0 : text.split(/\\s+/).length);`,
    explanation: `Trim the line, then split on runs of whitespace. O(n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },

  // q08 · Easy · CODING · Title Case
  {
    id: 'q08',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Easy',
    question_type: 'CODING',
    type: 'code',
    title: 'Title Case',
    question_text: `**Problem:**

Convert a line of text to title case: the first letter of every word becomes uppercase and all other letters become lowercase. Words are separated by single spaces.

**Input:** one line of text.
**Output:** the converted text.`,
    statement: `Convert a line of text to title case.`,
    inputFormat: 'One line of text.',
    outputFormat: 'The converted text.',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['0 <= text.length <= 10^5'],
    examples: [
      { input: 'hello world', output: 'Hello World' },
      { input: 'jAVAsCRIPT is FUN', output: 'Javascript Is Fun' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const text = lines[0];
// TODO: capitalize the first letter of each word and lower-case the rest
console.log(text);`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const text = lines[0];
// TODO: capitalize the first letter of each word and lower-case the rest
console.log(text);`,
    },
    test_cases: [
      { input: 'hello world', expected_output: 'Hello World', is_hidden: false },
      { input: 'jAVAsCRIPT is FUN', expected_output: 'Javascript Is Fun', is_hidden: false },
      { input: 'a', expected_output: 'A', is_hidden: true },
      { input: 'front end developer', expected_output: 'Front End Developer', is_hidden: true },
      { input: 'CSS', expected_output: 'Css', is_hidden: true },
    ],
    visibleTests: [
      { input: 'hello world', expected: 'Hello World' },
      { input: 'jAVAsCRIPT is FUN', expected: 'Javascript Is Fun' },
    ],
    hiddenTests: [
      { input: 'a', expected: 'A', category: 'basic' },
      { input: 'front end developer', expected: 'Front End Developer', category: 'basic' },
      { input: 'CSS', expected: 'Css', category: 'basic' },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const text = lines[0];
const result = text
  .split(' ')
  .map(w => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
  .join(' ');
console.log(result);`,
    explanation: `Split on spaces, upper-case the first character of each word, lower-case the rest and join again. O(n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },
];

// -------------------------------------------------------------
// SECTION B: Medium (q09 to q18) - 6 MCQs + 4 CODING (Weight 2)
// -------------------------------------------------------------

export const frontendSectionB: (McqQuestion | CodeQuestion)[] = [
  // q09 · Medium · MCQ
  {
    id: 'q09',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What does \`justify-content: center\` do on a flex container (with the default row direction)?`,
    prompt: `What does \`justify-content: center\` do on a flex container (with the default row direction)?`,
    mcq_options: [
      'A. Centers the items along the cross (vertical) axis',
      'B. Centers the items along the main (horizontal) axis',
      'C. Centers the text inside each item',
      'D. Centers the container inside its parent',
    ],
    options: [
      { id: 'A', text: 'Centers the items along the cross (vertical) axis' },
      { id: 'B', text: 'Centers the items along the main (horizontal) axis' },
      { id: 'C', text: 'Centers the text inside each item' },
      { id: 'D', text: 'Centers the container inside its parent' },
    ],
    correct_answer: 'B. Centers the items along the main (horizontal) axis',
    correctOptionId: 'B',
    explanation: `justify-content aligns items along the main axis, which is horizontal for flex-direction: row. align-items handles the cross axis.`,
    skills: ['frontend.css'],
  },

  // q10 · Medium · MCQ
  {
    id: 'q10',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is a closure in JavaScript?`,
    prompt: `What is a closure in JavaScript?`,
    mcq_options: [
      'A. A function that keeps access to the variables of the scope where it was created, even after that scope has finished',
      'B. A method that stops a loop',
      'C. A way to close a browser window from code',
      'D. A function that cannot access outside variables',
    ],
    options: [
      { id: 'A', text: 'A function that keeps access to the variables of the scope where it was created, even after that scope has finished' },
      { id: 'B', text: 'A method that stops a loop' },
      { id: 'C', text: 'A way to close a browser window from code' },
      { id: 'D', text: 'A function that cannot access outside variables' },
    ],
    correct_answer: 'A. A function that keeps access to the variables of the scope where it was created, even after that scope has finished',
    correctOptionId: 'A',
    explanation: `Closures let inner functions remember outer variables, which is how private state, counters and callbacks work.`,
    skills: ['frontend.javascript'],
  },

  // q11 · Medium · MCQ
  {
    id: 'q11',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What does \`console.log(typeof null)\` print?`,
    prompt: `What does \`console.log(typeof null)\` print?`,
    mcq_options: [
      'A. number',
      'B. undefined',
      'C. object',
      'D. null',
    ],
    options: [
      { id: 'A', text: 'number' },
      { id: 'B', text: 'undefined' },
      { id: 'C', text: 'object' },
      { id: 'D', text: 'null' },
    ],
    correct_answer: 'C. object',
    correctOptionId: 'C',
    explanation: `typeof null is "object", a long-standing quirk of the language. Use value === null to check for null.`,
    skills: ['frontend.javascript'],
  },

  // q12 · Medium · MCQ
  {
    id: 'q12',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which CSS selector has the highest specificity?`,
    prompt: `Which CSS selector has the highest specificity?`,
    mcq_options: [
      'A. div p',
      'B. #card',
      'C. p',
      'D. .card',
    ],
    options: [
      { id: 'A', text: 'div p' },
      { id: 'B', text: '#card' },
      { id: 'C', text: 'p' },
      { id: 'D', text: '.card' },
    ],
    correct_answer: 'B. #card',
    correctOptionId: 'B',
    explanation: `An id selector outweighs a class selector, which outweighs element selectors. (Inline styles outweigh all of these.)`,
    skills: ['frontend.css'],
  },

  // q13 · Medium · MCQ
  {
    id: 'q13',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which React hook is used to keep local state inside a function component?`,
    prompt: `Which React hook is used to keep local state inside a function component?`,
    mcq_options: [
      'A. useState',
      'B. useMemo',
      'C. useContext',
      'D. useRef only',
    ],
    options: [
      { id: 'A', text: 'useState' },
      { id: 'B', text: 'useMemo' },
      { id: 'C', text: 'useContext' },
      { id: 'D', text: 'useRef only' },
    ],
    correct_answer: 'A. useState',
    correctOptionId: 'A',
    explanation: `useState returns the current state value and a setter that triggers a re-render when called.`,
    skills: ['frontend.react'],
  },

  // q14 · Medium · MCQ
  {
    id: 'q14',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What does an \`async\` function always return?`,
    prompt: `What does an \`async\` function always return?`,
    mcq_options: [
      'A. A Promise',
      'B. undefined',
      'C. The raw value it returns',
      'D. A callback function',
    ],
    options: [
      { id: 'A', text: 'A Promise' },
      { id: 'B', text: 'undefined' },
      { id: 'C', text: 'The raw value it returns' },
      { id: 'D', text: 'A callback function' },
    ],
    correct_answer: 'A. A Promise',
    correctOptionId: 'A',
    explanation: `An async function wraps its return value in a Promise (resolved), and a thrown error becomes a rejected Promise.`,
    skills: ['frontend.javascript'],
  },

  // q15 · Medium · CODING · Flatten a Nested Array
  {
    id: 'q15',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Flatten a Nested Array',
    question_text: `**Problem:**

Flatten an arbitrarily nested array of numbers into a single list, keeping the original order.

**Input:** one line containing a JSON array, for example \`[1,[2,[3,4]],5]\`.
**Output:** the numbers separated by single spaces (an empty line if there are none).`,
    statement: `Flatten an arbitrarily nested array of numbers into a single list.`,
    inputFormat: 'One line containing a JSON array.',
    outputFormat: 'The numbers separated by single spaces (an empty line if there are none).',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['Arbitrary nesting depth.'],
    examples: [
      { input: '[1,[2,[3,4]],5]', output: '1 2 3 4 5' },
      { input: '[[1],[2],[3]]', output: '1 2 3' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const arr = JSON.parse(lines[0]);
// TODO: flatten arr completely and print the numbers separated by spaces
console.log('');`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const arr = JSON.parse(lines[0]);
// TODO: flatten arr completely and print the numbers separated by spaces
console.log('');`,
    },
    test_cases: [
      { input: '[1,[2,[3,4]],5]', expected_output: '1 2 3 4 5', is_hidden: false },
      { input: '[[1],[2],[3]]', expected_output: '1 2 3', is_hidden: false },
      { input: '[1,2,3]', expected_output: '1 2 3', is_hidden: true },
      { input: '[[[[7]]]]', expected_output: '7', is_hidden: true },
      { input: '[1,[],[2,[]],3]', expected_output: '1 2 3', is_hidden: true },
    ],
    visibleTests: [
      { input: '[1,[2,[3,4]],5]', expected: '1 2 3 4 5' },
      { input: '[[1],[2],[3]]', expected: '1 2 3' },
    ],
    hiddenTests: [
      { input: '[1,2,3]', expected: '1 2 3', category: 'basic' },
      { input: '[[[[7]]]]', expected: '7', category: 'basic' },
      { input: '[1,[],[2,[]],3]', expected: '1 2 3', category: 'basic' },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const arr = JSON.parse(lines[0]);
function flatten(a) {
  const out = [];
  for (const item of a) {
    if (Array.isArray(item)) out.push(...flatten(item));
    else out.push(item);
  }
  return out;
}
console.log(flatten(arr).join(' '));`,
    explanation: `Recurse into any element that is an array and collect the other values. O(n) time over all elements.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },

  // q16 · Medium · CODING · Closure Counter
  {
    id: 'q16',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Closure Counter',
    question_text: `**Problem:**

Build a counter that keeps its own private state using a closure. It starts at 0 and supports four commands: \`inc\` (add 1), \`dec\` (subtract 1), \`reset\` (set to 0) and \`get\` (print the current value).

**Input:** the first line contains \`q\`; each of the next \`q\` lines is one command.
**Output:** for every \`get\`, print the current value on its own line.`,
    statement: `Build a counter that keeps its own private state using a closure.`,
    inputFormat: 'The first line contains q; each of the next q lines is one command.',
    outputFormat: 'For every get, print the current value on its own line.',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['1 <= q <= 10^4'],
    examples: [
      { input: '5\ninc\ninc\nget\ndec\nget', output: '2\n1' },
      { input: '3\nget\ninc\nget', output: '0\n1' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const q = parseInt(lines[0]);

function createCounter() {
  // TODO: keep the count in a private variable and return inc, dec, reset and get functions
  return { inc() {}, dec() {}, reset() {}, get() { return 0; } };
}

const counter = createCounter();
for (let i = 1; i <= q; i++) {
  const cmd = lines[i].trim();
  if (cmd === 'get') console.log(counter.get());
  else counter[cmd]();
}`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const q = parseInt(lines[0]);

function createCounter() {
  // TODO: keep the count in a private variable and return inc, dec, reset and get functions
  return { inc() {}, dec() {}, reset() {}, get() { return 0; } };
}

const counter = createCounter();
for (let i = 1; i <= q; i++) {
  const cmd = lines[i].trim();
  if (cmd === 'get') console.log(counter.get());
  else counter[cmd]();
}`,
    },
    test_cases: [
      { input: '5\ninc\ninc\nget\ndec\nget', expected_output: '2\n1', is_hidden: false },
      { input: '3\nget\ninc\nget', expected_output: '0\n1', is_hidden: false },
      { input: '4\ninc\nreset\nget\nget', expected_output: '0\n0', is_hidden: true },
      { input: '6\ndec\ndec\nget\ninc\ninc\nget', expected_output: '-2\n0', is_hidden: true },
      { input: '1\nget', expected_output: '0', is_hidden: true },
    ],
    visibleTests: [
      { input: '5\ninc\ninc\nget\ndec\nget', expected: '2\n1' },
      { input: '3\nget\ninc\nget', expected: '0\n1' },
    ],
    hiddenTests: [
      { input: '4\ninc\nreset\nget\nget', expected: '0\n0', category: 'basic' },
      { input: '6\ndec\ndec\nget\ninc\ninc\nget', expected: '-2\n0', category: 'basic' },
      { input: '1\nget', expected: '0', category: 'basic' },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const q = parseInt(lines[0]);

function createCounter() {
  let count = 0;
  return {
    inc() { count++; },
    dec() { count--; },
    reset() { count = 0; },
    get() { return count; },
  };
}

const counter = createCounter();
for (let i = 1; i <= q; i++) {
  const cmd = lines[i].trim();
  if (cmd === 'get') console.log(counter.get());
  else counter[cmd]();
}`,
    explanation: `count lives in the closure created by createCounter, so it cannot be changed from outside except through the returned methods. Each command is O(1).`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },

  // q17 · Medium · CODING · Deep Merge Objects
  {
    id: 'q17',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Deep Merge Objects',
    question_text: `**Problem:**

Merge two JSON objects \`a\` and \`b\` into a new object. Values from \`b\` win. If a key holds a plain object in both, merge those objects recursively. Arrays and other values from \`b\` replace the value from \`a\`. Keys keep the order: first the keys of \`a\`, then the new keys of \`b\`.

**Input:** two lines, each containing a JSON object (\`a\` then \`b\`).
**Output:** the merged object printed with \`JSON.stringify\` (no spaces).`,
    statement: `Merge two JSON objects into a new object recursively.`,
    inputFormat: 'Two lines, each containing a JSON object (a then b).',
    outputFormat: 'The merged object printed with JSON.stringify (no spaces).',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['Valid JSON on both lines.'],
    examples: [
      { input: '{"a":1,"b":{"c":2}}\n{"b":{"d":3},"e":4}', output: '{"a":1,"b":{"c":2,"d":3},"e":4}' },
      { input: '{"a":1}\n{"a":2}', output: '{"a":2}' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const a = JSON.parse(lines[0]);
const b = JSON.parse(lines[1]);

function deepMerge(a, b) {
  // TODO: return a new object that merges b into a as described
  return a;
}

console.log(JSON.stringify(deepMerge(a, b)));`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const a = JSON.parse(lines[0]);
const b = JSON.parse(lines[1]);

function deepMerge(a, b) {
  // TODO: return a new object that merges b into a as described
  return a;
}

console.log(JSON.stringify(deepMerge(a, b)));`,
    },
    test_cases: [
      {
        input: '{"a":1,"b":{"c":2}}\n{"b":{"d":3},"e":4}',
        expected_output: '{"a":1,"b":{"c":2,"d":3},"e":4}',
        is_hidden: false,
      },
      {
        input: '{"a":1}\n{"a":2}',
        expected_output: '{"a":2}',
        is_hidden: false,
      },
      {
        input: '{"a":{"x":1}}\n{"a":5}',
        expected_output: '{"a":5}',
        is_hidden: true,
      },
      {
        input: '{}\n{"k":[1,2]}',
        expected_output: '{"k":[1,2]}',
        is_hidden: true,
      },
      {
        input: '{"a":[1,2,3]}\n{"a":[9]}',
        expected_output: '{"a":[9]}',
        is_hidden: true,
      },
      {
        input: '{"p":{"q":{"r":1}}}\n{"p":{"q":{"s":2}}}',
        expected_output: '{"p":{"q":{"r":1,"s":2}}}',
        is_hidden: true,
      },
    ],
    visibleTests: [
      {
        input: '{"a":1,"b":{"c":2}}\n{"b":{"d":3},"e":4}',
        expected: '{"a":1,"b":{"c":2,"d":3},"e":4}',
      },
      {
        input: '{"a":1}\n{"a":2}',
        expected: '{"a":2}',
      },
    ],
    hiddenTests: [
      {
        input: '{"a":{"x":1}}\n{"a":5}',
        expected: '{"a":5}',
        category: 'basic',
      },
      {
        input: '{}\n{"k":[1,2]}',
        expected: '{"k":[1,2]}',
        category: 'basic',
      },
      {
        input: '{"a":[1,2,3]}\n{"a":[9]}',
        expected: '{"a":[9]}',
        category: 'basic',
      },
      {
        input: '{"p":{"q":{"r":1}}}\n{"p":{"q":{"s":2}}}',
        expected: '{"p":{"q":{"r":1,"s":2}}}',
        category: 'basic',
      },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const a = JSON.parse(lines[0]);
const b = JSON.parse(lines[1]);

const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function deepMerge(a, b) {
  const result = { ...a };
  for (const key of Object.keys(b)) {
    if (isPlainObject(result[key]) && isPlainObject(b[key])) {
      result[key] = deepMerge(result[key], b[key]);
    } else {
      result[key] = b[key];
    }
  }
  return result;
}

console.log(JSON.stringify(deepMerge(a, b)));`,
    explanation: `Copy a, then for each key of b either recurse (both values are plain objects) or overwrite. Arrays are not plain objects, so they are replaced.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },

  // q18 · Medium · CODING · Parse a Query String
  {
    id: 'q18',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Parse a Query String',
    question_text: `**Problem:**

Parse a URL query string into an object. Split pairs on \`&\` and each pair on its first \`=\`. Decode values with \`decodeURIComponent\`. A key that appears more than once becomes an array of its values in order. Keys appear in the order they are first seen.

**Input:** one line, for example \`a=1&b=2&a=3\`.
**Output:** the object printed with \`JSON.stringify\` (no spaces). All values are strings.`,
    statement: `Parse a URL query string into an object.`,
    inputFormat: 'One line, for example a=1&b=2&a=3.',
    outputFormat: 'The object printed with JSON.stringify (no spaces). All values are strings.',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['Valid query string characters.'],
    examples: [
      { input: 'a=1&b=2', output: '{"a":"1","b":"2"}' },
      { input: 'a=1&a=2&a=3', output: '{"a":["1","2","3"]}' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const query = lines[0].trim();
const result = {};
// TODO: fill result from the query string (repeated keys become arrays)
console.log(JSON.stringify(result));`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const query = lines[0].trim();
const result = {};
// TODO: fill result from the query string (repeated keys become arrays)
console.log(JSON.stringify(result));`,
    },
    test_cases: [
      { input: 'a=1&b=2', expected_output: '{"a":"1","b":"2"}', is_hidden: false },
      { input: 'a=1&a=2&a=3', expected_output: '{"a":["1","2","3"]}', is_hidden: false },
      { input: 'name=John%20Doe&city=Pune', expected_output: '{"name":"John Doe","city":"Pune"}', is_hidden: true },
      { input: 'x=&y=5', expected_output: '{"x":"","y":"5"}', is_hidden: true },
      { input: 'k=1&j=2&k=3', expected_output: '{"k":["1","3"],"j":"2"}', is_hidden: true },
    ],
    visibleTests: [
      { input: 'a=1&b=2', expected: '{"a":"1","b":"2"}' },
      { input: 'a=1&a=2&a=3', expected: '{"a":["1","2","3"]}' },
    ],
    hiddenTests: [
      { input: 'name=John%20Doe&city=Pune', expected: '{"name":"John Doe","city":"Pune"}', category: 'basic' },
      { input: 'x=&y=5', expected: '{"x":"","y":"5"}', category: 'basic' },
      { input: 'k=1&j=2&k=3', expected: '{"k":["1","3"],"j":"2"}', category: 'basic' },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const query = lines[0].trim();
const result = {};
for (const pair of query.split('&')) {
  if (!pair) continue;
  const idx = pair.indexOf('=');
  const key = decodeURIComponent(idx === -1 ? pair : pair.slice(0, idx));
  const value = decodeURIComponent(idx === -1 ? '' : pair.slice(idx + 1));
  if (key in result) {
    if (Array.isArray(result[key])) result[key].push(value);
    else result[key] = [result[key], value];
  } else {
    result[key] = value;
  }
}
console.log(JSON.stringify(result));`,
    explanation: `Split into pairs, decode key and value, and turn a repeated key into an array. O(n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },
];

// -------------------------------------------------------------
// SECTION C: Hard (q19 to q25) - 3 MCQs + 4 CODING (Weight 3)
// -------------------------------------------------------------

export const frontendSectionC: (McqQuestion | CodeQuestion)[] = [
  // q19 · Hard · MCQ
  {
    id: 'q19',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the output order of this code?
\`\`\`js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
\`\`\``,
    prompt: `What is the output order of this code?
\`\`\`js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
\`\`\``,
    mcq_options: [
      'A. A, B, C, D',
      'B. A, D, B, C',
      'C. A, D, C, B',
      'D. A, C, D, B',
    ],
    options: [
      { id: 'A', text: 'A, B, C, D' },
      { id: 'B', text: 'A, D, B, C' },
      { id: 'C', text: 'A, D, C, B' },
      { id: 'D', text: 'A, C, D, B' },
    ],
    correct_answer: 'C. A, D, C, B',
    correctOptionId: 'C',
    explanation: `Synchronous code runs first (A, D). Then the microtask queue (promise callbacks) runs (C), and only after that the timer callback from the macrotask queue runs (B).`,
    skills: ['frontend.javascript'],
  },

  // q20 · Hard · MCQ
  {
    id: 'q20',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What does \`useEffect(() => { ... }, [])\` do in a React function component?`,
    prompt: `What does \`useEffect(() => { ... }, [])\` do in a React function component?`,
    mcq_options: [
      'A. Runs its effect before the first render',
      'B. Runs its effect once after the first render, and its cleanup when the component unmounts',
      'C. Runs its effect after every render',
      'D. Never runs unless the props change',
    ],
    options: [
      { id: 'A', text: 'Runs its effect before the first render' },
      { id: 'B', text: 'Runs its effect once after the first render, and its cleanup when the component unmounts' },
      { id: 'C', text: 'Runs its effect after every render' },
      { id: 'D', text: 'Never runs unless the props change' },
    ],
    correct_answer: 'B. Runs its effect once after the first render, and its cleanup when the component unmounts',
    correctOptionId: 'B',
    explanation: `An empty dependency array means the effect has no dependencies, so it runs once after mounting. The returned cleanup function runs on unmount.`,
    skills: ['frontend.react'],
  },

  // q21 · Hard · MCQ
  {
    id: 'q21',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is event delegation?`,
    prompt: `What is event delegation?`,
    mcq_options: [
      'A. Cancelling events with preventDefault on every element',
      'B. Passing events from one browser tab to another',
      'C. Attaching one listener to a parent element and handling events from its children as they bubble up',
      'D. Attaching a separate listener to every child element',
    ],
    options: [
      { id: 'A', text: 'Cancelling events with preventDefault on every element' },
      { id: 'B', text: 'Passing events from one browser tab to another' },
      { id: 'C', text: 'Attaching one listener to a parent element and handling events from its children as they bubble up' },
      { id: 'D', text: 'Attaching a separate listener to every child element' },
    ],
    correct_answer: 'C. Attaching one listener to a parent element and handling events from its children as they bubble up',
    correctOptionId: 'C',
    explanation: `Because most events bubble, one listener on a parent can handle events for many children, including ones added later, using event.target.`,
    skills: ['frontend.javascript', 'frontend.dom'],
  },

  // q22 · Hard · CODING · Event Emitter
  {
    id: 'q22',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Event Emitter',
    question_text: `**Problem:**

Implement a tiny event emitter. Commands: \`on EVENT HANDLER\` registers a handler (identified by its name) for an event, \`off EVENT HANDLER\` removes it, and \`emit EVENT\` calls all handlers of that event in the order they were registered. Registering the same handler name twice for the same event is ignored.

**Input:** the first line contains \`q\`; each of the next \`q\` lines is one command.
**Output:** for every \`emit\`, print the names of the handlers that were called, separated by spaces, on one line, or \`NONE\` if no handler was registered for that event.`,
    statement: `Implement an Event Emitter supporting on, off, and emit commands.`,
    inputFormat: 'The first line contains q; each of the next q lines is one command.',
    outputFormat: 'For every emit, print the names of the handlers that were called, separated by spaces, on one line, or NONE.',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['1 <= q <= 10^4'],
    examples: [
      { input: '5\non click a\non click b\nemit click\noff click a\nemit click', output: 'a b\nb' },
      { input: '2\nemit load\non load x', output: 'NONE' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const q = parseInt(lines[0]);

class Emitter {
  // TODO: store handlers per event and implement on, off and emit
  on(event, handler) {}
  off(event, handler) {}
  emit(event) { return []; }
}

const emitter = new Emitter();
for (let i = 1; i <= q; i++) {
  const [cmd, event, handler] = lines[i].trim().split(/\\s+/);
  if (cmd === 'on') emitter.on(event, handler);
  else if (cmd === 'off') emitter.off(event, handler);
  else {
    const called = emitter.emit(event);
    console.log(called.length ? called.join(' ') : 'NONE');
  }
}`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const q = parseInt(lines[0]);

class Emitter {
  // TODO: store handlers per event and implement on, off and emit
  on(event, handler) {}
  off(event, handler) {}
  emit(event) { return []; }
}

const emitter = new Emitter();
for (let i = 1; i <= q; i++) {
  const [cmd, event, handler] = lines[i].trim().split(/\\s+/);
  if (cmd === 'on') emitter.on(event, handler);
  else if (cmd === 'off') emitter.off(event, handler);
  else {
    const called = emitter.emit(event);
    console.log(called.length ? called.join(' ') : 'NONE');
  }
}`,
    },
    test_cases: [
      {
        input: '5\non click a\non click b\nemit click\noff click a\nemit click',
        expected_output: 'a b\nb',
        is_hidden: false,
      },
      {
        input: '2\nemit load\non load x',
        expected_output: 'NONE',
        is_hidden: false,
      },
      {
        input: '6\non e h1\non e h1\non e h2\nemit e\noff e h1\nemit e',
        expected_output: 'h1 h2\nh2',
        is_hidden: true,
      },
      {
        input: '4\non a x\non b y\nemit b\nemit a',
        expected_output: 'y\nx',
        is_hidden: true,
      },
      {
        input: '5\non t one\noff t one\nemit t\non t two\nemit t',
        expected_output: 'NONE\ntwo',
        is_hidden: true,
      },
      {
        input: '3\noff z q\non z q\nemit z',
        expected_output: 'q',
        is_hidden: true,
      },
    ],
    visibleTests: [
      {
        input: '5\non click a\non click b\nemit click\noff click a\nemit click',
        expected: 'a b\nb',
      },
      {
        input: '2\nemit load\non load x',
        expected: 'NONE',
      },
    ],
    hiddenTests: [
      {
        input: '6\non e h1\non e h1\non e h2\nemit e\noff e h1\nemit e',
        expected: 'h1 h2\nh2',
        category: 'basic',
      },
      {
        input: '4\non a x\non b y\nemit b\nemit a',
        expected: 'y\nx',
        category: 'basic',
      },
      {
        input: '5\non t one\noff t one\nemit t\non t two\nemit t',
        expected: 'NONE\ntwo',
        category: 'basic',
      },
      {
        input: '3\noff z q\non z q\nemit z',
        expected: 'q',
        category: 'basic',
      },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const q = parseInt(lines[0]);

class Emitter {
  constructor() {
    this.handlers = new Map();
  }
  on(event, handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    const list = this.handlers.get(event);
    if (!list.includes(handler)) list.push(handler);
  }
  off(event, handler) {
    const list = this.handlers.get(event);
    if (!list) return;
    this.handlers.set(event, list.filter(h => h !== handler));
  }
  emit(event) {
    return [...(this.handlers.get(event) || [])];
  }
}

const emitter = new Emitter();
for (let i = 1; i <= q; i++) {
  const [cmd, event, handler] = lines[i].trim().split(/\\s+/);
  if (cmd === 'on') emitter.on(event, handler);
  else if (cmd === 'off') emitter.off(event, handler);
  else {
    const called = emitter.emit(event);
    console.log(called.length ? called.join(' ') : 'NONE');
  }
}`,
    explanation: `Keep a Map from event name to an ordered list of handler names. on skips duplicates, off filters the name out, and emit returns a copy of the list.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },

  // q23 · Hard · CODING · Debounce Schedule
  {
    id: 'q23',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Debounce Schedule',
    question_text: `**Problem:**

A debounced function runs only after calls have stopped for \`wait\` milliseconds. Each new call that arrives strictly before the pending run time cancels it and schedules a new run at \`callTime + wait\`. A call that arrives at or after the pending run time does not cancel it (the pending run happens first). Given the call times, find when the function actually runs.

**Input:** the first line contains \`wait\`; the second line contains \`n\`; the third line contains \`n\` call times in increasing order.
**Output:** the times at which the function runs, separated by spaces.`,
    statement: `Simulate the debounce schedule and find when the function actually runs.`,
    inputFormat: 'The first line contains wait; the second line contains n; the third line contains n call times.',
    outputFormat: 'The times at which the function runs, separated by spaces.',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['wait >= 1', '1 <= n <= 10^5'],
    examples: [
      { input: '100\n4\n0 50 120 400', output: '220 500' },
      { input: '100\n2\n0 100', output: '100 200' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const wait = parseInt(lines[0]);
const n = parseInt(lines[1]);
const calls = lines[2].trim().split(/\\s+/).map(Number);
const runs = [];
// TODO: simulate the debounce and push the times the function actually runs into runs
console.log(runs.join(' '));`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const wait = parseInt(lines[0]);
const n = parseInt(lines[1]);
const calls = lines[2].trim().split(/\\s+/).map(Number);
const runs = [];
// TODO: simulate the debounce and push the times the function actually runs into runs
console.log(runs.join(' '));`,
    },
    test_cases: [
      { input: '100\n4\n0 50 120 400', expected_output: '220 500', is_hidden: false },
      { input: '100\n2\n0 100', expected_output: '100 200', is_hidden: false },
      { input: '50\n1\n10', expected_output: '60', is_hidden: true },
      { input: '200\n4\n0 10 20 30', expected_output: '230', is_hidden: true },
      { input: '100\n5\n0 150 250 260 500', expected_output: '100 250 360 600', is_hidden: true },
    ],
    visibleTests: [
      { input: '100\n4\n0 50 120 400', expected: '220 500' },
      { input: '100\n2\n0 100', expected: '100 200' },
    ],
    hiddenTests: [
      { input: '50\n1\n10', expected: '60', category: 'basic' },
      { input: '200\n4\n0 10 20 30', expected: '230', category: 'basic' },
      { input: '100\n5\n0 150 250 260 500', expected: '100 250 360 600', category: 'basic' },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const wait = parseInt(lines[0]);
const n = parseInt(lines[1]);
const calls = lines[2].trim().split(/\\s+/).map(Number);
const runs = [];
let pending = null;
for (const t of calls) {
  if (pending !== null && t >= pending) {
    runs.push(pending);
    pending = null;
  }
  pending = t + wait;
}
if (pending !== null) runs.push(pending);
console.log(runs.join(' '));`,
    explanation: `Track the pending run time. Before handling a call, flush the pending run if the call arrives at or after it; then schedule a new run at t + wait. O(n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },

  // q24 · Hard · CODING · HTML Tag Validator
  {
    id: 'q24',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'HTML Tag Validator',
    question_text: `**Problem:**

Check that the tags in a snippet of HTML are properly nested and closed. Tags look like \`<name>\` and \`</name>\` (lowercase letters and digits, no attributes). The void tags \`br\`, \`img\`, \`hr\` and \`input\` have no closing tag and are ignored. Text between tags can be anything.

**Input:** one line containing the snippet.
**Output:** \`true\` if every opened tag is closed in the correct order, otherwise \`false\`.`,
    statement: `Check that HTML tags are properly nested and closed, ignoring void tags.`,
    inputFormat: 'One line containing the HTML snippet.',
    outputFormat: 'true or false.',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['0 <= html.length <= 10^5'],
    examples: [
      { input: '<div><p>Hi</p></div>', output: 'true' },
      { input: '<div><p></div></p>', output: 'false' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const html = lines[0];
const VOID = new Set(['br', 'img', 'hr', 'input']);
// TODO: use a stack to check that the tags are balanced
console.log(false);`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const html = lines[0];
const VOID = new Set(['br', 'img', 'hr', 'input']);
// TODO: use a stack to check that the tags are balanced
console.log(false);`,
    },
    test_cases: [
      { input: '<div><p>Hi</p></div>', expected_output: 'true', is_hidden: false },
      { input: '<div><p></div></p>', expected_output: 'false', is_hidden: false },
      { input: '<ul><li>A</li><li>B</li></ul>', expected_output: 'true', is_hidden: true },
      { input: '<div><br><img></div>', expected_output: 'true', is_hidden: true },
      { input: '<b><i>text</b></i>', expected_output: 'false', is_hidden: true },
      { input: '<p>unclosed', expected_output: 'false', is_hidden: true },
      { input: '</p>', expected_output: 'false', is_hidden: true },
    ],
    visibleTests: [
      { input: '<div><p>Hi</p></div>', expected: 'true' },
      { input: '<div><p></div></p>', expected: 'false' },
    ],
    hiddenTests: [
      { input: '<ul><li>A</li><li>B</li></ul>', expected: 'true', category: 'basic' },
      { input: '<div><br><img></div>', expected: 'true', category: 'basic' },
      { input: '<b><i>text</b></i>', expected: 'false', category: 'basic' },
      { input: '<p>unclosed', expected: 'false', category: 'basic' },
      { input: '</p>', expected: 'false', category: 'basic' },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const html = lines[0];
const VOID = new Set(['br', 'img', 'hr', 'input']);
const stack = [];
const re = /<(\\/?)([a-z0-9]+)>/g;
let ok = true;
let m;
while ((m = re.exec(html)) !== null) {
  const closing = m[1] === '/';
  const name = m[2];
  if (VOID.has(name)) continue;
  if (!closing) {
    stack.push(name);
  } else if (stack.pop() !== name) {
    ok = false;
    break;
  }
}
console.log(ok && stack.length === 0);`,
    explanation: `Scan the tags with a regular expression: push opening tags, and on a closing tag pop and compare. Balanced only if nothing mismatches and the stack is empty.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.html', 'frontend.javascript'],
  },

  // q25 · Hard · CODING · Flatten an Object
  {
    id: 'q25',
    skill_evaluated: 'Front-end Development',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Flatten an Object',
    question_text: `**Problem:**

Flatten a nested JSON object into a single level. Nested keys are joined with \`.\`, and array items use their index as the key (for example \`a.0\`). Empty objects and empty arrays are kept as values. Keys keep their original order.

**Input:** one line containing a JSON object.
**Output:** the flattened object printed with \`JSON.stringify\` (no spaces).`,
    statement: `Flatten a nested JSON object into a single level with dot-separated keys.`,
    inputFormat: 'One line containing a JSON object.',
    outputFormat: 'The flattened object printed with JSON.stringify (no spaces).',
    rules: ['Node.js standard script execution reading from stdin.'],
    constraints: ['Valid JSON object input.'],
    examples: [
      { input: '{"a":{"b":1,"c":{"d":2}},"e":3}', output: '{"a.b":1,"a.c.d":2,"e":3}' },
      { input: '{"x":[10,20]}', output: '{"x.0":10,"x.1":20}' },
    ],
    language: 'javascript',
    starter_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const obj = JSON.parse(lines[0]);
const result = {};
// TODO: walk obj recursively and fill result with dot-separated keys
console.log(JSON.stringify(result));`,
    starterCode: {
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const obj = JSON.parse(lines[0]);
const result = {};
// TODO: walk obj recursively and fill result with dot-separated keys
console.log(JSON.stringify(result));`,
    },
    test_cases: [
      {
        input: '{"a":{"b":1,"c":{"d":2}},"e":3}',
        expected_output: '{"a.b":1,"a.c.d":2,"e":3}',
        is_hidden: false,
      },
      {
        input: '{"x":[10,20]}',
        expected_output: '{"x.0":10,"x.1":20}',
        is_hidden: false,
      },
      {
        input: '{"a":{"b":[{"c":1},{"d":2}]}}',
        expected_output: '{"a.b.0.c":1,"a.b.1.d":2}',
        is_hidden: true,
      },
      {
        input: '{"k":{},"m":null}',
        expected_output: '{"k":{},"m":null}',
        is_hidden: true,
      },
      {
        input: '{"name":"Ana","address":{"city":"Pune","pin":"411001"}}',
        expected_output: '{"name":"Ana","address.city":"Pune","address.pin":"411001"}',
        is_hidden: true,
      },
      {
        input: '{"a":[]}',
        expected_output: '{"a":[]}',
        is_hidden: true,
      },
    ],
    visibleTests: [
      {
        input: '{"a":{"b":1,"c":{"d":2}},"e":3}',
        expected: '{"a.b":1,"a.c.d":2,"e":3}',
      },
      {
        input: '{"x":[10,20]}',
        expected: '{"x.0":10,"x.1":20}',
      },
    ],
    hiddenTests: [
      {
        input: '{"a":{"b":[{"c":1},{"d":2}]}}',
        expected: '{"a.b.0.c":1,"a.b.1.d":2}',
        category: 'basic',
      },
      {
        input: '{"k":{},"m":null}',
        expected: '{"k":{},"m":null}',
        category: 'basic',
      },
      {
        input: '{"name":"Ana","address":{"city":"Pune","pin":"411001"}}',
        expected: '{"name":"Ana","address.city":"Pune","address.pin":"411001"}',
        category: 'basic',
      },
      {
        input: '{"a":[]}',
        expected: '{"a":[]}',
        category: 'basic',
      },
    ],
    solution_code: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
const obj = JSON.parse(lines[0]);
const result = {};

function walk(value, prefix) {
  if (value !== null && typeof value === 'object' && Object.keys(value).length > 0) {
    for (const key of Object.keys(value)) {
      walk(value[key], prefix ? prefix + '.' + key : key);
    }
  } else {
    result[prefix] = value;
  }
}

walk(obj, '');
console.log(JSON.stringify(result));`,
    explanation: `Recurse into non-empty objects and arrays, building the key path as you go. Anything else (primitives, null, empty containers) is stored under the current path.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['frontend.javascript'],
  },
];

export const FRONTEND_ASSESSMENT: Assessment = {
  id: 'frontend-dev',
  title: 'Front-end Development',
  domain: 'Web Platform, JavaScript & Interface Engineering',
  description: 'HTML semantics and accessibility, CSS layout and specificity, modern JavaScript, the event loop, React basics and browser fundamentals.',
  timeLimitMinutes: 180,
  sections: [
    {
      id: 'A',
      title: 'Easy: 8 questions (6 MCQs + 2 coding)',
      difficulty: 1,
      difficultyLabel: 'Easy',
      weight: 1,
      questions: frontendSectionA,
    },
    {
      id: 'B',
      title: 'Medium: 10 questions (6 MCQs + 4 coding)',
      difficulty: 2,
      difficultyLabel: 'Medium',
      weight: 2,
      questions: frontendSectionB,
    },
    {
      id: 'C',
      title: 'Hard: 7 questions (3 MCQs + 4 coding)',
      difficulty: 3,
      difficultyLabel: 'Hard',
      weight: 3,
      questions: frontendSectionC,
    },
  ],
};
