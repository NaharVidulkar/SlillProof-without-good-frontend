/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assessment, CodeQuestion, McqQuestion } from './types.ts';

// -------------------------------------------------------------
// SECTION A: Easy (q01 to q08) - 6 MCQs + 2 CODING (Weight 1)
// -------------------------------------------------------------

export const dsaSectionA: (McqQuestion | CodeQuestion)[] = [
  // q01 · Easy · MCQ
  {
    id: 'q01',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the time complexity of reading an array element by its index?`,
    prompt: `What is the time complexity of reading an array element by its index?`,
    mcq_options: [
      'A. O(1)',
      'B. O(n)',
      'C. O(log n)',
      'D. O(n log n)',
    ],
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(n)' },
      { id: 'C', text: 'O(log n)' },
      { id: 'D', text: 'O(n log n)' },
    ],
    correct_answer: 'A. O(1)',
    correctOptionId: 'A',
    explanation: `Arrays are stored contiguously, so the address of any element is computed directly from its index.`,
    skills: ['dsa.arrays'],
  },

  // q02 · Easy · MCQ
  {
    id: 'q02',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which data structure follows the Last In, First Out (LIFO) principle?`,
    prompt: `Which data structure follows the Last In, First Out (LIFO) principle?`,
    mcq_options: [
      'A. Stack',
      'B. Hash table',
      'C. Queue',
      'D. Linked list',
    ],
    options: [
      { id: 'A', text: 'Stack' },
      { id: 'B', text: 'Hash table' },
      { id: 'C', text: 'Queue' },
      { id: 'D', text: 'Linked list' },
    ],
    correct_answer: 'A. Stack',
    correctOptionId: 'A',
    explanation: `In a stack the most recently pushed element is the first one popped.`,
    skills: ['dsa.stacks'],
  },

  // q03 · Easy · MCQ
  {
    id: 'q03',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the time complexity of binary search on a sorted array of n elements?`,
    prompt: `What is the time complexity of binary search on a sorted array of n elements?`,
    mcq_options: [
      'A. O(n log n)',
      'B. O(1)',
      'C. O(n)',
      'D. O(log n)',
    ],
    options: [
      { id: 'A', text: 'O(n log n)' },
      { id: 'B', text: 'O(1)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(log n)' },
    ],
    correct_answer: 'D. O(log n)',
    correctOptionId: 'D',
    explanation: `Each comparison halves the remaining search range, so about log2(n) steps are needed.`,
    skills: ['dsa.searching'],
  },

  // q04 · Easy · MCQ
  {
    id: 'q04',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which data structure follows the First In, First Out (FIFO) principle?`,
    prompt: `Which data structure follows the First In, First Out (FIFO) principle?`,
    mcq_options: [
      'A. Binary search tree',
      'B. Queue',
      'C. Stack',
      'D. Heap',
    ],
    options: [
      { id: 'A', text: 'Binary search tree' },
      { id: 'B', text: 'Queue' },
      { id: 'C', text: 'Stack' },
      { id: 'D', text: 'Heap' },
    ],
    correct_answer: 'B. Queue',
    correctOptionId: 'B',
    explanation: `In a queue the element added first is the first one removed.`,
    skills: ['dsa.queues'],
  },

  // q05 · Easy · MCQ
  {
    id: 'q05',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the worst-case time complexity of linear search in an array of n elements?`,
    prompt: `What is the worst-case time complexity of linear search in an array of n elements?`,
    mcq_options: [
      'A. O(1)',
      'B. O(n)',
      'C. O(n^2)',
      'D. O(log n)',
    ],
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(n)' },
      { id: 'C', text: 'O(n^2)' },
      { id: 'D', text: 'O(log n)' },
    ],
    correct_answer: 'B. O(n)',
    correctOptionId: 'B',
    explanation: `In the worst case the target is last or absent, so every element must be checked.`,
    skills: ['dsa.searching'],
  },

  // q06 · Easy · MCQ
  {
    id: 'q06',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the average time complexity of looking up a key in a hash table?`,
    prompt: `What is the average time complexity of looking up a key in a hash table?`,
    mcq_options: [
      'A. O(n log n)',
      'B. O(n)',
      'C. O(1)',
      'D. O(log n)',
    ],
    options: [
      { id: 'A', text: 'O(n log n)' },
      { id: 'B', text: 'O(n)' },
      { id: 'C', text: 'O(1)' },
      { id: 'D', text: 'O(log n)' },
    ],
    correct_answer: 'C. O(1)',
    correctOptionId: 'C',
    explanation: `A good hash function spreads keys evenly, so a lookup takes constant time on average.`,
    skills: ['dsa.hashing'],
  },

  // q07 · Easy · CODING · Two Sum
  {
    id: 'q07',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question_type: 'CODING',
    type: 'code',
    title: 'Two Sum',
    question_text: `**Problem:**

Given an array of integers and a target, find the two different positions whose values add up to the target. Exactly one such pair exists.

**Input:** the first line contains \`n\`; the second line contains \`n\` integers; the third line contains the target.
**Output:** the two zero-based indices \`i j\` with \`i < j\`, separated by a space.`,
    statement: `Given an array of integers and a target, find the two different positions whose values add up to the target.`,
    inputFormat: 'The first line contains n; the second line contains n integers; the third line contains the target.',
    outputFormat: 'The two zero-based indices i j with i < j, separated by a space.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['2 <= n <= 10^5', 'Exactly one valid pair exists.'],
    examples: [
      { input: '4\n2 7 11 15\n9', output: '0 1' },
      { input: '3\n3 2 4\n6', output: '1 2' },
    ],
    language: 'python',
    starter_code: `import sys

def two_sum(nums, target):
    # TODO: return a tuple (i, j) with i < j
    return (0, 0)

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
target = int(data[1 + n])
i, j = two_sum(nums, target)
print(i, j)`,
    starterCode: {
      python: `import sys

def two_sum(nums, target):
    # TODO: return a tuple (i, j) with i < j
    return (0, 0)

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
target = int(data[1 + n])
i, j = two_sum(nums, target)
print(i, j)`,
    },
    test_cases: [
      { input: '4\n2 7 11 15\n9', expected_output: '0 1', is_hidden: false },
      { input: '3\n3 2 4\n6', expected_output: '1 2', is_hidden: false },
      { input: '2\n3 3\n6', expected_output: '0 1', is_hidden: true },
      { input: '5\n-1 -2 -3 -4 -5\n-8', expected_output: '2 4', is_hidden: true },
      { input: '6\n1 5 9 14 20 3\n34', expected_output: '3 4', is_hidden: true },
    ],
    visibleTests: [
      { input: '4\n2 7 11 15\n9', expected: '0 1' },
      { input: '3\n3 2 4\n6', expected: '1 2' },
    ],
    hiddenTests: [
      { input: '2\n3 3\n6', expected: '0 1', category: 'basic' },
      { input: '5\n-1 -2 -3 -4 -5\n-8', expected: '2 4', category: 'basic' },
      { input: '6\n1 5 9 14 20 3\n34', expected: '3 4', category: 'basic' },
    ],
    solution_code: `import sys

def two_sum(nums, target):
    seen = {}
    for idx, v in enumerate(nums):
        if target - v in seen:
            return (seen[target - v], idx)
        seen[v] = idx
    return (0, 0)

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
target = int(data[1 + n])
i, j = two_sum(nums, target)
print(i, j)`,
    explanation: `Store each value's index in a hash map and look up the complement \`target - v\` as you go. O(n) time, O(n) space.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.arrays', 'dsa.hashing'],
  },

  // q08 · Easy · CODING · Valid Anagram
  {
    id: 'q08',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Easy',
    question_type: 'CODING',
    type: 'code',
    title: 'Valid Anagram',
    question_text: `**Problem:**

Check whether the second string is an anagram of the first, meaning it uses exactly the same letters with the same counts.

**Input:** two lines, \`s\` and \`t\`.
**Output:** \`true\` or \`false\`.`,
    statement: `Check whether the second string is an anagram of the first.`,
    inputFormat: 'Two lines, s and t.',
    outputFormat: 'true or false.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= len(s), len(t) <= 10^5'],
    examples: [
      { input: 'listen\nsilent', output: 'true' },
      { input: 'rat\ncar', output: 'false' },
    ],
    language: 'python',
    starter_code: `s = input().strip()
t = input().strip()
# TODO: decide whether t is an anagram of s
print("false")`,
    starterCode: {
      python: `s = input().strip()
t = input().strip()
# TODO: decide whether t is an anagram of s
print("false")`,
    },
    test_cases: [
      { input: 'listen\nsilent', expected_output: 'true', is_hidden: false },
      { input: 'rat\ncar', expected_output: 'false', is_hidden: false },
      { input: 'a\na', expected_output: 'true', is_hidden: true },
      { input: 'aabb\nabab', expected_output: 'true', is_hidden: true },
      { input: 'abc\nabcc', expected_output: 'false', is_hidden: true },
    ],
    visibleTests: [
      { input: 'listen\nsilent', expected: 'true' },
      { input: 'rat\ncar', expected: 'false' },
    ],
    hiddenTests: [
      { input: 'a\na', expected: 'true', category: 'basic' },
      { input: 'aabb\nabab', expected: 'true', category: 'basic' },
      { input: 'abc\nabcc', expected: 'false', category: 'basic' },
    ],
    solution_code: `s = input().strip()
t = input().strip()
print("true" if sorted(s) == sorted(t) else "false")`,
    explanation: `Two strings are anagrams when their sorted characters are identical (or their letter counts match). O(n log n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.strings', 'dsa.hashing'],
  },
];

// -------------------------------------------------------------
// SECTION B: Medium (q09 to q18) - 6 MCQs + 4 CODING (Weight 2)
// -------------------------------------------------------------

export const dsaSectionB: (McqQuestion | CodeQuestion)[] = [
  // q09 · Medium · MCQ
  {
    id: 'q09',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which traversal of a binary search tree visits the nodes in ascending sorted order?`,
    prompt: `Which traversal of a binary search tree visits the nodes in ascending sorted order?`,
    mcq_options: [
      'A. In-order (left, node, right)',
      'B. Post-order (left, right, node)',
      'C. Level-order',
      'D. Pre-order (node, left, right)',
    ],
    options: [
      { id: 'A', text: 'In-order (left, node, right)' },
      { id: 'B', text: 'Post-order (left, right, node)' },
      { id: 'C', text: 'Level-order' },
      { id: 'D', text: 'Pre-order (node, left, right)' },
    ],
    correct_answer: 'A. In-order (left, node, right)',
    correctOptionId: 'A',
    explanation: `In a BST every left value is smaller and every right value is larger, so in-order traversal produces the keys in sorted order.`,
    skills: ['dsa.trees'],
  },

  // q10 · Medium · MCQ
  {
    id: 'q10',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the worst-case time complexity of merge sort?`,
    prompt: `What is the worst-case time complexity of merge sort?`,
    mcq_options: [
      'A. O(n)',
      'B. O(log n)',
      'C. O(n log n)',
      'D. O(n^2)',
    ],
    options: [
      { id: 'A', text: 'O(n)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n log n)' },
      { id: 'D', text: 'O(n^2)' },
    ],
    correct_answer: 'C. O(n log n)',
    correctOptionId: 'C',
    explanation: `Merge sort always splits the array in halves (log n levels) and merges each level in O(n), giving O(n log n) in every case.`,
    skills: ['dsa.sorting'],
  },

  // q11 · Medium · MCQ
  {
    id: 'q11',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which data structure does breadth-first search (BFS) use to visit nodes level by level?`,
    prompt: `Which data structure does breadth-first search (BFS) use to visit nodes level by level?`,
    mcq_options: [
      'A. Queue',
      'B. Stack',
      'C. Heap',
      'D. Hash set',
    ],
    options: [
      { id: 'A', text: 'Queue' },
      { id: 'B', text: 'Stack' },
      { id: 'C', text: 'Heap' },
      { id: 'D', text: 'Hash set' },
    ],
    correct_answer: 'A. Queue',
    correctOptionId: 'A',
    explanation: `A queue processes nodes in the order they were discovered, which gives level-by-level order.`,
    skills: ['dsa.graphs'],
  },

  // q12 · Medium · MCQ
  {
    id: 'q12',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `How much call-stack space does a simple recursive factorial(n) use?`,
    prompt: `How much call-stack space does a simple recursive factorial(n) use?`,
    mcq_options: [
      'A. O(log n)',
      'B. O(n^2)',
      'C. O(1)',
      'D. O(n)',
    ],
    options: [
      { id: 'A', text: 'O(log n)' },
      { id: 'B', text: 'O(n^2)' },
      { id: 'C', text: 'O(1)' },
      { id: 'D', text: 'O(n)' },
    ],
    correct_answer: 'D. O(n)',
    correctOptionId: 'D',
    explanation: `Each pending call stays on the stack until the base case returns, so the depth, and the space, grows linearly with n.`,
    skills: ['dsa.recursion'],
  },

  // q13 · Medium · MCQ
  {
    id: 'q13',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the time complexity of inserting an element into a binary heap that holds n elements?`,
    prompt: `What is the time complexity of inserting an element into a binary heap that holds n elements?`,
    mcq_options: [
      'A. O(1)',
      'B. O(n)',
      'C. O(log n)',
      'D. O(n log n)',
    ],
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(n)' },
      { id: 'C', text: 'O(log n)' },
      { id: 'D', text: 'O(n log n)' },
    ],
    correct_answer: 'C. O(log n)',
    correctOptionId: 'C',
    explanation: `The new element is added at the bottom and sifted up at most the height of the tree, which is about log n levels.`,
    skills: ['dsa.heaps'],
  },

  // q14 · Medium · MCQ
  {
    id: 'q14',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which of these sorting algorithms is stable (equal elements keep their original relative order)?`,
    prompt: `Which of these sorting algorithms is stable (equal elements keep their original relative order)?`,
    mcq_options: [
      'A. Typical in-place quick sort',
      'B. Heap sort',
      'C. Merge sort',
      'D. Selection sort',
    ],
    options: [
      { id: 'A', text: 'Typical in-place quick sort' },
      { id: 'B', text: 'Heap sort' },
      { id: 'C', text: 'Merge sort' },
      { id: 'D', text: 'Selection sort' },
    ],
    correct_answer: 'C. Merge sort',
    correctOptionId: 'C',
    explanation: `Merge sort can be written to preserve the order of equal elements. Heap sort, selection sort and standard quick sort can reorder them.`,
    skills: ['dsa.sorting'],
  },

  // q15 · Medium · CODING · Reverse a Linked List
  {
    id: 'q15',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Reverse a Linked List',
    question_text: `**Problem:**

Reverse a singly linked list and print the values of the reversed list.

**Input:** the first line contains \`n\` (at least 1); the second line contains \`n\` integers, the list values from head to tail.
**Output:** the values of the reversed list, separated by spaces.`,
    statement: `Reverse a singly linked list and print the values of the reversed list.`,
    inputFormat: 'The first line contains n (at least 1); the second line contains n integers.',
    outputFormat: 'The values of the reversed list, separated by spaces.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= n <= 10^5'],
    examples: [
      { input: '5\n1 2 3 4 5', output: '5 4 3 2 1' },
      { input: '1\n7', output: '7' },
    ],
    language: 'python',
    starter_code: `import sys

class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt

def reverse_list(head):
    # TODO: reverse the list and return the new head
    return head

data = sys.stdin.read().split()
n = int(data[0])
head = None
for v in reversed(data[1:1 + n]):
    head = ListNode(int(v), head)
node = reverse_list(head)
out = []
while node:
    out.append(str(node.val))
    node = node.next
print(" ".join(out))`,
    starterCode: {
      python: `import sys

class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt

def reverse_list(head):
    # TODO: reverse the list and return the new head
    return head

data = sys.stdin.read().split()
n = int(data[0])
head = None
for v in reversed(data[1:1 + n]):
    head = ListNode(int(v), head)
node = reverse_list(head)
out = []
while node:
    out.append(str(node.val))
    node = node.next
print(" ".join(out))`,
    },
    test_cases: [
      { input: '5\n1 2 3 4 5', expected_output: '5 4 3 2 1', is_hidden: false },
      { input: '1\n7', expected_output: '7', is_hidden: false },
      { input: '2\n1 2', expected_output: '2 1', is_hidden: true },
      { input: '4\n-1 0 -1 9', expected_output: '9 -1 0 -1', is_hidden: true },
      { input: '3\n10 20 30', expected_output: '30 20 10', is_hidden: true },
    ],
    visibleTests: [
      { input: '5\n1 2 3 4 5', expected: '5 4 3 2 1' },
      { input: '1\n7', expected: '7' },
    ],
    hiddenTests: [
      { input: '2\n1 2', expected: '2 1', category: 'basic' },
      { input: '4\n-1 0 -1 9', expected: '9 -1 0 -1', category: 'basic' },
      { input: '3\n10 20 30', expected: '30 20 10', category: 'basic' },
    ],
    solution_code: `import sys

class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt

def reverse_list(head):
    prev = None
    cur = head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev

data = sys.stdin.read().split()
n = int(data[0])
head = None
for v in reversed(data[1:1 + n]):
    head = ListNode(int(v), head)
node = reverse_list(head)
out = []
while node:
    out.append(str(node.val))
    node = node.next
print(" ".join(out))`,
    explanation: `Walk the list once, pointing each node's \`next\` to the previous node. O(n) time, O(1) extra space.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.linkedlists'],
  },

  // q16 · Medium · CODING · First Occurrence in a Sorted Array
  {
    id: 'q16',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'First Occurrence in a Sorted Array',
    question_text: `**Problem:**

