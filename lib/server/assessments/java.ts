/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assessment, CodeQuestion, McqQuestion } from './types.ts';

// -------------------------------------------------------------
// SECTION A: Easy (q01 to q08) - 6 MCQs + 2 CODING (Weight 1)
// -------------------------------------------------------------

export const javaSectionA: (McqQuestion | CodeQuestion)[] = [
  // q01 · Easy · MCQ
  {
    id: 'q01',
    skill_evaluated: 'Java',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which method signature is the standard entry point of a Java program?`,
    prompt: `Which method signature is the standard entry point of a Java program?`,
    mcq_options: [
      'A. static void Main(String args)',
      'B. public void main(String[] args)',
      'C. public static int main(String[] args)',
      'D. public static void main(String[] args)',
    ],
    options: [
      { id: 'A', text: 'static void Main(String args)' },
      { id: 'B', text: 'public void main(String[] args)' },
      { id: 'C', text: 'public static int main(String[] args)' },
      { id: 'D', text: 'public static void main(String[] args)' },
    ],
    correct_answer: 'D. public static void main(String[] args)',
    correctOptionId: 'D',
    explanation: `The JVM looks for a public static void main method that takes a String array, so it can start the program without creating an object.`,
    skills: ['java.core'],
  },

  // q02 · Easy · MCQ
  {
    id: 'q02',
    skill_evaluated: 'Java',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `How many bits does a Java \`int\` use?`,
    prompt: `How many bits does a Java \`int\` use?`,
    mcq_options: [
      'A. 32',
      'B. 64',
      'C. 16',
      'D. It depends on the operating system',
    ],
    options: [
      { id: 'A', text: '32' },
      { id: 'B', text: '64' },
      { id: 'C', text: '16' },
      { id: 'D', text: 'It depends on the operating system' },
    ],
    correct_answer: 'A. 32',
    correctOptionId: 'A',
    explanation: `Java fixes the size of its primitive types, so \`int\` is always 32 bits on every platform.`,
    skills: ['java.core'],
  },

  // q03 · Easy · MCQ
  {
    id: 'q03',
    skill_evaluated: 'Java',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which keyword prevents a class from being extended?`,
    prompt: `Which keyword prevents a class from being extended?`,
    mcq_options: [
      'A. abstract',
      'B. static',
      'C. private',
      'D. final',
    ],
    options: [
      { id: 'A', text: 'abstract' },
      { id: 'B', text: 'static' },
      { id: 'C', text: 'private' },
      { id: 'D', text: 'final' },
    ],
    correct_answer: 'D. final',
    correctOptionId: 'D',
    explanation: `A \`final\` class cannot have subclasses. \`String\` is a well-known example.`,
    skills: ['java.oop'],
  },

  // q04 · Easy · MCQ
  {
    id: 'q04',
    skill_evaluated: 'Java',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What does \`System.out.println("5" + 3 + 2);\` print?`,
    prompt: `What does \`System.out.println("5" + 3 + 2);\` print?`,
    mcq_options: [
      'A. 55',
      'B. 532',
      'C. 10',
      'D. Compilation error',
    ],
    options: [
      { id: 'A', text: '55' },
      { id: 'B', text: '532' },
      { id: 'C', text: '10' },
      { id: 'D', text: 'Compilation error' },
    ],
    correct_answer: 'B. 532',
    correctOptionId: 'B',
    explanation: `Evaluation is left to right: "5" + 3 produces the String "53", and adding 2 appends "2", giving "532".`,
    skills: ['java.strings', 'java.core'],
  },

  // q05 · Easy · MCQ
  {
    id: 'q05',
    skill_evaluated: 'Java',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the default value of an uninitialized \`int\` instance field?`,
    prompt: `What is the default value of an uninitialized \`int\` instance field?`,
    mcq_options: [
      'A. -1',
      'B. null',
      'C. 0',
      'D. There is no default; the code will not compile',
    ],
    options: [
      { id: 'A', text: '-1' },
      { id: 'B', text: 'null' },
      { id: 'C', text: '0' },
      { id: 'D', text: 'There is no default; the code will not compile' },
    ],
    correct_answer: 'C. 0',
    correctOptionId: 'C',
    explanation: `Instance fields get default values (0 for int). Only local variables must be initialized before use.`,
    skills: ['java.core'],
  },

  // q06 · Easy · MCQ
  {
    id: 'q06',
    skill_evaluated: 'Java',
    difficulty: 'Easy',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which collection does NOT allow duplicate elements?`,
    prompt: `Which collection does NOT allow duplicate elements?`,
    mcq_options: [
      'A. LinkedList',
      'B. Vector',
      'C. HashSet',
      'D. ArrayList',
    ],
    options: [
      { id: 'A', text: 'LinkedList' },
      { id: 'B', text: 'Vector' },
      { id: 'C', text: 'HashSet' },
      { id: 'D', text: 'ArrayList' },
    ],
    correct_answer: 'C. HashSet',
    correctOptionId: 'C',
    explanation: `A Set stores unique elements only. The other three are List implementations that allow duplicates.`,
    skills: ['java.collections'],
  },

  // q07 · Easy · CODING · Sum of Even Numbers
  {
    id: 'q07',
    skill_evaluated: 'Java',
    difficulty: 'Easy',
    question_type: 'CODING',
    type: 'code',
    title: 'Sum of Even Numbers',
    question_text: `**Problem:**

Given \`n\` integers, print the sum of the even numbers among them.

**Input:** the first line contains \`n\`; the second line contains \`n\` space-separated integers.
**Output:** a single integer, the sum of the even values (0 if there are none).`,
    statement: `Given \`n\` integers, print the sum of the even numbers among them.`,
    inputFormat: 'The first line contains n; the second line contains n space-separated integers.',
    outputFormat: 'A single integer, the sum of the even values (0 if there are none).',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= n <= 10^5'],
    examples: [
      { input: '5\n1 2 3 4 5', output: '6' },
      { input: '3\n10 20 30', output: '60' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long sum = 0;
        // TODO: read n integers and add the even ones to sum
        System.out.println(sum);
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long sum = 0;
        // TODO: read n integers and add the even ones to sum
        System.out.println(sum);
    }
}`,
    },
    test_cases: [
      { input: '5\n1 2 3 4 5', expected_output: '6', is_hidden: false },
      { input: '3\n10 20 30', expected_output: '60', is_hidden: false },
      { input: '4\n1 3 5 7', expected_output: '0', is_hidden: true },
      { input: '1\n-4', expected_output: '-4', is_hidden: true },
      { input: '6\n-2 -3 8 0 7 100', expected_output: '106', is_hidden: true },
    ],
    visibleTests: [
      { input: '5\n1 2 3 4 5', expected: '6' },
      { input: '3\n10 20 30', expected: '60' },
    ],
    hiddenTests: [
      { input: '4\n1 3 5 7', expected: '0', category: 'basic' },
      { input: '1\n-4', expected: '-4', category: 'basic' },
      { input: '6\n-2 -3 8 0 7 100', expected: '106', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long sum = 0;
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            if (x % 2 == 0) sum += x;
        }
        System.out.println(sum);
    }
}`,
    explanation: `Read each number and add it only when \`x % 2 == 0\`. Runs in O(n) time and O(1) space.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.core'],
  },

  // q08 · Easy · CODING · Count Vowels
  {
    id: 'q08',
    skill_evaluated: 'Java',
    difficulty: 'Easy',
    question_type: 'CODING',
    type: 'code',
    title: 'Count Vowels',
    question_text: `**Problem:**

Count the vowels (a, e, i, o, u, in any case) in a line of text.

**Input:** one line of text.
**Output:** a single integer, the number of vowels.`,
    statement: `Count the vowels (a, e, i, o, u, in any case) in a line of text.`,
    inputFormat: 'One line of text.',
    outputFormat: 'A single integer, the number of vowels.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= text.length() <= 10^5'],
    examples: [
      { input: 'Hello World', output: '3' },
      { input: 'AEIOU aeiou', output: '10' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int count = 0;
        // TODO: count the vowels (a, e, i, o, u), ignoring case
        System.out.println(count);
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int count = 0;
        // TODO: count the vowels (a, e, i, o, u), ignoring case
        System.out.println(count);
    }
}`,
    },
    test_cases: [
      { input: 'Hello World', expected_output: '3', is_hidden: false },
      { input: 'AEIOU aeiou', expected_output: '10', is_hidden: false },
      { input: 'xyz', expected_output: '0', is_hidden: true },
      { input: 'Programming in Java', expected_output: '6', is_hidden: true },
      { input: 'Rhythm', expected_output: '0', is_hidden: true },
    ],
    visibleTests: [
      { input: 'Hello World', expected: '3' },
      { input: 'AEIOU aeiou', expected: '10' },
    ],
    hiddenTests: [
      { input: 'xyz', expected: '0', category: 'basic' },
      { input: 'Programming in Java', expected: '6', category: 'basic' },
      { input: 'Rhythm', expected: '0', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int count = 0;
        for (char c : s.toCharArray()) {
            if ("aeiou".indexOf(Character.toLowerCase(c)) >= 0) count++;
        }
        System.out.println(count);
    }
}`,
    explanation: `Lower-case each character and check whether it appears in "aeiou". O(n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.strings'],
  },
];

