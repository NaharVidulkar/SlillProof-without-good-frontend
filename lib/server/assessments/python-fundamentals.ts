/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assessment, CodeQuestion, McqQuestion } from './types.ts';
import { PROBLEMS } from '../problems.ts';

// Section A: 5 Easy MCQs
const sectionAMcqs: McqQuestion[] = [
  {
    id: 'a1-types-operators',
    type: 'mcq',
    prompt: 'In Python 3, what is the evaluated result of `(-7 // 2)` and `(-7 % 2)`?',
    options: [
      { id: 'opt_1', text: '`-3` and `-1`' },
      { id: 'opt_2', text: '`-4` and `1`' },
      { id: 'opt_3', text: '`-3.5` and `0`' },
      { id: 'opt_4', text: '`-4` and `-1`' },
    ],
    correctOptionId: 'opt_2',
    explanation: 'Python uses floor division (`//`), which rounds toward negative infinity: -3.5 rounds to -4. The modulo operator satisfies `a = (a // b) * b + (a % b)`, so -7 = (-4 * 2) + 1, resulting in 1.',
    skills: ['py.core'],
  },
  {
    id: 'a2-strings-slicing',
    type: 'mcq',
    prompt: 'Given `s = "SkillProof"`, what does `s[::-2]` evaluate to?',
    options: [
      { id: 'opt_1', text: '"forPk"' },
      { id: 'opt_2', text: '"oorli"' },
      { id: 'opt_3', text: '"foprS"' },
      { id: 'opt_4', text: '"foPli"' },
    ],
    correctOptionId: 'opt_1',
    explanation: 'Negative step `-2` reverses the string starting from the last character index (index 9 "f"), taking every second character: "f", "o", "r", "P", "k".',
    skills: ['py.strings'],
  },
  {
    id: 'a3-collections-operations',
    type: 'mcq',
    prompt: 'What is the key functional difference between `list.append(x)` and `list.extend(x)` when `x = [1, 2]`?',
    options: [
      { id: 'opt_1', text: '`append` adds `[1, 2]` as a single nested element; `extend` unpacks and appends each element individually' },
      { id: 'opt_2', text: '`append` mutates in place, while `extend` returns a new list copy' },
      { id: 'opt_3', text: '`append` accepts only integers, while `extend` accepts iterables' },
      { id: 'opt_4', text: 'They behave identically when invoked on a mutable list' },
    ],
    correctOptionId: 'opt_1',
    explanation: '`list.append([1, 2])` treats the argument as a single object, resulting in `[..., [1, 2]]`. `list.extend([1, 2])` iterates over the collection and appends each item, resulting in `[..., 1, 2]`.',
    skills: ['py.collections'],
  },
  {
    id: 'a4-scope-for-else',
    type: 'mcq',
    prompt: 'When does the `else` clause of a Python `for` loop execute?',
    codeSnippet: `for item in items:
    if condition(item):
        break
else:
    handle_fallback()`,
    options: [
      { id: 'opt_1', text: 'Only when the loop terminates naturally without hitting a `break` statement' },
      { id: 'opt_2', text: 'Whenever an exception occurs inside the loop body' },
      { id: 'opt_3', text: 'After every iteration of the loop' },
      { id: 'opt_4', text: 'Only when `items` is an empty collection' },
    ],
    correctOptionId: 'opt_1',
    explanation: 'The `else` block on a `for` or `while` loop executes if and only if the loop was not prematurely terminated by a `break` statement.',
    skills: ['py.functions', 'py.core'],
  },
  {
    id: 'a5-oop-super',
    type: 'mcq',
    prompt: 'In a subclass method, what does calling `super().__init__(*args, **kwargs)` ensure?',
    options: [
      { id: 'opt_1', text: 'It invokes the parent class initializer following the Method Resolution Order (MRO)' },
      { id: 'opt_2', text: 'It creates a static singleton instance of the base class in global memory' },
      { id: 'opt_3', text: 'It prevents child instances from overriding parent class attributes' },
      { id: 'opt_4', text: 'It overrides the subclass `__dict__` with base class slots' },
    ],
    correctOptionId: 'opt_1',
    explanation: '`super()` delegates method calls to the next class in the instance\'s Method Resolution Order (MRO), allowing cooperative multiple inheritance and clean base class initialization.',
    skills: ['py.oop'],
  },
];