Given a sorted array that may contain duplicates, find the index of the first occurrence of a target value using binary search, or -1 if it is not present.

**Input:** the first line contains \`n\`; the second line contains \`n\` sorted integers; the third line contains the target.
**Output:** the zero-based index of the first occurrence, or \`-1\`.`,
    statement: `Find the index of the first occurrence of a target value in a sorted array using binary search.`,
    inputFormat: 'The first line contains n; the second line contains n sorted integers; the third line contains the target.',
    outputFormat: 'The zero-based index of the first occurrence, or -1.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= n <= 10^5'],
    examples: [
      { input: '7\n1 2 2 2 3 4 5\n2', output: '1' },
      { input: '5\n1 3 5 7 9\n4', output: '-1' },
    ],
    language: 'python',
    starter_code: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
target = int(data[1 + n])
# TODO: binary search for the FIRST index of target, or -1
print(-1)`,
    starterCode: {
      python: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
target = int(data[1 + n])
# TODO: binary search for the FIRST index of target, or -1
print(-1)`,
    },
    test_cases: [
      { input: '7\n1 2 2 2 3 4 5\n2', expected_output: '1', is_hidden: false },
      { input: '5\n1 3 5 7 9\n4', expected_output: '-1', is_hidden: false },
      { input: '1\n5\n5', expected_output: '0', is_hidden: true },
      { input: '6\n2 2 2 2 2 2\n2', expected_output: '0', is_hidden: true },
      { input: '4\n1 2 3 4\n4', expected_output: '3', is_hidden: true },
      { input: '3\n1 2 3\n0', expected_output: '-1', is_hidden: true },
    ],
    visibleTests: [
      { input: '7\n1 2 2 2 3 4 5\n2', expected: '1' },
      { input: '5\n1 3 5 7 9\n4', expected: '-1' },
    ],
    hiddenTests: [
      { input: '1\n5\n5', expected: '0', category: 'basic' },
      { input: '6\n2 2 2 2 2 2\n2', expected: '0', category: 'basic' },
      { input: '4\n1 2 3 4\n4', expected: '3', category: 'basic' },
      { input: '3\n1 2 3\n0', expected: '-1', category: 'basic' },
    ],
    solution_code: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