// -------------------------------------------------------------
// SECTION B: Medium (q09 to q18) - 6 MCQs + 4 CODING (Weight 2)
// -------------------------------------------------------------

export const javaSectionB: (McqQuestion | CodeQuestion)[] = [
  // q09 · Medium · MCQ
  {
    id: 'q09',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is the difference between \`==\` and \`.equals()\` when comparing two \`String\` objects?`,
    prompt: `What is the difference between \`==\` and \`.equals()\` when comparing two \`String\` objects?`,
    mcq_options: [
      'A. == compares references, .equals() compares the character content',
      'B. == is faster and always safe for Strings',
      'C. They always behave identically',
      'D. == compares content, .equals() compares references',
    ],
    options: [
      { id: 'A', text: '== compares references, .equals() compares the character content' },
      { id: 'B', text: '== is faster and always safe for Strings' },
      { id: 'C', text: 'They always behave identically' },
      { id: 'D', text: '== compares content, .equals() compares references' },
    ],
    correct_answer: 'A. == compares references, .equals() compares the character content',
    correctOptionId: 'A',
    explanation: `\`==\` checks whether both variables point to the same object, while \`String.equals()\` compares the characters.`,
    skills: ['java.strings', 'java.core'],
  },

  // q10 · Medium · MCQ
  {
    id: 'q10',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which statement about inheritance in Java is true?`,
    prompt: `Which statement about inheritance in Java is true?`,
    mcq_options: [
      'A. A class can extend many classes and implement many interfaces',
      'B. A class can extend many classes but implement only one interface',
      'C. A class can implement many interfaces but extend only one class',
      'D. An interface can only be implemented by abstract classes',
    ],
    options: [
      { id: 'A', text: 'A class can extend many classes and implement many interfaces' },
      { id: 'B', text: 'A class can extend many classes but implement only one interface' },
      { id: 'C', text: 'A class can implement many interfaces but extend only one class' },
      { id: 'D', text: 'An interface can only be implemented by abstract classes' },
    ],
    correct_answer: 'C. A class can implement many interfaces but extend only one class',
    correctOptionId: 'C',
    explanation: `Java allows single inheritance of classes but multiple implementation of interfaces.`,
    skills: ['java.oop'],
  },

  // q11 · Medium · MCQ
  {
    id: 'q11',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which statement about \`HashMap\` is true?`,
    prompt: `Which statement about \`HashMap\` is true?`,
    mcq_options: [
      'A. It allows multiple null keys',
      'B. It always keeps entries in insertion order',
      'C. It allows one null key and multiple null values',
      'D. It allows no null keys or values',
    ],
    options: [
      { id: 'A', text: 'It allows multiple null keys' },
      { id: 'B', text: 'It always keeps entries in insertion order' },
      { id: 'C', text: 'It allows one null key and multiple null values' },
      { id: 'D', text: 'It allows no null keys or values' },
    ],
    correct_answer: 'C. It allows one null key and multiple null values',
    correctOptionId: 'C',
    explanation: `HashMap permits a single null key and any number of null values, and it makes no ordering guarantee.`,
    skills: ['java.collections'],
  },

  // q12 · Medium · MCQ
  {
    id: 'q12',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which of these is a checked exception?`,
    prompt: `Which of these is a checked exception?`,
    mcq_options: [
      'A. ArrayIndexOutOfBoundsException',
      'B. NullPointerException',
      'C. IOException',
      'D. ArithmeticException',
    ],
    options: [
      { id: 'A', text: 'ArrayIndexOutOfBoundsException' },
      { id: 'B', text: 'NullPointerException' },
      { id: 'C', text: 'IOException' },
      { id: 'D', text: 'ArithmeticException' },
    ],
    correct_answer: 'C. IOException',
    correctOptionId: 'C',
    explanation: `Checked exceptions must be caught or declared. IOException is one; the other three extend RuntimeException and are unchecked.`,
    skills: ['java.exceptions'],
  },

  // q13 · Medium · MCQ
  {
    id: 'q13',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which feature is an example of runtime polymorphism?`,
    prompt: `Which feature is an example of runtime polymorphism?`,
    mcq_options: [
      'A. Method overriding',
      'B. Method overloading',
      'C. Using static variables',
      'D. Constructor chaining',
    ],
    options: [
      { id: 'A', text: 'Method overriding' },
      { id: 'B', text: 'Method overloading' },
      { id: 'C', text: 'Using static variables' },
      { id: 'D', text: 'Constructor chaining' },
    ],
    correct_answer: 'A. Method overriding',
    correctOptionId: 'A',
    explanation: `With overriding, the method that runs is chosen at runtime from the object's actual type. Overloading is resolved at compile time.`,
    skills: ['java.oop'],
  },

  // q14 · Medium · MCQ
  {
    id: 'q14',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What does declaring a method \`static\` mean?`,
    prompt: `What does declaring a method \`static\` mean?`,
    mcq_options: [
      'A. It can only be called once',
      'B. It belongs to the class and can be called without creating an object',
      'C. It cannot be overridden by anyone, ever, and cannot take parameters',
      'D. It runs automatically when the class is loaded',
    ],
    options: [
      { id: 'A', text: 'It can only be called once' },
      { id: 'B', text: 'It belongs to the class and can be called without creating an object' },
      { id: 'C', text: 'It cannot be overridden by anyone, ever, and cannot take parameters' },
      { id: 'D', text: 'It runs automatically when the class is loaded' },
    ],
    correct_answer: 'B. It belongs to the class and can be called without creating an object',
    correctOptionId: 'B',
    explanation: `A static method is associated with the class itself, so it can be called as ClassName.method() without an instance.`,
    skills: ['java.core', 'java.oop'],
  },

  // q15 · Medium · CODING · Palindrome Check
  {
    id: 'q15',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Palindrome Check',
    question_text: `**Problem:**

Check whether a line of text is a palindrome, ignoring letter case and every character that is not a letter or digit.

**Input:** one line of text.
**Output:** \`true\` or \`false\`.`,
    statement: `Check whether a line of text is a palindrome, ignoring letter case and every character that is not a letter or digit.`,
    inputFormat: 'One line of text.',
    outputFormat: 'true or false.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= text.length() <= 10^5'],
    examples: [
      { input: 'A man, a plan, a canal: Panama', output: 'true' },
      { input: 'race a car', output: 'false' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        // TODO: keep only letters and digits (lower case) and check if the result reads the same backwards
        System.out.println(false);
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        // TODO: keep only letters and digits (lower case) and check if the result reads the same backwards
        System.out.println(false);
    }
}`,
    },
    test_cases: [
      { input: 'A man, a plan, a canal: Panama', expected_output: 'true', is_hidden: false },
      { input: 'race a car', expected_output: 'false', is_hidden: false },
      { input: 'No lemon, no melon', expected_output: 'true', is_hidden: true },
      { input: '12321', expected_output: 'true', is_hidden: true },
      { input: '0P', expected_output: 'false', is_hidden: true },
    ],
    visibleTests: [
      { input: 'A man, a plan, a canal: Panama', expected: 'true' },
      { input: 'race a car', expected: 'false' },
    ],
    hiddenTests: [
      { input: 'No lemon, no melon', expected: 'true', category: 'basic' },
      { input: '12321', expected: 'true', category: 'basic' },
      { input: '0P', expected: 'false', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) sb.append(Character.toLowerCase(c));
        }
        String cleaned = sb.toString();
        System.out.println(cleaned.equals(sb.reverse().toString()));
    }
}`,
    explanation: `Clean the string, then compare it with its reverse. O(n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.strings'],
  },

  // q16 · Medium · CODING · Most Frequent Word
  {
    id: 'q16',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Most Frequent Word',
    question_text: `**Problem:**

Find the most frequent word in a line of lowercase words. If several words share the highest count, print the alphabetically smallest one.

**Input:** one line of space-separated lowercase words.
**Output:** the most frequent word.`,
    statement: `Find the most frequent word in a line of lowercase words. If several words share the highest count, print the alphabetically smallest one.`,
    inputFormat: 'One line of space-separated lowercase words.',
    outputFormat: 'The most frequent word.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= words.length <= 10^5'],
    examples: [
      { input: 'the cat and the dog and the bird', output: 'the' },
      { input: 'b a b a', output: 'a' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] words = sc.nextLine().trim().split("\\\\s+");
        // TODO: count each word and print the most frequent one (ties: alphabetically smallest)
        System.out.println(words[0]);
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] words = sc.nextLine().trim().split("\\\\s+");
        // TODO: count each word and print the most frequent one (ties: alphabetically smallest)
        System.out.println(words[0]);
    }
}`,
    },
    test_cases: [
      { input: 'the cat and the dog and the bird', expected_output: 'the', is_hidden: false },
      { input: 'b a b a', expected_output: 'a', is_hidden: false },
      { input: 'apple', expected_output: 'apple', is_hidden: true },
      { input: 'x y z z y', expected_output: 'y', is_hidden: true },
      { input: 'one two three two three one three', expected_output: 'three', is_hidden: true },
    ],
    visibleTests: [
      { input: 'the cat and the dog and the bird', expected: 'the' },
      { input: 'b a b a', expected: 'a' },
    ],
    hiddenTests: [
      { input: 'apple', expected: 'apple', category: 'basic' },
      { input: 'x y z z y', expected: 'y', category: 'basic' },
      { input: 'one two three two three one three', expected: 'three', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] words = sc.nextLine().trim().split("\\\\s+");
        Map<String, Integer> freq = new TreeMap<>();
        for (String w : words) freq.merge(w, 1, Integer::sum);
        String best = null;
        int bestCount = 0;
        for (Map.Entry<String, Integer> e : freq.entrySet()) {
            if (e.getValue() > bestCount) {
                best = e.getKey();
                bestCount = e.getValue();
            }
        }
        System.out.println(best);
    }
}`,
    explanation: `A TreeMap iterates keys alphabetically, so keeping only strictly larger counts resolves ties in favour of the smallest word.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.collections', 'java.strings'],
  },

  // q17 · Medium · CODING · Balanced Brackets
  {
    id: 'q17',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Balanced Brackets',
    question_text: `**Problem:**

Check whether a string made only of the characters \`()[]{}\` is balanced: every opening bracket is closed by the same type, in the correct order.

**Input:** one line containing the bracket string.
**Output:** \`true\` or \`false\`.`,
    statement: `Check whether a string made only of the characters \`()[]{}\` is balanced.`,
    inputFormat: 'One line containing the bracket string.',
    outputFormat: 'true or false.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= s.length() <= 10^5'],
    examples: [
      { input: '()[]{}', output: 'true' },
      { input: '(]', output: 'false' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        Deque<Character> stack = new ArrayDeque<>();
        // TODO: use the stack to check that the brackets are balanced
        System.out.println(false);
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        Deque<Character> stack = new ArrayDeque<>();
        // TODO: use the stack to check that the brackets are balanced
        System.out.println(false);
    }
}`,
    },
    test_cases: [
      { input: '()[]{}', expected_output: 'true', is_hidden: false },
      { input: '(]', expected_output: 'false', is_hidden: false },
      { input: '{[()]}', expected_output: 'true', is_hidden: true },
      { input: '((', expected_output: 'false', is_hidden: true },
      { input: '([)]', expected_output: 'false', is_hidden: true },
      { input: ']', expected_output: 'false', is_hidden: true },
    ],
    visibleTests: [
      { input: '()[]{}', expected: 'true' },
      { input: '(]', expected: 'false' },
    ],
    hiddenTests: [
      { input: '{[()]}', expected: 'true', category: 'basic' },
      { input: '((', expected: 'false', category: 'basic' },
      { input: '([)]', expected: 'false', category: 'basic' },
      { input: ']', expected: 'false', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        Deque<Character> stack = new ArrayDeque<>();
        boolean ok = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) { ok = false; break; }
                char open = stack.pop();
                if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{')) {
                    ok = false;
                    break;
                }
            }
        }
        System.out.println(ok && stack.isEmpty());
    }
}`,
    explanation: `Push every opening bracket; on a closing bracket, pop and check it matches. The string is balanced if no mismatch occurs and the stack ends empty.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.collections'],
  },

  // q18 · Medium · CODING · Sort Students
  {
    id: 'q18',
    skill_evaluated: 'Java',
    difficulty: 'Medium',
    question_type: 'CODING',
    type: 'code',
    title: 'Sort Students',
    question_text: `**Problem:**