// Section B: 6 Medium MCQs
const sectionBMcqs: McqQuestion[] = [
  {
    id: 'b1-mutable-default-args',
    type: 'mcq',
    prompt: 'Why is defining `def register(user, tags=[])` considered a severe Python anti-pattern?',
    options: [
      { id: 'opt_1', text: 'The default list is instantiated once at function definition time and shared across all calls that omit the argument' },
      { id: 'opt_2', text: 'Python raises a `SyntaxError` at parse time for mutable default arguments' },
      { id: 'opt_3', text: 'Lists cannot be passed into positional parameters by reference' },
      { id: 'opt_4', text: 'Default arguments are automatically converted to frozen sets' },
    ],
    correctOptionId: 'opt_1',
    explanation: 'Default arguments are evaluated once when the function is defined. If a caller mutates `tags`, the mutation persists into subsequent calls that rely on the default.',
    skills: ['py.functions'],
  },
  {
    id: 'b2-copy-semantics',
    type: 'mcq',
    prompt: 'What occurs when using `copy.copy(x)` (shallow copy) on a nested list `x = [[1, 2], [3, 4]]`?',
    options: [
      { id: 'opt_1', text: 'A new outer list is constructed, but its elements reference the exact same inner list objects as `x`' },
      { id: 'opt_2', text: 'Both the outer list and all nested inner lists are duplicated recursively into new memory addresses' },
      { id: 'opt_3', text: 'The nested lists are converted to immutable tuples' },
      { id: 'opt_4', text: 'It performs the exact same operation as `x2 = x`' },
    ],
    correctOptionId: 'opt_1',
    explanation: 'A shallow copy creates a new container object, but populates it with references to the children of the original. Modifying an inner list (`x[0].append(9)`) affects both.',
    skills: ['py.core', 'py.collections'],
  },
  {
    id: 'b3-generators-exhaustion',
    type: 'mcq',
    prompt: 'What happens when you attempt to iterate over a Python generator object a second time after it has yielded all values?',
    options: [
      { id: 'opt_1', text: 'It immediately raises or handles `StopIteration` without yielding any elements, as generators cannot be rewound' },
      { id: 'opt_2', text: 'It resets its internal instruction pointer to zero and replays the sequence' },
      { id: 'opt_3', text: 'It raises an uncatchable `GeneratorExhaustedError`' },
      { id: 'opt_4', text: 'It yields `None` indefinitely' },
    ],
    correctOptionId: 'opt_1',
    explanation: 'Generators are one-time iterators. Once exhausted, subsequent iterations immediately return without producing items. To iterate again, a new generator instance must be created.',
    skills: ['py.iterators'],
  },
  {
    id: 'b4-exceptions-finally',
    type: 'mcq',
    prompt: 'What value does `test_func()` return in the following code?',
    codeSnippet: `def test_func():
    try:
        return 1
    finally:
        return 2`,
    options: [
      { id: 'opt_1', text: '`2`' },
      { id: 'opt_2', text: '`1`' },
      { id: 'opt_3', text: '`None`' },
      { id: 'opt_4', text: 'Raises a `RuntimeError`' },
    ],
    correctOptionId: 'opt_1',
    explanation: 'A `return` statement executed in a `finally` block discards and overrides any active return value or pending unhandled exception from the `try` block.',
    skills: ['py.errors'],
  },
  {
    id: 'b5-decorators-wraps',
    type: 'mcq',
    prompt: 'What is the primary function of `@functools.wraps(func)` inside a custom decorator?',
    options: [
      { id: 'opt_1', text: 'It copies original function metadata (such as `__name__` and `__doc__`) to the wrapper function' },
      { id: 'opt_2', text: 'It forces the wrapped function to execute inside a C thread' },
      { id: 'opt_3', text: 'It automatically catches and suppresses unhandled exceptions' },
      { id: 'opt_4', text: 'It converts the function into a class property' },
    ],
    correctOptionId: 'opt_1',
    explanation: 'Without `@functools.wraps`, decorated functions lose their identity, reporting the wrapper\'s name and docstring instead of the decorated function\'s true introspection data.',
    skills: ['py.functions', 'py.oop'],
  },
  {
    id: 'b6-tooling-type-hints',
    type: 'mcq',
    prompt: 'How are standard PEP 484 type annotations (e.g. `def add(x: int, y: int) -> int:`) enforced by the Python runtime interpreter by default?',
    options: [
      { id: 'opt_1', text: 'They are not enforced at runtime; they serve as metadata for static type checkers like mypy and IDEs' },
      { id: 'opt_2', text: 'Python automatically casts mismatched types to the annotated type' },
      { id: 'opt_3', text: 'Python raises a `TypeError` before entering the function if argument types do not match' },
      { id: 'opt_4', text: 'They are stripped by the compiler and cannot be inspected in `__annotations__`' },
    ],
    correctOptionId: 'opt_1',
    explanation: 'Python remains dynamically typed. Type annotations are purely syntactic and informative at runtime, unless an explicit runtime validation library (like Pydantic) inspects them.',
    skills: ['py.tooling'],
  },
];

// Helper to convert Problem from problems.ts to CodeQuestion
function problemToCodeQuestion(prob: (typeof PROBLEMS)[0], skillsOverride?: string[]): CodeQuestion {
  return {
    id: prob.id,
    type: 'code',
    title: prob.title,
    statement: prob.description,
    inputFormat: 'Standard Input (stdin)',
    outputFormat: 'Standard Output (stdout)',
    rules: prob.constraints,
    constraints: prob.constraints,
    examples: prob.examples.map((ex) => ({
      input: ex.input,
      output: ex.output,
      explanation: ex.note,
    })),
    starterCode: prob.starterCode,
    visibleTests: prob.visibleTests,
    hiddenTests: prob.hiddenTests || [],
    timeLimitMs: prob.timeLimitMs,
    memoryLimitKb: prob.memoryLimitKb,
    skills: skillsOverride || prob.skills,
  };
}