target = int(data[1 + n])
lo, hi = 0, n
while lo < hi:
    mid = (lo + hi) // 2
    if nums[mid] < target:
        lo = mid + 1
    else:
        hi = mid
print(lo if lo < n and nums[lo] == target else -1)`,
    explanation: `Run a lower-bound binary search that keeps moving left while the middle value is not smaller than the target. O(log n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.searching', 'dsa.arrays'],
  },

  // q17 · Medium · CODING · Maximum Subarray Sum
  {
    id: 'q17',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Maximum Subarray Sum',
    question_text: `**Problem:**

Find the largest possible sum of a contiguous, non-empty subarray.

**Input:** the first line contains \`n\`; the second line contains \`n\` integers (they may be negative).
**Output:** a single integer, the maximum subarray sum.`,
    statement: `Find the largest possible sum of a contiguous, non-empty subarray.`,
    inputFormat: 'The first line contains n; the second line contains n integers.',
    outputFormat: 'A single integer, the maximum subarray sum.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= n <= 10^5'],
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6' },
      { input: '1\n-5', output: '-5' },
    ],
    language: 'python',
    starter_code: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
# TODO: compute the maximum sum of a contiguous subarray
print(0)`,
    starterCode: {
      python: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
# TODO: compute the maximum sum of a contiguous subarray
print(0)`,
    },
    test_cases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expected_output: '6', is_hidden: false },
      { input: '1\n-5', expected_output: '-5', is_hidden: false },
      { input: '5\n1 2 3 4 5', expected_output: '15', is_hidden: true },
      { input: '4\n-3 -2 -1 -4', expected_output: '-1', is_hidden: true },
      { input: '6\n5 -9 6 -2 3 -1', expected_output: '7', is_hidden: true },
    ],
    visibleTests: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expected: '6' },
      { input: '1\n-5', expected: '-5' },
    ],
    hiddenTests: [
      { input: '5\n1 2 3 4 5', expected: '15', category: 'basic' },
      { input: '4\n-3 -2 -1 -4', expected: '-1', category: 'basic' },
      { input: '6\n5 -9 6 -2 3 -1', expected: '7', category: 'basic' },
    ],
    solution_code: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