Sort students by marks from highest to lowest. Students with equal marks are ordered alphabetically by name.

**Input:** the first line contains \`n\`; each of the next \`n\` lines contains a name (no spaces) and an integer mark.
**Output:** \`n\` lines, each in the form \`name marks\`, in sorted order.`,
    statement: `Sort students by marks from highest to lowest. Students with equal marks are ordered alphabetically by name.`,
    inputFormat: 'The first line contains n; each of the next n lines contains a name (no spaces) and an integer mark.',
    outputFormat: 'n lines, each in the form `name marks`, in sorted order.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= n <= 10^5'],
    examples: [
      { input: '3\nAmit 80\nBina 90\nCara 80', output: 'Bina 90\nAmit 80\nCara 80' },
      { input: '2\nZed 50\nAbe 50', output: 'Abe 50\nZed 50' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    static class Student {
        String name;
        int marks;
        Student(String name, int marks) {
            this.name = name;
            this.marks = marks;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<Student> students = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            students.add(new Student(sc.next(), sc.nextInt()));
        }
        // TODO: sort by marks (highest first), then by name (A to Z)
        for (Student s : students) {
            System.out.println(s.name + " " + s.marks);
        }
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    static class Student {
        String name;
        int marks;
        Student(String name, int marks) {
            this.name = name;
            this.marks = marks;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<Student> students = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            students.add(new Student(sc.next(), sc.nextInt()));
        }
        // TODO: sort by marks (highest first), then by name (A to Z)
        for (Student s : students) {
            System.out.println(s.name + " " + s.marks);
        }
    }
}`,
    },
    test_cases: [
      { input: '3\nAmit 80\nBina 90\nCara 80', expected_output: 'Bina 90\nAmit 80\nCara 80', is_hidden: false },
      { input: '2\nZed 50\nAbe 50', expected_output: 'Abe 50\nZed 50', is_hidden: false },
      { input: '1\nSolo 100', expected_output: 'Solo 100', is_hidden: true },
      { input: '4\nDev 70\nEli 95\nFay 70\nGus 88', expected_output: 'Eli 95\nGus 88\nDev 70\nFay 70', is_hidden: true },
      { input: '3\nB 1\nA 2\nC 3', expected_output: 'C 3\nA 2\nB 1', is_hidden: true },
    ],
    visibleTests: [
      { input: '3\nAmit 80\nBina 90\nCara 80', expected: 'Bina 90\nAmit 80\nCara 80' },
      { input: '2\nZed 50\nAbe 50', expected: 'Abe 50\nZed 50' },
    ],
    hiddenTests: [
      { input: '1\nSolo 100', expected: 'Solo 100', category: 'basic' },
      { input: '4\nDev 70\nEli 95\nFay 70\nGus 88', expected: 'Eli 95\nGus 88\nDev 70\nFay 70', category: 'basic' },
      { input: '3\nB 1\nA 2\nC 3', expected: 'C 3\nA 2\nB 1', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    static class Student {
        String name;
        int marks;
        Student(String name, int marks) {
            this.name = name;
            this.marks = marks;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<Student> students = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            students.add(new Student(sc.next(), sc.nextInt()));
        }
        students.sort((a, b) -> a.marks != b.marks ? Integer.compare(b.marks, a.marks) : a.name.compareTo(b.name));
        for (Student s : students) {
            System.out.println(s.name + " " + s.marks);
        }
    }
}`,
    explanation: `Use a Comparator that compares marks in descending order first and falls back to the name. O(n log n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.collections', 'java.oop'],
  },
];

// -------------------------------------------------------------
// SECTION C: Hard (q19 to q25) - 3 MCQs + 4 CODING (Weight 3)
// -------------------------------------------------------------

export const javaSectionC: (McqQuestion | CodeQuestion)[] = [
  // q19 · Hard · MCQ
  {
    id: 'q19',
    skill_evaluated: 'Java',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What is printed by the following code?
\`\`\`java
static int f() {
    try { return 1; }
    finally { System.out.println("F"); }
}
// in main:
System.out.println(f());
\`\`\``,
    prompt: `What is printed by the following code?
\`\`\`java
static int f() {
    try { return 1; }
    finally { System.out.println("F"); }
}
// in main:
System.out.println(f());
\`\`\``,
    mcq_options: [
      'A. 1, then F',
      'B. Only 1',
      'C. F, then 1',
      'D. Only F',
    ],
    options: [
      { id: 'A', text: '1, then F' },
      { id: 'B', text: 'Only 1' },
      { id: 'C', text: 'F, then 1' },
      { id: 'D', text: 'Only F' },
    ],
    correct_answer: 'C. F, then 1',
    correctOptionId: 'C',
    explanation: `The finally block always runs before the method actually returns, so F is printed first. Then main prints the returned value 1.`,
    skills: ['java.exceptions'],
  },

  // q20 · Hard · MCQ
  {
    id: 'q20',
    skill_evaluated: 'Java',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `Which statement correctly describes the \`equals\` / \`hashCode\` contract?`,
    prompt: `Which statement correctly describes the \`equals\` / \`hashCode\` contract?`,
    mcq_options: [
      'A. equals() and hashCode() are unrelated and can be overridden independently',
      'B. hashCode() must return a different value for every object',
      'C. If two objects have the same hashCode(), they must be equal',
      'D. If two objects are equal according to equals(), they must return the same hashCode()',
    ],
    options: [
      { id: 'A', text: 'equals() and hashCode() are unrelated and can be overridden independently' },
      { id: 'B', text: 'hashCode() must return a different value for every object' },
      { id: 'C', text: 'If two objects have the same hashCode(), they must be equal' },
      { id: 'D', text: 'If two objects are equal according to equals(), they must return the same hashCode()' },
    ],
    correct_answer: 'D. If two objects are equal according to equals(), they must return the same hashCode()',
    correctOptionId: 'D',
    explanation: `Equal objects must have equal hash codes, otherwise hash-based collections such as HashMap and HashSet break. The reverse is not required, because different objects may collide.`,
    skills: ['java.oop', 'java.collections'],
  },

  // q21 · Hard · MCQ
  {
    id: 'q21',
    skill_evaluated: 'Java',
    difficulty: 'Hard',
    question_type: 'MCQ',
    type: 'mcq',
    question_text: `What does this expression evaluate to?
\`\`\`java
List.of(1, 2, 3, 4).stream().filter(x -> x % 2 == 0).mapToInt(x -> x * x).sum()
\`\`\``,
    prompt: `What does this expression evaluate to?
\`\`\`java
List.of(1, 2, 3, 4).stream().filter(x -> x % 2 == 0).mapToInt(x -> x * x).sum()
\`\`\``,
    mcq_options: [
      'A. 20',
      'B. 30',
      'C. 6',
      'D. 10',
    ],
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '30' },
      { id: 'C', text: '6' },
      { id: 'D', text: '10' },
    ],
    correct_answer: 'A. 20',
    correctOptionId: 'A',
    explanation: `The filter keeps 2 and 4. Their squares are 4 and 16, and the sum is 20.`,
    skills: ['java.streams'],
  },

  // q22 · Hard · CODING · LRU Cache
  {
    id: 'q22',
    skill_evaluated: 'Java',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'LRU Cache',
    question_text: `**Problem:**

Implement a Least Recently Used (LRU) cache with a fixed capacity. \`get\` and \`put\` both count as using a key. When \`put\` adds a new key to a full cache, the least recently used key is evicted. Updating an existing key replaces its value and marks it as most recently used.

**Input:** the first line contains the capacity; the second line contains \`q\`, the number of operations; each of the next \`q\` lines is either \`put key value\` or \`get key\`.
**Output:** for every \`get\`, print the value, or \`-1\` if the key is not present, each on its own line.`,
    statement: `Implement a Least Recently Used (LRU) cache with a fixed capacity.`,
    inputFormat: 'The first line contains the capacity; the second line contains q, the number of operations; each of the next q lines is either put key value or get key.',
    outputFormat: 'For every get, print the value, or -1 if the key is not present, each on its own line.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= capacity <= 1000', '1 <= q <= 10^4'],
    examples: [
      {
        input: '2\n9\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4',
        output: '1\n-1\n-1\n3\n4',
      },
      {
        input: '1\n4\nput 5 50\nget 5\nput 6 60\nget 5',
        output: '50\n-1',
      },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    static class LRU {
        LRU(int capacity) {
            // TODO
        }

        int get(int key) {
            // TODO: return the value, or -1 if missing (and mark the key as recently used)
            return -1;
        }

        void put(int key, int value) {
            // TODO: insert or update, evicting the least recently used key when full
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        LRU cache = new LRU(sc.nextInt());
        int q = sc.nextInt();
        for (int i = 0; i < q; i++) {
            String op = sc.next();
            if (op.equals("put")) {
                cache.put(sc.nextInt(), sc.nextInt());
            } else {
                System.out.println(cache.get(sc.nextInt()));
            }
        }
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    static class LRU {
        LRU(int capacity) {
            // TODO
        }

        int get(int key) {
            // TODO: return the value, or -1 if missing (and mark the key as recently used)
            return -1;
        }

        void put(int key, int value) {
            // TODO: insert or update, evicting the least recently used key when full
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        LRU cache = new LRU(sc.nextInt());
        int q = sc.nextInt();
        for (int i = 0; i < q; i++) {
            String op = sc.next();
            if (op.equals("put")) {
                cache.put(sc.nextInt(), sc.nextInt());
            } else {
                System.out.println(cache.get(sc.nextInt()));
            }
        }
    }
}`,
    },
    test_cases: [
      {
        input: '2\n9\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4',
        expected_output: '1\n-1\n-1\n3\n4',
        is_hidden: false,
      },
      {
        input: '1\n4\nput 5 50\nget 5\nput 6 60\nget 5',
        expected_output: '50\n-1',
        is_hidden: false,
      },
      {
        input: '2\n6\nput 1 1\nput 2 2\nput 1 10\nput 3 3\nget 1\nget 2',
        expected_output: '10\n-1',
        is_hidden: true,
      },
      {
        input: '3\n7\nput 1 1\nput 2 2\nput 3 3\nget 1\nput 4 4\nget 2\nget 3',
        expected_output: '1\n-1\n3',
        is_hidden: true,
      },
      {
        input: '2\n2\nget 7\nget 8',
        expected_output: '-1\n-1',
        is_hidden: true,
      },
    ],
    visibleTests: [
      {
        input: '2\n9\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4',
        expected: '1\n-1\n-1\n3\n4',
      },
      {
        input: '1\n4\nput 5 50\nget 5\nput 6 60\nget 5',
        expected: '50\n-1',
      },
    ],
    hiddenTests: [
      {
        input: '2\n6\nput 1 1\nput 2 2\nput 1 10\nput 3 3\nget 1\nget 2',
        expected: '10\n-1',
        category: 'basic',
      },
      {
        input: '3\n7\nput 1 1\nput 2 2\nput 3 3\nget 1\nput 4 4\nget 2\nget 3',
        expected: '1\n-1\n3',
        category: 'basic',
      },
      {
        input: '2\n2\nget 7\nget 8',
        expected: '-1\n-1',
        category: 'basic',
      },
    ],
    solution_code: `import java.util.*;

public class Main {
    static class LRU {
        private final int capacity;
        private final LinkedHashMap<Integer, Integer> map = new LinkedHashMap<>(16, 0.75f, true);

        LRU(int capacity) {
            this.capacity = capacity;
        }

        int get(int key) {
            return map.getOrDefault(key, -1);
        }

        void put(int key, int value) {
            map.put(key, value);
            if (map.size() > capacity) {
                Integer eldest = map.keySet().iterator().next();
                map.remove(eldest);
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        LRU cache = new LRU(sc.nextInt());
        int q = sc.nextInt();
        for (int i = 0; i < q; i++) {
            String op = sc.next();
            if (op.equals("put")) {
                cache.put(sc.nextInt(), sc.nextInt());
            } else {
                System.out.println(cache.get(sc.nextInt()));
            }
        }
    }
}`,
    explanation: `An access-ordered LinkedHashMap keeps the least recently used key first, so after each put we remove the first key if the size exceeds the capacity. Both operations are O(1).`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.collections', 'java.oop'],
  },

  // q23 · Hard · CODING · Longest Substring Without Repeating Characters
  {
    id: 'q23',
    skill_evaluated: 'Java',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Longest Substring Without Repeating Characters',
    question_text: `**Problem:**

Find the length of the longest substring of a string that contains no repeated character.

**Input:** one line containing the string.
**Output:** a single integer, the length of that substring.`,
    statement: `Find the length of the longest substring of a string that contains no repeated character.`,
    inputFormat: 'One line containing the string.',
    outputFormat: 'A single integer, the length of that substring.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['0 <= s.length() <= 10^5'],
    examples: [
      { input: 'abcabcbb', output: '3' },
      { input: 'bbbbb', output: '1' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int best = 0;
        // TODO: use a sliding window to find the longest substring without repeated characters
        System.out.println(best);
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int best = 0;
        // TODO: use a sliding window to find the longest substring without repeated characters
        System.out.println(best);
    }
}`,
    },
    test_cases: [
      { input: 'abcabcbb', expected_output: '3', is_hidden: false },
      { input: 'bbbbb', expected_output: '1', is_hidden: false },
      { input: 'pwwkew', expected_output: '3', is_hidden: true },
      { input: 'abcdef', expected_output: '6', is_hidden: true },
      { input: 'dvdf', expected_output: '3', is_hidden: true },
      { input: 'abba', expected_output: '2', is_hidden: true },
    ],
    visibleTests: [
      { input: 'abcabcbb', expected: '3' },
      { input: 'bbbbb', expected: '1' },
    ],
    hiddenTests: [
      { input: 'pwwkew', expected: '3', category: 'basic' },
      { input: 'abcdef', expected: '6', category: 'basic' },
      { input: 'dvdf', expected: '3', category: 'basic' },
      { input: 'abba', expected: '2', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Map<Character, Integer> last = new HashMap<>();
        int best = 0, start = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (last.containsKey(c) && last.get(c) >= start) {
                start = last.get(c) + 1;
            }
            last.put(c, i);
            best = Math.max(best, i - start + 1);
        }
        System.out.println(best);
    }
}`,
    explanation: `Sliding window: remember the last index of each character and move the window start past a repeat. O(n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.strings', 'java.collections'],
  },

  // q24 · Hard · CODING · Top K Frequent Elements
  {
    id: 'q24',
    skill_evaluated: 'Java',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Top K Frequent Elements',
    question_text: `**Problem:**

Print the \`k\` most frequent integers of an array. Order them by frequency from highest to lowest; if frequencies are equal, the smaller value comes first.

**Input:** the first line contains \`n\`; the second line contains \`n\` integers; the third line contains \`k\`.
**Output:** \`k\` space-separated integers.`,
    statement: `Print the \`k\` most frequent integers of an array.`,
    inputFormat: 'The first line contains n; the second line contains n integers; the third line contains k.',
    outputFormat: 'k space-separated integers.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= n <= 10^5', '1 <= k <= distinct elements'],
    examples: [
      { input: '6\n1 1 1 2 2 3\n2', output: '1 2' },
      { input: '1\n5\n1', output: '5' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Map<Integer, Integer> freq = new HashMap<>();
        for (int i = 0; i < n; i++) freq.merge(sc.nextInt(), 1, Integer::sum);
        int k = sc.nextInt();
        // TODO: print the k most frequent values (frequency desc, value asc), space separated
        System.out.println();
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Map<Integer, Integer> freq = new HashMap<>();
        for (int i = 0; i < n; i++) freq.merge(sc.nextInt(), 1, Integer::sum);
        int k = sc.nextInt();
        // TODO: print the k most frequent values (frequency desc, value asc), space separated
        System.out.println();
    }
}`,
    },
    test_cases: [
      { input: '6\n1 1 1 2 2 3\n2', expected_output: '1 2', is_hidden: false },
      { input: '1\n5\n1', expected_output: '5', is_hidden: false },
      { input: '8\n4 4 3 3 2 2 1 1\n3', expected_output: '1 2 3', is_hidden: true },
      { input: '7\n-1 -1 2 2 2 3 3\n2', expected_output: '2 -1', is_hidden: true },
      { input: '5\n9 8 7 9 8\n3', expected_output: '8 9 7', is_hidden: true },
    ],
    visibleTests: [
      { input: '6\n1 1 1 2 2 3\n2', expected: '1 2' },
      { input: '1\n5\n1', expected: '5' },
    ],
    hiddenTests: [
      { input: '8\n4 4 3 3 2 2 1 1\n3', expected: '1 2 3', category: 'basic' },
      { input: '7\n-1 -1 2 2 2 3 3\n2', expected: '2 -1', category: 'basic' },
      { input: '5\n9 8 7 9 8\n3', expected: '8 9 7', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Map<Integer, Integer> freq = new HashMap<>();
        for (int i = 0; i < n; i++) freq.merge(sc.nextInt(), 1, Integer::sum);
        int k = sc.nextInt();
        List<Integer> keys = new ArrayList<>(freq.keySet());
        keys.sort((a, b) -> freq.get(a).equals(freq.get(b)) ? Integer.compare(a, b) : Integer.compare(freq.get(b), freq.get(a)));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < k && i < keys.size(); i++) {
            if (i > 0) sb.append(' ');
            sb.append(keys.get(i));
        }
        System.out.println(sb);
    }
}`,
    explanation: `Count frequencies with a HashMap, then sort the distinct keys with a comparator on (frequency desc, value asc) and take the first k. O(n log n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.collections'],
  },

  // q25 · Hard · CODING · Merge Intervals
  {
    id: 'q25',
    skill_evaluated: 'Java',
    difficulty: 'Hard',
    question_type: 'CODING',
    type: 'code',
    title: 'Merge Intervals',
    question_text: `**Problem:**

Merge all overlapping intervals. Intervals that touch (one ends exactly where the next starts) also merge.

**Input:** the first line contains \`n\`; each of the next \`n\` lines contains two integers \`start end\`.
**Output:** the merged intervals sorted by start, one \`start end\` pair per line.`,
    statement: `Merge all overlapping intervals. Intervals that touch also merge.`,
    inputFormat: 'The first line contains n; each of the next n lines contains two integers start end.',
    outputFormat: 'The merged intervals sorted by start, one start end pair per line.',
    rules: ['Java programs must use the class name Main.'],
    constraints: ['1 <= n <= 10^5'],
    examples: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', output: '1 6\n8 10\n15 18' },
      { input: '2\n1 4\n4 5', output: '1 5' },
    ],
    language: 'java',
    starter_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] iv = new int[n][2];
        for (int i = 0; i < n; i++) {
            iv[i][0] = sc.nextInt();
            iv[i][1] = sc.nextInt();
        }
        List<int[]> merged = new ArrayList<>();
        // TODO: sort the intervals and merge the overlapping ones into 'merged'
        for (int[] m : merged) System.out.println(m[0] + " " + m[1]);
    }
}`,
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] iv = new int[n][2];
        for (int i = 0; i < n; i++) {
            iv[i][0] = sc.nextInt();
            iv[i][1] = sc.nextInt();
        }
        List<int[]> merged = new ArrayList<>();
        // TODO: sort the intervals and merge the overlapping ones into 'merged'
        for (int[] m : merged) System.out.println(m[0] + " " + m[1]);
    }
}`,
    },
    test_cases: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', expected_output: '1 6\n8 10\n15 18', is_hidden: false },
      { input: '2\n1 4\n4 5', expected_output: '1 5', is_hidden: false },
      { input: '3\n5 6\n1 2\n3 4', expected_output: '1 2\n3 4\n5 6', is_hidden: true },
      { input: '1\n7 9', expected_output: '7 9', is_hidden: true },
      { input: '4\n1 10\n2 3\n4 5\n6 7', expected_output: '1 10', is_hidden: true },
      { input: '3\n1 4\n0 4\n2 3', expected_output: '0 4', is_hidden: true },
    ],
    visibleTests: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', expected: '1 6\n8 10\n15 18' },
      { input: '2\n1 4\n4 5', expected: '1 5' },
    ],
    hiddenTests: [
      { input: '3\n5 6\n1 2\n3 4', expected: '1 2\n3 4\n5 6', category: 'basic' },
      { input: '1\n7 9', expected: '7 9', category: 'basic' },
      { input: '4\n1 10\n2 3\n4 5\n6 7', expected: '1 10', category: 'basic' },
      { input: '3\n1 4\n0 4\n2 3', expected: '0 4', category: 'basic' },
    ],
    solution_code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] iv = new int[n][2];
        for (int i = 0; i < n; i++) {
            iv[i][0] = sc.nextInt();
            iv[i][1] = sc.nextInt();
        }
        Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] cur : iv) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < cur[0]) {
                merged.add(new int[]{cur[0], cur[1]});
            } else {
                int[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], cur[1]);
            }
        }
        for (int[] m : merged) System.out.println(m[0] + " " + m[1]);
    }
}`,
    explanation: `Sort by start, then extend the last merged interval whenever the next one starts at or before its end. O(n log n) time.`,
    timeLimitMs: 5000,
    memoryLimitKb: 262144,
    skills: ['java.algorithms'],
  },
];

export const JAVA_ASSESSMENT: Assessment = {
  id: 'java',
  title: 'Java',
  domain: 'Java Engineering & Enterprise Architecture',
  description: 'Core Java: syntax, OOP, strings, collections, exceptions, streams and problem solving.',
  timeLimitMinutes: 180,
  sections: [
    {
      id: 'A',
      title: 'Easy: 8 questions (6 MCQs + 2 coding)',
      difficulty: 1,
      difficultyLabel: 'Easy',
      weight: 1,
      questions: javaSectionA,
    },
    {
      id: 'B',
      title: 'Medium: 10 questions (6 MCQs + 4 coding)',
      difficulty: 2,
      difficultyLabel: 'Medium',
      weight: 2,
      questions: javaSectionB,
    },
    {
      id: 'C',
      title: 'Hard: 7 questions (3 MCQs + 4 coding)',
      difficulty: 3,
      difficultyLabel: 'Hard',
      weight: 3,
      questions: javaSectionC,
    },
  ],
};