// Section B: 4 Medium Coding Problems
const sectionBCoding: CodeQuestion[] = [
  // B7 Word Frequency Top-K
  {
    id: 'b7-word-frequency',
    type: 'code',
    title: 'Word Frequency Top-K',
    statement: `Given an integer K and a series of text lines, find the top K most frequent case-insensitive words.
Words consist of alphanumeric characters and apostrophes (punctuation stripped).
Output each top word and its count formatted as: "word count".
In the event of frequency ties, sort words in alphabetical (lexicographical) order.`,
    inputFormat: 'Line 1 contains K. Subsequent lines contain text.',
    outputFormat: 'Top K lines: "<word> <count>", sorted by count descending, then word ascending.',
    rules: [
      'Case-insensitive (convert all words to lowercase).',
      'Ties broken alphabetically.',
      'Output strictly truncated under 900 characters.',
    ],
    constraints: ['1 <= K <= 20', 'Total input size <= 100 KB'],
    examples: [
      {
        input: '2\nThe quick brown fox jumps over the lazy dog\nThe fox was quick',
        output: 'the 3\nfox 2',
        explanation: '"the" appears 3 times, "fox" and "quick" appear 2 times (fox comes first alphabetically).',
      },
    ],
    starterCode: {
      python: `import sys
import re
from collections import Counter

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    k = int(lines[0].strip())
    # TODO: Implement Word Frequency Top-K
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: '2\nThe quick brown fox jumps over the lazy dog\nThe fox was quick',
        expected: 'the 3\nfox 2',
      },
      {
        input: '3\napple banana apple orange banana apple',
        expected: 'apple 3\nbanana 2\norange 1',
      },
    ],
    hiddenTests: [
      {
        input: '1\nPython python PYTHON code',
        expected: 'python 3',
        category: 'basic',
      },
      {
        input: '2\na b c d e',
        expected: 'a 1\nb 1',
        category: 'edge case',
      },
      {
        input: '3\ncat dog cat dog elephant bird',
        expected: 'cat 2\ndog 2\nbird 1',
        category: 'edge case',
      },
      {
        input: '2\none two three four one two three one',
        expected: 'one 3\nthree 2',
        category: 'basic',
      },
      {
        input: '4\nz y x w v u t',
        expected: 't 1\nu 1\nv 1\nw 1',
        category: 'edge case',
      },
      {
        input: '5\n' + 'word '.repeat(50),
        expected: 'word 50',
        category: 'performance',
      },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 65536,
    skills: ['py.collections', 'py.strings', 'py.stdlib'],
  },

  // B8 Bracket Validator
  {
    id: 'b8-bracket-validator',
    type: 'code',
    title: 'Bracket Validator',
    statement: `Validate matching brackets in a single line containing '()', '[]', and '{}' mixed with other characters (ignore non-bracket characters).
If valid, print "VALID".
If invalid, print the 1-based position of the first error:
- A closing bracket with no or wrong opener prints its 1-based index in the original string.
- If unclosed openers remain at the end, print the 1-based index of the earliest unmatched opener.`,
    inputFormat: 'A single line of text.',
    outputFormat: 'VALID or the 1-based position integer.',
    rules: [
      'Ignore characters other than ()[]{}',
      'Track 1-based indices in the original raw input string.',
    ],
    constraints: ['String length <= 5000 characters'],
    examples: [
      {
        input: 'def func(x): return [x + {1}]',
        output: 'VALID',
        explanation: 'All openers match their closers in correct order.',
      },
      {
        input: '([)]',
        output: '3',
        explanation: 'At position 3, ")" appears while "[" was expected to close.',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    text = sys.stdin.read().rstrip('\\r\\n')
    # TODO: Implement Bracket Validator
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: 'def func(x): return [x + {1}]',
        expected: 'VALID',
      },
      {
        input: '([)]',
        expected: '3',
      },
    ],
    hiddenTests: [
      {
        input: '()[]{}',
        expected: 'VALID',
        category: 'basic',
      },
      {
        input: ']',
        expected: '1',
        category: 'edge case',
      },
      {
        input: '(',
        expected: '1',
        category: 'edge case',
      },
      {
        input: '((((',
        expected: '1',
        category: 'edge case',
      },
      {
        input: '{[()]}',
        expected: 'VALID',
        category: 'basic',
      },
      {
        input: 'a + (b * c] + d',
        expected: '11',
        category: 'edge case',
      },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 65536,
    skills: ['py.algorithms', 'py.collections'],
  },

  // B9 Run-Length Codec
  {
    id: 'b9-run-length-codec',
    type: 'code',
    title: 'Run-Length Codec',
    statement: `Implement an encoder and decoder.
Each line begins with a command:
- "ENC <text>": Encodes consecutive identical characters (e.g. "aaab" -> "a3b1"). Empty text prints empty.
- "DEC <text>": Decodes run-length text (e.g. "a3b1" -> "aaab").
Invalid DEC input (odd length, non-letter char, count 0, or non-numeric count) prints "ERROR".`,
    inputFormat: 'Multiple lines of commands: "ENC <text>" or "DEC <text>".',
    outputFormat: 'Result string or "ERROR" per line.',
    rules: [
      'ENC handles any single-letter runs.',
      'DEC strictly expects [letter][digit+] pairs with count >= 1.',
    ],
    constraints: ['Lines <= 50', 'Text length <= 500'],
    examples: [
      {
        input: 'ENC aaab\nDEC a3b1',
        output: 'a3b1\naaab',
        explanation: 'Encoding and decoding inverse operations.',
      },
      {
        input: 'DEC a0',
        output: 'ERROR',
        explanation: 'Count 0 is invalid.',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    lines = sys.stdin.read().splitlines()
    # TODO: Implement Run-Length Codec
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: 'ENC aaab\nDEC a3b1',
        expected: 'a3b1\naaab',
      },
      {
        input: 'DEC a0',
        expected: 'ERROR',
      },
    ],
    hiddenTests: [
      {
        input: 'ENC a\nDEC a1',
        expected: 'a1\na',
        category: 'basic',
      },
      {
        input: 'DEC a-1',
        expected: 'ERROR',
        category: 'edge case',
      },
      {
        input: 'DEC 12',
        expected: 'ERROR',
        category: 'edge case',
      },
      {
        input: 'ENC aaaaabbbbb\nDEC a5b5',
        expected: 'a5b5\naaaaabbbbb',
        category: 'basic',
      },
      {
        input: 'DEC abc',
        expected: 'ERROR',
        category: 'edge case',
      },
      {
        input: 'ENC \nDEC ',
        expected: '\n',
        category: 'edge case',
      },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 65536,
    skills: ['py.strings', 'py.errors'],
  },

  // B10 Sensor Readings Summary
  {
    id: 'b10-sensor-summary',
    type: 'code',
    title: 'Sensor Readings Summary',
    statement: `Process noisy sensor input lines.
Rules:
- Blank lines and comment lines (starting with '#') are skipped completely.
- Non-numeric strings count as invalid readings.
- Valid floating point numbers count as valid readings.
Output:
- If no valid readings exist, print "NO DATA".
- Otherwise print:
  "valid=<V> invalid=<I> min=<MIN> max=<MAX> avg=<AVG>"
  where min, max, and avg are formatted to 2 decimal places (round half up).`,
    inputFormat: 'Multiple lines from standard input.',
    outputFormat: 'Single summary line or "NO DATA".',
    rules: [
      'Skip empty lines and lines starting with #.',
      'Format floats to 2 decimal places with round half up.',
    ],
    constraints: ['Lines <= 200'],
    examples: [
      {
        input: '# temperature sensor\n21.5\n22.0\nERR\n20.5',
        output: 'valid=3 invalid=1 min=20.50 max=22.00 avg=21.33',
        explanation: '3 valid floats, 1 ERR invalid string, comments skipped.',
      },
      {
        input: '# all comments\n\n# no data',
        output: 'NO DATA',
        explanation: 'Zero valid readings.',
      },
    ],
    starterCode: {
      python: `import sys
from decimal import Decimal, ROUND_HALF_UP

def main():
    lines = sys.stdin.read().splitlines()
    # TODO: Implement Sensor Readings Summary
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: '# temperature sensor\n21.5\n22.0\nERR\n20.5',
        expected: 'valid=3 invalid=1 min=20.50 max=22.00 avg=21.33',
      },
      {
        input: '# all comments\n\n# no data',
        expected: 'NO DATA',
      },
    ],
    hiddenTests: [
      {
        input: '10.0\n20.0',
        expected: 'valid=2 invalid=0 min=10.00 max=20.00 avg=15.00',
        category: 'basic',
      },
      {
        input: 'BAD\nFAIL\n# test',
        expected: 'NO DATA',
        category: 'edge case',
      },
      {
        input: '-5.25\n5.25\n0',
        expected: 'valid=3 invalid=0 min=-5.25 max=5.25 avg=0.00',
        category: 'basic',
      },
      {
        input: '100.126',
        expected: 'valid=1 invalid=0 min=100.13 max=100.13 avg=100.13',
        category: 'edge case',
      },
      {
        input: '# line 1\nERR\n# line 2\nERR2',
        expected: 'NO DATA',
        category: 'edge case',
      },
      {
        input: '1.0\n'.repeat(50),
        expected: 'valid=50 invalid=0 min=1.00 max=1.00 avg=1.00',
        category: 'performance',
      },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 65536,
    skills: ['py.errors', 'py.core'],
  },
];