best = cur = nums[0]
for x in nums[1:]:
    cur = max(x, cur + x)
    best = max(best, cur)
print(best)`,
    explanation: `Kadane's algorithm: at each element, either extend the current run or start a new one. O(n) time, O(1) space.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.dp', 'dsa.arrays'],
  },

  // q18 · Medium · CODING · Number of Islands
  {
    id: 'q18',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Number of Islands',
    question_text: `**Problem:**

A grid contains \`1\` (land) and \`0\` (water). An island is a group of land cells connected horizontally or vertically. Count the islands.

**Input:** the first line contains \`r c\` (rows and columns); the next \`r\` lines each contain a string of \`c\` characters, \`0\` or \`1\`.
**Output:** a single integer, the number of islands.`,
    statement: `Count the islands in a 2D binary grid.`,
    inputFormat: 'The first line contains r c; the next r lines each contain a string of c characters, 0 or 1.',
    outputFormat: 'A single integer, the number of islands.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= r, c <= 300'],
    examples: [
      { input: '4 5\n11000\n11000\n00100\n00011', output: '3' },
      { input: '3 3\n111\n010\n111', output: '1' },
    ],
    language: 'python',
    starter_code: `import sys

data = sys.stdin.read().split()
r, c = int(data[0]), int(data[1])
grid = [list(row) for row in data[2:2 + r]]
count = 0
# TODO: count the connected groups of '1' cells (4 directions)
print(count)`,
    starterCode: {
      python: `import sys

data = sys.stdin.read().split()
r, c = int(data[0]), int(data[1])
grid = [list(row) for row in data[2:2 + r]]
count = 0
# TODO: count the connected groups of '1' cells (4 directions)
print(count)`,
    },
    test_cases: [
      { input: '4 5\n11000\n11000\n00100\n00011', expected_output: '3', is_hidden: false },
      { input: '3 3\n111\n010\n111', expected_output: '1', is_hidden: false },
      { input: '2 2\n00\n00', expected_output: '0', is_hidden: true },
      { input: '3 4\n1010\n0101\n1010', expected_output: '6', is_hidden: true },
      { input: '1 1\n1', expected_output: '1', is_hidden: true },
    ],
    visibleTests: [
      { input: '4 5\n11000\n11000\n00100\n00011', expected: '3' },
      { input: '3 3\n111\n010\n111', expected: '1' },
    ],
    hiddenTests: [
      { input: '2 2\n00\n00', expected: '0', category: 'basic' },
      { input: '3 4\n1010\n0101\n1010', expected: '6', category: 'basic' },
      { input: '1 1\n1', expected: '1', category: 'basic' },
    ],
    solution_code: `import sys

data = sys.stdin.read().split()
r, c = int(data[0]), int(data[1])
grid = [list(row) for row in data[2:2 + r]]
count = 0
for i in range(r):
    for j in range(c):
        if grid[i][j] == "1":
            count += 1
            stack = [(i, j)]
            grid[i][j] = "0"
            while stack:
                x, y = stack.pop()
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < r and 0 <= ny < c and grid[nx][ny] == "1":
                        grid[nx][ny] = "0"
                        stack.append((nx, ny))
print(count)`,
    explanation: `Each time an unvisited land cell is found, count a new island and flood-fill all connected land cells with an explicit stack. O(r * c) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.graphs'],
  },
];

// -------------------------------------------------------------
// SECTION C: Hard (q19 to q25) - 3 MCQs + 4 CODING (Weight 3)
// -------------------------------------------------------------

export const dsaSectionC: (McqQuestion | CodeQuestion)[] = [
  // q19 · Hard · MCQ
  {
    id: 'q19',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the time complexity of building a binary heap from an unsorted array of n elements with bottom-up heapify?`,
    prompt: `What is the time complexity of building a binary heap from an unsorted array of n elements with bottom-up heapify?`,
    mcq_options: [
      'A. O(n^2)',
      'B. O(n log n)',
      'C. O(log n)',
      'D. O(n)',
    ],
    options: [
      { id: 'A', text: 'O(n^2)' },
      { id: 'B', text: 'O(n log n)' },
      { id: 'C', text: 'O(log n)' },
      { id: 'D', text: 'O(n)' },
    ],
    correct_answer: 'D. O(n)',
    correctOptionId: 'D',
    explanation: `Most nodes sit near the bottom and need very little sifting, so the total work sums to O(n), better than n separate inserts.`,
    skills: ['dsa.heaps'],
  },

  // q20 · Hard · MCQ
  {
    id: 'q20',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `In which situation does Dijkstra's shortest path algorithm give incorrect results?`,
    prompt: `In which situation does Dijkstra's shortest path algorithm give incorrect results?`,
    mcq_options: [
      'A. When the graph is undirected',
      'B. When the graph is disconnected',
      'C. When the graph has negative edge weights',
      'D. When the graph contains cycles',
    ],
    options: [
      { id: 'A', text: 'When the graph is undirected' },
      { id: 'B', text: 'When the graph is disconnected' },
      { id: 'C', text: 'When the graph has negative edge weights' },
      { id: 'D', text: 'When the graph contains cycles' },
    ],
    correct_answer: 'C. When the graph has negative edge weights',
    correctOptionId: 'C',
    explanation: `Dijkstra assumes that once a node is settled its distance is final. A negative edge can later make a settled distance shorter, which breaks that assumption.`,
    skills: ['dsa.graphs'],
  },

  // q21 · Hard · MCQ
  {
    id: 'q21',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the time complexity of the naive recursive Fibonacci function fib(n) = fib(n-1) + fib(n-2)?`,
    prompt: `What is the time complexity of the naive recursive Fibonacci function fib(n) = fib(n-1) + fib(n-2)?`,
    mcq_options: [
      'A. Exponential, bounded by O(2^n)',
      'B. O(n)',
      'C. O(n^2)',
      'D. O(n log n)',
    ],
    options: [
      { id: 'A', text: 'Exponential, bounded by O(2^n)' },
      { id: 'B', text: 'O(n)' },
      { id: 'C', text: 'O(n^2)' },
      { id: 'D', text: 'O(n log n)' },
    ],
    correct_answer: 'A. Exponential, bounded by O(2^n)',
    correctOptionId: 'A',
    explanation: `Each call spawns two more calls and the same subproblems are recomputed again and again, so the call tree grows exponentially. Memoization reduces it to O(n).`,
    skills: ['dsa.recursion', 'dsa.dp'],
  },

  // q22 · Hard · CODING · Minimum Coin Change
  {
    id: 'q22',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Minimum Coin Change',
    question_text: `**Problem:**

Given coin denominations (unlimited supply of each) and an amount, find the fewest coins needed to make exactly that amount, or -1 if it is impossible.

**Input:** the first line contains \`n\`, the number of coin types; the second line contains the \`n\` coin values; the third line contains the amount.
**Output:** the minimum number of coins, or \`-1\`.`,
    statement: `Find the fewest coins needed to make exactly the target amount, or -1 if impossible.`,
    inputFormat: 'The first line contains n; the second line contains the n coin values; the third line contains the amount.',
    outputFormat: 'The minimum number of coins, or -1.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= n <= 50', '0 <= amount <= 10^4'],
    examples: [
      { input: '3\n1 2 5\n11', output: '3' },
      { input: '1\n2\n3', output: '-1' },
    ],
    language: 'python',
    starter_code: `import sys

data = sys.stdin.read().split()
n = int(data[0])
coins = list(map(int, data[1:1 + n]))
amount = int(data[1 + n])
# TODO: dynamic programming - minimum coins for each amount up to 'amount'
print(-1)`,
    starterCode: {
      python: `import sys

data = sys.stdin.read().split()
n = int(data[0])
coins = list(map(int, data[1:1 + n]))
amount = int(data[1 + n])
# TODO: dynamic programming - minimum coins for each amount up to 'amount'
print(-1)`,
    },
    test_cases: [
      { input: '3\n1 2 5\n11', expected_output: '3', is_hidden: false },
      { input: '1\n2\n3', expected_output: '-1', is_hidden: false },
      { input: '1\n1\n0', expected_output: '0', is_hidden: true },
      { input: '3\n2 5 10\n27', expected_output: '4', is_hidden: true },
      { input: '4\n1 3 4 5\n7', expected_output: '2', is_hidden: true },
    ],
    visibleTests: [
      { input: '3\n1 2 5\n11', expected: '3' },
      { input: '1\n2\n3', expected: '-1' },
    ],
    hiddenTests: [
      { input: '1\n1\n0', expected: '0', category: 'basic' },
      { input: '3\n2 5 10\n27', expected: '4', category: 'basic' },
      { input: '4\n1 3 4 5\n7', expected: '2', category: 'basic' },
    ],
    solution_code: `import sys

data = sys.stdin.read().split()
n = int(data[0])
coins = list(map(int, data[1:1 + n]))
amount = int(data[1 + n])
INF = amount + 1
dp = [0] + [INF] * amount
for a in range(1, amount + 1):
    for c in coins:
        if c <= a and dp[a - c] + 1 < dp[a]:
            dp[a] = dp[a - c] + 1
print(dp[amount] if dp[amount] != INF else -1)`,
    explanation: `dp[a] is the fewest coins for amount a: take the best of dp[a - c] + 1 over all coins c. O(amount * n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.dp'],
  },

  // q23 · Hard · CODING · Lexicographically Smallest Topological Order
  {
    id: 'q23',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Lexicographically Smallest Topological Order',
    question_text: `**Problem:**

A project has tasks numbered 1 to \`n\`. Each dependency \`a b\` means task \`a\` must be done before task \`b\`. Print a valid order of all tasks; if several orders are valid, print the lexicographically smallest one (compare the sequences number by number). If the dependencies contain a cycle, print \`IMPOSSIBLE\`.

**Input:** the first line contains \`n m\`; each of the next \`m\` lines contains \`a b\`.
**Output:** the \`n\` task numbers separated by spaces, or \`IMPOSSIBLE\`.`,
    statement: `Find the lexicographically smallest topological sort, or IMPOSSIBLE if a cycle exists.`,
    inputFormat: 'The first line contains n m; each of the next m lines contains a b.',
    outputFormat: 'The n task numbers separated by spaces, or IMPOSSIBLE.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= n <= 10^5', '0 <= m <= 2 * 10^5'],
    examples: [
      { input: '4 3\n1 2\n1 3\n3 4', output: '1 2 3 4' },
      { input: '4 3\n4 3\n3 2\n2 1', output: '4 3 2 1' },
    ],
    language: 'python',
    starter_code: `import sys, heapq

data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for i in range(m):
    a, b = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    adj[a].append(b)
    indeg[b] += 1
# TODO: Kahn's algorithm with a min-heap so the smallest available task is always taken first
print("IMPOSSIBLE")`,
    starterCode: {
      python: `import sys, heapq

data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for i in range(m):
    a, b = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    adj[a].append(b)
    indeg[b] += 1
# TODO: Kahn's algorithm with a min-heap so the smallest available task is always taken first
print("IMPOSSIBLE")`,
    },
    test_cases: [
      { input: '4 3\n1 2\n1 3\n3 4', expected_output: '1 2 3 4', is_hidden: false },
      { input: '4 3\n4 3\n3 2\n2 1', expected_output: '4 3 2 1', is_hidden: false },
      { input: '3 3\n1 2\n2 3\n3 1', expected_output: 'IMPOSSIBLE', is_hidden: true },
      { input: '5 0', expected_output: '1 2 3 4 5', is_hidden: true },
      { input: '6 6\n6 3\n6 1\n5 1\n5 2\n3 4\n4 2', expected_output: '5 6 1 3 4 2', is_hidden: true },
    ],
    visibleTests: [
      { input: '4 3\n1 2\n1 3\n3 4', expected: '1 2 3 4' },
      { input: '4 3\n4 3\n3 2\n2 1', expected: '4 3 2 1' },
    ],
    hiddenTests: [
      { input: '3 3\n1 2\n2 3\n3 1', expected: 'IMPOSSIBLE', category: 'basic' },
      { input: '5 0', expected: '1 2 3 4 5', category: 'basic' },
      { input: '6 6\n6 3\n6 1\n5 1\n5 2\n3 4\n4 2', expected: '5 6 1 3 4 2', category: 'basic' },
    ],
    solution_code: `import sys, heapq

data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for i in range(m):
    a, b = int(data[2 + 2 * i]), int(data[3 + 2 * i])
    adj[a].append(b)
    indeg[b] += 1
heap = [v for v in range(1, n + 1) if indeg[v] == 0]
heapq.heapify(heap)
order = []
while heap:
    v = heapq.heappop(heap)
    order.append(v)
    for w in adj[v]:
        indeg[w] -= 1
        if indeg[w] == 0:
            heapq.heappush(heap, w)
print(" ".join(map(str, order)) if len(order) == n else "IMPOSSIBLE")`,
    explanation: `Kahn's algorithm using a min-heap of tasks with no remaining prerequisites. If fewer than n tasks get ordered, there is a cycle. O((n + m) log n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.graphs'],
  },

  // q24 · Hard · CODING · Longest Increasing Subsequence
  {
    id: 'q24',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Longest Increasing Subsequence',
    question_text: `**Problem:**