// Section C: 10 Hard Real-Life Coding Problems
// We include our 4 verified core problems plus 6 comprehensive real-world scenarios per Section 7 of docs/ASSESSMENT.md
const sectionCCoding: CodeQuestion[] = [
  // C1: Student Registry (Transactional in-memory registry)
  problemToCodeQuestion(PROBLEMS[0], ['py.collections', 'py.core']),

  // C2: Access Log Summary (Log aggregation)
  problemToCodeQuestion(PROBLEMS[1], ['py.strings', 'py.collections']),

  // C3: Rate Limiter (Sliding window queue)
  problemToCodeQuestion(PROBLEMS[2], ['py.algorithms', 'py.stdlib']),

  // C4: Payload Validator (Validation microservice)
  problemToCodeQuestion(PROBLEMS[3], ['py.errors', 'py.strings']),

  // C5: Meeting Room Scheduler (Interval greedy & heap)
  {
    id: 'c5-meeting-scheduler',
    type: 'code',
    title: 'Meeting Room Scheduler',
    statement: `You are allocating meeting rooms for $N$ meetings.
Input:
- Line 1: integer $N$.
- Next $N$ lines: "HH:MM HH:MM" (start and end times, end exclusive), processed strictly in input order.
Assign each meeting to the lowest-numbered room available (rooms numbered 1, 2, 3... created on demand).
Print each meeting's assigned room: "Meeting <index> -> Room <room_id>".
On the final line, print the total number of rooms used: "Total rooms: <count>".`,
    inputFormat: 'Line 1: N. Lines 2..N+1: HH:MM HH:MM.',
    outputFormat: 'N lines "Meeting <i> -> Room <r>", followed by "Total rooms: <k>".',
    rules: [
      'Processed in input order.',
      'Assign to the lowest-numbered free room (1-based).',
      'End time is exclusive (a meeting ending at 10:00 frees room for a meeting starting at 10:00).',
    ],
    constraints: ['1 <= N <= 100', 'Times in 24-hour format HH:MM'],
    examples: [
      {
        input: '3\n09:00 10:00\n09:30 10:30\n10:00 11:00',
        output: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 2\nMeeting 3 -> Room 1\nTotal rooms: 2',
        explanation: 'Meeting 3 starts at 10:00, exactly when Meeting 1 finishes Room 1.',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    n = int(lines[0].strip())
    # TODO: Implement Meeting Room Scheduler
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: '3\n09:00 10:00\n09:30 10:30\n10:00 11:00',
        expected: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 2\nMeeting 3 -> Room 1\nTotal rooms: 2',
      },
      {
        input: '2\n08:00 09:00\n09:00 10:00',
        expected: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 1\nTotal rooms: 1',
      },
      {
        input: '3\n10:00 12:00\n10:00 12:00\n10:00 12:00',
        expected: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 2\nMeeting 3 -> Room 3\nTotal rooms: 3',
      },
    ],
    hiddenTests: [
      {
        input: '1\n09:00 10:00',
        expected: 'Meeting 1 -> Room 1\nTotal rooms: 1',
        category: 'basic',
      },
      {
        input: '4\n09:00 10:00\n09:15 09:45\n09:30 10:30\n10:15 11:00',
        expected: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 2\nMeeting 3 -> Room 3\nMeeting 4 -> Room 1\nTotal rooms: 3',
        category: 'edge case',
      },
      {
        input: '3\n11:00 11:30\n11:30 12:00\n12:00 12:30',
        expected: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 1\nMeeting 3 -> Room 1\nTotal rooms: 1',
        category: 'basic',
      },
      {
        input: '4\n01:00 05:00\n02:00 03:00\n03:00 04:00\n04:00 05:00',
        expected: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 2\nMeeting 3 -> Room 2\nMeeting 4 -> Room 2\nTotal rooms: 2',
        category: 'edge case',
      },
      {
        input: '5\n10:00 11:00\n10:00 11:00\n11:00 12:00\n11:00 12:00\n10:30 11:30',
        expected: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 2\nMeeting 3 -> Room 1\nMeeting 4 -> Room 2\nMeeting 5 -> Room 3\nTotal rooms: 3',
        category: 'edge case',
      },
      {
        input: '6\n09:00 10:00\n09:00 10:00\n09:00 10:00\n10:00 11:00\n10:00 11:00\n10:00 11:00',
        expected: 'Meeting 1 -> Room 1\nMeeting 2 -> Room 2\nMeeting 3 -> Room 3\nMeeting 4 -> Room 1\nMeeting 5 -> Room 2\nMeeting 6 -> Room 3\nTotal rooms: 3',
        category: 'performance',
      },
    ],
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['py.algorithms', 'py.stdlib'],
  },

  // C6: Shopping Cart Pricing Engine
  {
    id: 'c6-cart-pricing',
    type: 'code',
    title: 'Shopping Cart Pricing Engine',
    statement: `Implement an e-commerce cart calculation engine.
Catalog: lines of "CATALOG <item> <price_cents>".
Commands:
- "ADD <item> <qty>"
- "REMOVE <item> <qty>"
- "COUPON <code_or_percent>" (e.g. "PERC 10" for 10% off, "FLAT 500" for $5.00 off).
- "TOTAL": Calculates subtotal, applies bulk item discount (10% off item if qty >= 10), then coupon, rounded half up. Prints total in cents.
Invalid items or negative totals print "ERROR".`,
    inputFormat: 'Multiple lines of commands. Last line is TOTAL.',
    outputFormat: 'Total cents integer or ERROR.',
    rules: [
      'Bulk discount: 10% off item subtotal when qty >= 10.',
      'Coupon applied to order subtotal.',
      'Total cannot be negative (min 0).',
    ],
    constraints: ['Prices in integer cents.'],
    examples: [
      {
        input: 'CATALOG apple 100\nADD apple 5\nTOTAL',
        output: '500',
        explanation: '5 * 100 = 500 cents.',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    lines = sys.stdin.read().splitlines()
    # TODO: Implement Pricing Engine
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: 'CATALOG apple 100\nADD apple 5\nTOTAL',
        expected: '500',
      },
      {
        input: 'CATALOG apple 100\nADD apple 10\nTOTAL',
        expected: '900',
      },
      {
        input: 'ADD unknown 1\nTOTAL',
        expected: 'ERROR',
      },
    ],
    hiddenTests: [
      {
        input: 'CATALOG pen 50\nADD pen 20\nTOTAL',
        expected: '900',
        category: 'basic',
      },
      {
        input: 'CATALOG book 1000\nADD book 2\nREMOVE book 1\nTOTAL',
        expected: '1000',
        category: 'basic',
      },
      {
        input: 'CATALOG book 1000\nADD book 1\nCOUPON FLAT 2000\nTOTAL',
        expected: '0',
        category: 'edge case',
      },
      {
        input: 'CATALOG widget 250\nADD widget 1\nCOUPON PERC 10\nTOTAL',
        expected: '225',
        category: 'basic',
      },
      {
        input: 'CATALOG item 100\nREMOVE item 5\nTOTAL',
        expected: 'ERROR',
        category: 'edge case',
      },
      {
        input: 'CATALOG x 100\nADD x 1\nTOTAL',
        expected: '100',
        category: 'basic',
      },
    ],
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['py.oop', 'py.core', 'py.errors'],
  },

  // C7: LRU Cache Simulator
  {
    id: 'c7-lru-cache',
    type: 'code',
    title: 'LRU Cache Simulator',
    statement: `Design an in-memory Least Recently Used (LRU) Cache.
Input:
- Line 1: integer Capacity C.
- Next lines: "PUT <key> <val>" or "GET <key>".
Rules:
- GET <key>: Prints val if present; otherwise prints -1. Marks key as most recently used.
- PUT <key> <val>: Updates value if present; otherwise inserts. If cache exceeds capacity C, evicts least recently used key.
- Final command: "DUMP": Prints all remaining keys from most recently used to least recently used, space-separated, or "EMPTY".`,
    inputFormat: 'Line 1: capacity. Following lines: PUT/GET/DUMP.',
    outputFormat: 'Results of GET per line, then final DUMP line.',
    rules: [
      'Both GET and PUT count as usage.',
      'Evict the least recently used key on capacity overflow.',
    ],
    constraints: ['1 <= C <= 1000', 'Commands <= 100'],
    examples: [
      {
        input: '2\nPUT a 1\nPUT b 2\nGET a\nPUT c 3\nGET b\nDUMP',
        output: '1\n-1\nc a',
        explanation: 'At PUT c, b is evicted because a was accessed by GET.',
      },
    ],
    starterCode: {
      python: `import sys
from collections import OrderedDict

def main():
    lines = sys.stdin.read().splitlines()
    # TODO: Implement LRU Cache
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: '2\nPUT a 1\nPUT b 2\nGET a\nPUT c 3\nGET b\nDUMP',
        expected: '1\n-1\nc a',
      },
      {
        input: '1\nPUT k 10\nGET k\nDUMP',
        expected: '10\nk',
      },
      {
        input: '2\nDUMP',
        expected: 'EMPTY',
      },
    ],
    hiddenTests: [
      {
        input: '2\nPUT x 1\nPUT y 2\nPUT x 3\nDUMP',
        expected: 'x y',
        category: 'basic',
      },
      {
        input: '1\nPUT a 1\nPUT b 2\nGET a\nDUMP',
        expected: '-1\nb',
        category: 'edge case',
      },
      {
        input: '3\nPUT a 1\nPUT b 2\nPUT c 3\nGET a\nGET b\nDUMP',
        expected: '1\n2\nb a c',
        category: 'basic',
      },
      {
        input: '2\nGET none\nDUMP',
        expected: '-1\nEMPTY',
        category: 'edge case',
      },
      {
        input: '2\nPUT a 1\nPUT b 2\nPUT a 1\nPUT c 3\nDUMP',
        expected: 'c a',
        category: 'basic',
      },
      {
        input: '3\nPUT 1 1\nPUT 2 2\nPUT 3 3\nPUT 4 4\nDUMP',
        expected: '4 3 2',
        category: 'performance',
      },
    ],
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['py.collections', 'py.oop'],
  },

  // C8: Document Search Index
  {
    id: 'c8-search-index',
    type: 'code',
    title: 'Document Search Index',
    statement: `Build an in-memory inverted document search index.
Input format:
- Lines "DOC <id> <text>" index documents. Tokens are lowercased alphanumeric words.
- Lines "QUERY <boolean_expr>" perform searches.
Queries combine terms with "AND", "OR", "NOT" operators with strict precedence: NOT > AND > OR.
Print matching document IDs in ascending order, space-separated, or "NONE".`,
    inputFormat: 'Multiple DOC lines, followed by QUERY lines.',
    outputFormat: 'Sorted IDs space-separated or NONE per query.',
    rules: [
      'Tokenization: regex [a-z0-9]+ lowercased.',
      'Precedence: NOT evaluated first, then AND, then OR.',
    ],
    constraints: ['Docs <= 50', 'Queries <= 20'],
    examples: [
      {
        input: 'DOC 1 python backend service\nDOC 2 java backend enterprise\nDOC 3 python data science\nQUERY python AND backend\nQUERY python NOT service',
        output: '1\n3',
        explanation: 'Query 1 matches doc 1. Query 2 matches doc 3 (python without service).',
      },
    ],
    starterCode: {
      python: `import sys
import re

def main():
    lines = sys.stdin.read().splitlines()
    # TODO: Implement Search Index
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: 'DOC 1 python backend service\nDOC 2 java backend enterprise\nDOC 3 python data science\nQUERY python AND backend\nQUERY python NOT service',
        expected: '1\n3',
      },
      {
        input: 'DOC 10 hello world\nQUERY missing',
        expected: 'NONE',
      },
      {
        input: 'DOC 1 a b\nDOC 2 b c\nQUERY a OR c',
        expected: '1 2',
      },
    ],
    hiddenTests: [
      {
        input: 'DOC 1 test\nQUERY test',
        expected: '1',
        category: 'basic',
      },
      {
        input: 'DOC 1 cat dog\nDOC 2 dog\nQUERY dog NOT cat',
        expected: '2',
        category: 'basic',
      },
      {
        input: 'DOC 5 alpha beta\nQUERY alpha AND beta',
        expected: '5',
        category: 'basic',
      },
      {
        input: 'DOC 1 x\nDOC 2 y\nDOC 3 z\nQUERY x OR y OR z',
        expected: '1 2 3',
        category: 'basic',
      },
      {
        input: 'DOC 1 none\nQUERY NOT none',
        expected: 'NONE',
        category: 'edge case',
      },
      {
        input: 'DOC 1 a b c\nDOC 2 a c d\nQUERY a AND c NOT d',
        expected: '1',
        category: 'edge case',
      },
    ],
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['py.stdlib', 'py.strings'],
  },

  // C9: Bank Statement Reconciler
  {
    id: 'c9-bank-reconciler',
    type: 'code',
    title: 'Bank Statement Reconciler',
    statement: `Process transactional ledger lines:
- "DEPOSIT <acct> <amt>"
- "WITHDRAW <acct> <amt>"
- "TRANSFER <from_acct> <to_acct> <amt>"
Amounts are positive decimal strings (use integer cents).
Reject malformed operations: non-positive amounts (ERR_AMT), overdrafts below 0 (ERR_OVERDRAFT), or missing accounts on withdrawal/transfer (ERR_ACCT).
Output:
Final non-zero account balances sorted alphabetically by account name: "<acct> <balance_dollars.cents>", followed by rejected transaction count: "REJECTED <count>".`,
    inputFormat: 'Ledger lines from standard input.',
    outputFormat: 'Sorted account balances, followed by REJECTED line.',
    rules: [
      'Cent-accurate decimal calculations.',
      'No overdraft allowed.',
      'Sort account names alphabetically.',
    ],
    constraints: ['Transactions <= 100'],
    examples: [
      {
        input: 'DEPOSIT Alice 100.00\nDEPOSIT Bob 50.00\nTRANSFER Alice Bob 30.00\nWITHDRAW Bob 100.00',
        output: 'Alice 70.00\nBob 80.00\nREJECTED 1',
        explanation: 'Bob withdrawing 100 exceeds his balance of 80 and is rejected.',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    lines = sys.stdin.read().splitlines()
    # TODO: Implement Bank Statement Reconciler
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: 'DEPOSIT Alice 100.00\nDEPOSIT Bob 50.00\nTRANSFER Alice Bob 30.00\nWITHDRAW Bob 100.00',
        expected: 'Alice 70.00\nBob 80.00\nREJECTED 1',
      },
      {
        input: 'DEPOSIT Charlie 25.50\nWITHDRAW Charlie 25.50',
        expected: 'REJECTED 0',
      },
      {
        input: 'WITHDRAW Unknown 10.00',
        expected: 'REJECTED 1',
      },
    ],
    hiddenTests: [
      {
        input: 'DEPOSIT A 10.00\nDEPOSIT B 20.00',
        expected: 'A 10.00\nB 20.00\nREJECTED 0',
        category: 'basic',
      },
      {
        input: 'DEPOSIT A -5.00',
        expected: 'REJECTED 1',
        category: 'edge case',
      },
      {
        input: 'DEPOSIT A 10.00\nTRANSFER A B 15.00',
        expected: 'A 10.00\nREJECTED 1',
        category: 'edge case',
      },
      {
        input: 'DEPOSIT A 0.01\nWITHDRAW A 0.01',
        expected: 'REJECTED 0',
        category: 'basic',
      },
      {
        input: 'TRANSFER A B 10.00',
        expected: 'REJECTED 1',
        category: 'edge case',
      },
      {
        input: 'DEPOSIT Z 50.00\nDEPOSIT A 50.00',
        expected: 'A 50.00\nZ 50.00\nREJECTED 0',
        category: 'basic',
      },
    ],
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['py.stdlib', 'py.errors'],
  },

  // C10: Task Dependency Scheduler
  {
    id: 'c10-task-scheduler',
    type: 'code',
    title: 'Task Dependency Scheduler',
    statement: `Schedule build tasks with prerequisites.
Input:
- Line 1: integer $N$ (number of tasks).
- Next $N$ lines: "<task_name> <duration_sec>".
- Next line: integer $M$ (number of dependencies).
- Next $M$ lines: "<prereq> -> <dependent>" (prereq must finish before dependent can start).
Output:
If a dependency cycle exists, print "CYCLE".
Otherwise print:
1. The lexicographically smallest valid topological task order, space-separated.
2. The minimum total completion time assuming unlimited parallel workers: "Total time: <T>s".`,
    inputFormat: 'Tasks with durations, followed by dependencies.',
    outputFormat: 'Topological order line, then "Total time: <T>s" or "CYCLE".',
    rules: [
      'Topological sort with tie-breaking: pick lexicographically smallest available task first.',
      'Critical path time: longest path through DAG.',
    ],
    constraints: ['1 <= N <= 50', 'Durations in positive integers.'],
    examples: [
      {
        input: '3\nbuild 10\ntest 5\ndeploy 2\n2\nbuild -> test\ntest -> deploy',
        output: 'build test deploy\nTotal time: 17s',
        explanation: 'Linear dependency: 10 + 5 + 2 = 17 seconds.',
      },
      {
        input: '2\na 5\nb 5\n2\na -> b\nb -> a',
        output: 'CYCLE',
        explanation: 'Circular dependency detected.',
      },
    ],
    starterCode: {
      python: `import sys
import heapq

def main():
    lines = sys.stdin.read().splitlines()
    # TODO: Implement Task Dependency Scheduler
    
if __name__ == '__main__':
    main()`,
    },
    visibleTests: [
      {
        input: '3\nbuild 10\ntest 5\ndeploy 2\n2\nbuild -> test\ntest -> deploy',
        expected: 'build test deploy\nTotal time: 17s',
      },
      {
        input: '2\na 5\nb 5\n2\na -> b\nb -> a',
        expected: 'CYCLE',
      },
      {
        input: '2\nb 10\na 10\n0',
        expected: 'a b\nTotal time: 10s',
      },
    ],
    hiddenTests: [
      {
        input: '1\ncompile 3\n0',
        expected: 'compile\nTotal time: 3s',
        category: 'basic',
      },
      {
        input: '3\na 5\nb 10\nc 2\n1\na -> c',
        expected: 'a b c\nTotal time: 10s',
        category: 'basic',
      },
      {
        input: '3\na 1\nb 1\nc 1\n3\na -> b\nb -> c\nc -> a',
        expected: 'CYCLE',
        category: 'edge case',
      },
      {
        input: '4\na 2\nb 4\nc 6\nd 8\n3\na -> d\nb -> d\nc -> d',
        expected: 'a b c d\nTotal time: 14s',
        category: 'basic',
      },
      {
        input: '2\nx 1\ny 2\n1\nx -> y',
        expected: 'x y\nTotal time: 3s',
        category: 'basic',
      },
      {
        input: '4\nz 1\ny 1\nx 1\nw 1\n0',
        expected: 'w x y z\nTotal time: 1s',
        category: 'performance',
      },
    ],
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['py.algorithms', 'py.stdlib'],
  },
];

export const PYTHON_FUNDAMENTALS_ASSESSMENT: Assessment = {
  id: 'python-fundamentals',
  title: 'Python',
  domain: 'Python Engineering & System Architecture',
  description: 'Evidence-based verification of core Python internals, data structures, algorithms, and real-life systems.',
  timeLimitMinutes: 180,
  sections: [
    {
      id: 'A',
      title: 'Easy: 5 MCQs',
      difficulty: 1,
      difficultyLabel: 'Easy',
      weight: 1,
      questions: sectionAMcqs,
    },
    {
      id: 'B',
      title: 'Medium: 10 questions (6 MCQs + 4 coding)',
      difficulty: 2,
      difficultyLabel: 'Medium',
      weight: 2,
      questions: [...sectionBMcqs, ...sectionBCoding],
    },
    {
      id: 'C',
      title: 'Hard: 10 real-life coding problems',
      difficulty: 3,
      difficultyLabel: 'Hard',
      weight: 3,
      questions: sectionCCoding,
    },
  ],
};