Find the length of the longest strictly increasing subsequence of an array (elements need not be adjacent, but keep their order).

**Input:** the first line contains \`n\`; the second line contains \`n\` integers.
**Output:** a single integer, the length of the longest strictly increasing subsequence.`,
    statement: `Find the length of the longest strictly increasing subsequence of an array.`,
    inputFormat: 'The first line contains n; the second line contains n integers.',
    outputFormat: 'A single integer, the length of the longest strictly increasing subsequence.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= n <= 10^5'],
    examples: [
      { input: '8\n10 9 2 5 3 7 101 18', output: '4' },
      { input: '6\n0 1 0 3 2 3', output: '4' },
    ],
    language: 'python',
    starter_code: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
# TODO: compute the length of the longest strictly increasing subsequence
print(0)`,
    starterCode: {
      python: `import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
# TODO: compute the length of the longest strictly increasing subsequence
print(0)`,
    },
    test_cases: [
      { input: '8\n10 9 2 5 3 7 101 18', expected_output: '4', is_hidden: false },
      { input: '6\n0 1 0 3 2 3', expected_output: '4', is_hidden: false },
      { input: '5\n7 7 7 7 7', expected_output: '1', is_hidden: true },
      { input: '1\n3', expected_output: '1', is_hidden: true },
      { input: '6\n1 2 3 4 5 6', expected_output: '6', is_hidden: true },
      { input: '5\n5 4 3 2 1', expected_output: '1', is_hidden: true },
    ],
    visibleTests: [
      { input: '8\n10 9 2 5 3 7 101 18', expected: '4' },
      { input: '6\n0 1 0 3 2 3', expected: '4' },
    ],
    hiddenTests: [
      { input: '5\n7 7 7 7 7', expected: '1', category: 'basic' },
      { input: '1\n3', expected: '1', category: 'basic' },
      { input: '6\n1 2 3 4 5 6', expected: '6', category: 'basic' },
      { input: '5\n5 4 3 2 1', expected: '1', category: 'basic' },
    ],
    solution_code: `import sys
from bisect import bisect_left

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
tails = []
for x in nums:
    pos = bisect_left(tails, x)
    if pos == len(tails):
        tails.append(x)
    else:
        tails[pos] = x
print(len(tails))`,
    explanation: `Keep the smallest possible tail of an increasing subsequence for each length and use binary search to place each number. O(n log n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.dp', 'dsa.searching'],
  },

  // q25 · Hard · CODING · Shortest Path (Dijkstra)
  {
    id: 'q25',
    skill_evaluated: 'Data Structures and Algorithms',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Shortest Path (Dijkstra)',
    question_text: `**Problem:**

Given an undirected weighted graph with nodes 1 to \`n\`, find the length of the shortest path from node 1 to node \`n\`, or -1 if node \`n\` cannot be reached. All weights are positive.

**Input:** the first line contains \`n m\`; each of the next \`m\` lines contains \`u v w\` (an edge between \`u\` and \`v\` with weight \`w\`).
**Output:** the shortest distance, or \`-1\`.`,
    statement: `Find the length of the shortest path from node 1 to node n in an undirected weighted graph.`,
    inputFormat: 'The first line contains n m; each of the next m lines contains u v w.',
    outputFormat: 'The shortest distance, or -1.',
    rules: ['Python 3 solution reading from standard input.'],
    constraints: ['1 <= n <= 10^5', '0 <= m <= 2 * 10^5', 'All weights w > 0'],
    examples: [
      { input: '4 4\n1 2 1\n2 4 5\n1 3 2\n3 4 2', output: '4' },
      { input: '3 1\n1 2 4', output: '-1' },
    ],
    language: 'python',
    starter_code: `import sys, heapq

data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
for i in range(m):
    u, v, w = int(data[2 + 3 * i]), int(data[3 + 3 * i]), int(data[4 + 3 * i])
    adj[u].append((v, w))
    adj[v].append((u, w))
# TODO: Dijkstra's algorithm from node 1; print the distance to node n, or -1
print(-1)`,
    starterCode: {
      python: `import sys, heapq

data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
for i in range(m):
    u, v, w = int(data[2 + 3 * i]), int(data[3 + 3 * i]), int(data[4 + 3 * i])
    adj[u].append((v, w))
    adj[v].append((u, w))
# TODO: Dijkstra's algorithm from node 1; print the distance to node n, or -1
print(-1)`,
    },
    test_cases: [
      { input: '4 4\n1 2 1\n2 4 5\n1 3 2\n3 4 2', expected_output: '4', is_hidden: false },
      { input: '3 1\n1 2 4', expected_output: '-1', is_hidden: false },
      { input: '1 0', expected_output: '0', is_hidden: true },
      { input: '5 6\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1', expected_output: '6', is_hidden: true },
      { input: '2 2\n1 2 10\n1 2 3', expected_output: '3', is_hidden: true },
      { input: '6 9\n1 2 7\n1 3 9\n1 6 14\n2 3 10\n2 4 15\n3 4 11\n3 6 2\n4 5 6\n5 6 9', expected_output: '11', is_hidden: true },
    ],
    visibleTests: [
      { input: '4 4\n1 2 1\n2 4 5\n1 3 2\n3 4 2', expected: '4' },
      { input: '3 1\n1 2 4', expected: '-1' },
    ],
    hiddenTests: [
      { input: '1 0', expected: '0', category: 'basic' },
      { input: '5 6\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1', expected: '6', category: 'basic' },
      { input: '2 2\n1 2 10\n1 2 3', expected: '3', category: 'basic' },
      { input: '6 9\n1 2 7\n1 3 9\n1 6 14\n2 3 10\n2 4 15\n3 4 11\n3 6 2\n4 5 6\n5 6 9', expected: '11', category: 'basic' },
    ],
    solution_code: `import sys, heapq

data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
for i in range(m):
    u, v, w = int(data[2 + 3 * i]), int(data[3 + 3 * i]), int(data[4 + 3 * i])
    adj[u].append((v, w))
    adj[v].append((u, w))
INF = float("inf")
dist = [INF] * (n + 1)
dist[1] = 0
heap = [(0, 1)]
while heap:
    d, u = heapq.heappop(heap)
    if d > dist[u]:
        continue
    for v, w in adj[u]:
        if d + w < dist[v]:
            dist[v] = d + w
            heapq.heappush(heap, (dist[v], v))
print(dist[n] if dist[n] != INF else -1)`,
    explanation: `Dijkstra with a min-heap: repeatedly settle the closest unsettled node and relax its edges. O((n + m) log n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 65536,
    skills: ['dsa.graphs'],
  },
];

export const DSA_ASSESSMENT: Assessment = {
  id: 'dsa',
  title: 'Data Structures and Algorithms',
  domain: 'Algorithms, Data Structures & Computational Complexity',
  description: 'Complexity, arrays, strings, linked lists, stacks, queues, hashing, trees, heaps, graphs, sorting and searching, and dynamic programming.',
  timeLimitMinutes: 180,
  sections: [
    {
      id: 'A',
      title: 'Easy: 8 questions (6 MCQs + 2 coding)',
      difficulty: 1,
      difficultyLabel: 'Easy',
      weight: 1,
      questions: dsaSectionA,
    },
    {
      id: 'B',
      title: 'Medium: 10 questions (6 MCQs + 4 coding)',
      difficulty: 2,
      difficultyLabel: 'Medium',
      weight: 2,
      questions: dsaSectionB,
    },
    {
      id: 'C',
      title: 'Hard: 7 questions (3 MCQs + 4 coding)',
      difficulty: 3,
      difficultyLabel: 'Hard',
      weight: 3,
      questions: dsaSectionC,
    },
  ],
};
