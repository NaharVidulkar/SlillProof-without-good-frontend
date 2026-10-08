/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Problem, PublicProblem } from '../types.ts';

export const PROBLEMS: Problem[] = [
  {
    id: 'student-registry',
    title: 'Student Registry',
    difficulty: 'Easy',
    points: 100,
    skills: ['data-structures', 'state-management', 'validation', 'rest-semantics'],
    timeEstimateMin: 25,
    description: `You are building an in-memory student registry that processes sequential transactional commands from standard input.

Input Format:
- The first line contains an integer N representing the number of commands.
- The following N lines each contain one command:
  * CREATE <name> <age>
  * GET <id>
  * UPDATE <id> <age>
  * DELETE <id>

Command Semantics:
1. CREATE <name> <age>: Validates age (must be an integer from 0 to 120 inclusive). If age is invalid, prints "400" and does not create the student. If valid, generates the next sequential ID starting at 1 (1, 2, 3...) and prints "201 <id>". IDs increment only on successful creation and are never reused.
2. GET <id>: If the student exists, prints "200 <name> <age>". If not found or previously deleted, prints "404".
3. UPDATE <id> <age>: Validates age (0 to 120 inclusive). If age is invalid, prints "400". If the student does not exist, prints "404". If student exists and age is valid, updates the age and prints "200".
4. DELETE <id>: If the student exists, removes them from the registry and prints "204". If not found, prints "404".`,
    constraints: [
      '1 <= N <= 100',
      'IDs are 1-based sequential integers (1, 2, 3...).',
      'Names are single alphanumeric words without spaces.',
      'Age validation rule: integer in [0, 120]. Invalid age produces 400 immediately.',
      'Deleted IDs are never reused for subsequent CREATE commands.',
    ],
    examples: [
      {
        input: '6\nCREATE Alice 20\nCREATE Bob 22\nGET 1\nUPDATE 1 21\nGET 1\nDELETE 2',
        output: '201 1\n201 2\n200 Alice 20\n200\n200 Alice 21\n204',
        note: 'CREATE returns 201 with generated id. UPDATE returns 200. DELETE returns 204.',
      },
      {
        input: '4\nCREATE Charlie -5\nCREATE Charlie 150\nCREATE Charlie 25\nGET 1',
        output: '400\n400\n201 1\n200 Charlie 25',
        note: 'Invalid ages print 400 and do not consume an ID. The first valid create receives ID 1.',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    input_data = sys.stdin.read().splitlines()
    if not input_data:
        return
    n = int(input_data[0].strip())
    # TODO: Implement in-memory student registry
    
if __name__ == "__main__":
    main()`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        // TODO: Implement in-memory student registry
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    // TODO: Implement in-memory student registry
    return 0;
}`,
    },
    visibleTests: [
      {
        input: '6\nCREATE Alice 20\nCREATE Bob 22\nGET 1\nUPDATE 1 21\nGET 1\nDELETE 2',
        expected: '201 1\n201 2\n200 Alice 20\n200\n200 Alice 21\n204',
      },
      {
        input: '4\nCREATE Charlie -5\nCREATE Charlie 150\nCREATE Charlie 25\nGET 1',
        expected: '400\n400\n201 1\n200 Charlie 25',
      },
      {
        input: '5\nCREATE Dave 19\nDELETE 1\nGET 1\nUPDATE 1 20\nDELETE 1',
        expected: '201 1\n204\n404\n404\n404',
      },
    ],
    hiddenTests: [
      {
        input: '4\nCREATE Eve 0\nCREATE Frank 120\nGET 1\nGET 2',
        expected: '201 1\n201 2\n200 Eve 0\n200 Frank 120',
        category: 'basic',
      },
      {
        input: '6\nCREATE A -1\nCREATE B 0\nCREATE C 120\nCREATE D 121\nUPDATE 1 121\nUPDATE 1 120',
        expected: '400\n201 1\n201 2\n400\n400\n200',
        category: 'edge case',
      },
      {
        input: '4\nGET 1\nUPDATE 1 25\nDELETE 1\nCREATE Z 30',
        expected: '404\n404\n404\n201 1',
        category: 'edge case',
      },
      {
        input: '3\nUPDATE 99 -10\nUPDATE 99 25\nGET 99',
        expected: '400\n404\n404',
        category: 'edge case',
      },
      {
        input: '7\nCREATE X -5\nCREATE First 18\nDELETE 1\nCREATE Y -1\nCREATE Second 22\nGET 1\nGET 2',
        expected: '400\n201 1\n204\n400\n201 2\n404\n200 Second 22',
        category: 'edge case',
      },
      {
        input: '10\nCREATE UserA 10\nCREATE UserB 20\nCREATE UserC 30\nDELETE 2\nCREATE UserD 40\nGET 1\nGET 2\nGET 3\nGET 4\nUPDATE 4 45',
        expected: '201 1\n201 2\n201 3\n204\n201 4\n200 UserA 10\n404\n200 UserC 30\n200 UserD 40\n200',
        category: 'performance',
      },
      {
        input: '5\nCREATE Alpha 50\nUPDATE 1 0\nGET 1\nUPDATE 1 -1\nGET 1',
        expected: '201 1\n200\n200 Alpha 0\n400\n200 Alpha 0',
        category: 'edge case',
      },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 65536,
  },
  {
    id: 'access-log-summary',
    title: 'Access Log Summary',
    difficulty: 'Medium',
    points: 150,
    skills: ['string-parsing', 'aggregation', 'sorting', 'hash-maps'],
    timeEstimateMin: 30,
    description: `You are processing a batch of server access logs.

Input Format:
- The first line contains an integer N representing the number of log lines.
- The subsequent N lines each contain:
  METHOD PATH STATUS
  where METHOD is an HTTP verb (GET, POST, etc.), PATH is a URI endpoint (e.g., /api/users), and STATUS is a 3-digit HTTP status code.

Aggregation Rules:
Aggregate status codes for each unique PATH into three classes:
- 2xx: status codes in [200, 299]
- 4xx: status codes in [400, 499]
- 5xx: status codes in [500, 599]
Status codes outside these ranges (e.g., 3xx redirects or 1xx) are ignored from class counts, but any path present in the log is included.

Output Format:
For each distinct PATH in alphabetical (lexicographical) order, print:
PATH 2xx=a 4xx=b 5xx=c
where a, b, and c are non-negative integer counts.`,
    constraints: [
      '0 <= N <= 200',
      'Paths are case-sensitive strings starting with /',
      'Distinct paths must be sorted in standard lexicographical order (ASCII order).',
    ],
    examples: [
      {
        input: '5\nGET /api/users 200\nPOST /api/users 201\nGET /api/users 404\nGET /health 200\nGET /api/orders 500',
        output: '/api/orders 2xx=0 4xx=0 5xx=1\n/api/users 2xx=2 4xx=1 5xx=0\n/health 2xx=1 4xx=0 5xx=0',
        note: 'Output paths are sorted alphabetically: /api/orders, /api/users, /health.',
      },
      {
        input: '3\nGET /login 401\nPOST /login 403\nPOST /login 200',
        output: '/login 2xx=1 4xx=2 5xx=0',
        note: 'Counts are aggregated across multiple HTTP methods.',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    n = int(lines[0].strip())
    # TODO: Process access logs and print sorted summary
    
if __name__ == "__main__":
    main()`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int n = scanner.nextInt();
        // TODO: Process access logs and print sorted summary
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    // TODO: Process access logs and print sorted summary
    return 0;
}`,
    },
    visibleTests: [
      {
        input: '5\nGET /api/users 200\nPOST /api/users 201\nGET /api/users 404\nGET /health 200\nGET /api/orders 500',
        expected: '/api/orders 2xx=0 4xx=0 5xx=1\n/api/users 2xx=2 4xx=1 5xx=0\n/health 2xx=1 4xx=0 5xx=0',
      },
      {
        input: '3\nGET /login 401\nPOST /login 403\nPOST /login 200',
        expected: '/login 2xx=1 4xx=2 5xx=0',
      },
      {
        input: '4\nGET /items 301\nGET /items 302\nGET /items 200\nGET /items 503',
        expected: '/items 2xx=1 4xx=0 5xx=1',
      },
    ],
    hiddenTests: [
      {
        input: '3\nGET /test 200\nGET /test 400\nGET /test 500',
        expected: '/test 2xx=1 4xx=1 5xx=1',
        category: 'basic',
      },
      {
        input: '5\nGET /a 200\nGET /b 200\nGET /A 200\nGET /a/b 200\nGET /a 404',
        expected: '/A 2xx=1 4xx=0 5xx=0\n/a 2xx=1 4xx=1 5xx=0\n/a/b 2xx=1 4xx=0 5xx=0\n/b 2xx=1 4xx=0 5xx=0',
        category: 'edge case',
      },
      {
        input: '2\nGET /redirect 301\nGET /other 204',
        expected: '/other 2xx=1 4xx=0 5xx=0\n/redirect 2xx=0 4xx=0 5xx=0',
        category: 'edge case',
      },
      {
        input: '4\nGET /down 500\nPOST /down 502\nPUT /down 503\nDELETE /down 504',
        expected: '/down 2xx=0 4xx=0 5xx=4',
        category: 'edge case',
      },
      {
        input: '6\nGET /v1/auth/token 200\nPOST /v1/auth/token 400\nGET /v1/users/profile 200\nGET /v1/users/profile 500\nDELETE /v1/users/profile 204\nGET /v1/auth/token 200',
        expected: '/v1/auth/token 2xx=2 4xx=1 5xx=0\n/v1/users/profile 2xx=2 4xx=0 5xx=1',
        category: 'edge case',
      },
      {
        input: '12\nGET /c 200\nGET /b 404\nGET /a 500\nGET /c 201\nGET /b 401\nGET /a 502\nGET /c 204\nGET /b 403\nGET /a 503\nGET /c 200\nGET /b 400\nGET /a 500',
        expected: '/a 2xx=0 4xx=0 5xx=4\n/b 2xx=0 4xx=4 5xx=0\n/c 2xx=4 4xx=0 5xx=0',
        category: 'performance',
      },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 65536,
  },
  {
    id: 'rate-limiter',
    title: 'Rate Limiter',
    difficulty: 'Medium',
    points: 175,
    skills: ['sliding-window', 'queues', 'algorithms', 'system-design'],
    timeEstimateMin: 35,
    description: `You are implementing a sliding window rate limiter.
The rate limiter allows at most L requests in any sliding window of W seconds.

Input Format:
- Line 1: two integers "L W" (L >= 1, W >= 1).
- Line 2: integer N (number of requests).
- Next N lines: ascending integer timestamps t_1, t_2, ..., t_N (t_i >= 0).

Evaluation Rule:
When a request arrives at timestamp t:
- Count how many previously ALLOWED requests fall strictly within the half-open window (t - W, t].
- That is, an allowed request at timestamp t_prev is inside the window if and only if: t - W < t_prev <= t.
  (A request at exactly t - W has expired and does not count).
- If the count of allowed requests in the window is strictly less than L, the request is ALLOWED, and timestamp t is recorded as allowed.
- Otherwise, the request is DENIED, and timestamp t is NOT recorded.

Output Format:
For each request, print "ALLOWED" or "DENIED" on a new line.`,
    constraints: [
      '1 <= L <= 1000',
      '1 <= W <= 100000',
      '0 <= N <= 200',
      'Timestamps are integers in non-decreasing order: 0 <= t_1 <= t_2 <= ... <= t_N.',
    ],
    examples: [
      {
        input: '3 10\n5\n1\n2\n3\n4\n11',
        output: 'ALLOWED\nALLOWED\nALLOWED\nDENIED\nALLOWED',
        note: 'At t=4, 3 requests exist in (-6, 4] -> DENIED. At t=11, window is (1, 11] so t=1 is expired; count is 2 < 3 -> ALLOWED.',
      },
      {
        input: '1 5\n4\n10\n12\n15\n16',
        output: 'ALLOWED\nDENIED\nALLOWED\nDENIED',
        note: 'At t=15, window is (10, 15] so t=10 is expired. Request is ALLOWED.',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    l, w = map(int, lines[0].split())
    n = int(lines[1])
    # TODO: Process requests using sliding window
    
if __name__ == "__main__":
    main()`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int l = scanner.nextInt();
        int w = scanner.nextInt();
        int n = scanner.nextInt();
        // TODO: Process requests using sliding window
    }
}`,
      cpp: `#include <iostream>
#include <deque>

using namespace std;

int main() {
    int l, w, n;
    if (!(cin >> l >> w >> n)) return 0;
    // TODO: Process requests using sliding window
    return 0;
}`,
    },
    visibleTests: [
      {
        input: '3 10\n5\n1\n2\n3\n4\n11',
        expected: 'ALLOWED\nALLOWED\nALLOWED\nDENIED\nALLOWED',
      },
      {
        input: '1 5\n4\n10\n12\n15\n16',
        expected: 'ALLOWED\nDENIED\nALLOWED\nDENIED',
      },
      {
        input: '2 2\n6\n1\n2\n3\n4\n5\n6',
        expected: 'ALLOWED\nALLOWED\nALLOWED\nALLOWED\nALLOWED\nALLOWED',
      },
    ],
    hiddenTests: [
      {
        input: '2 5\n5\n100\n101\n102\n103\n104',
        expected: 'ALLOWED\nALLOWED\nDENIED\nDENIED\nDENIED',
        category: 'basic',
      },
      {
        input: '2 10\n4\n10\n15\n20\n25',
        expected: 'ALLOWED\nALLOWED\nALLOWED\nALLOWED',
        category: 'edge case',
      },
      {
        input: '1 10\n4\n5\n6\n7\n16',
        expected: 'ALLOWED\nDENIED\nDENIED\nALLOWED',
        category: 'edge case',
      },
      {
        input: '1 1\n5\n1\n2\n3\n4\n5',
        expected: 'ALLOWED\nALLOWED\nALLOWED\nALLOWED\nALLOWED',
        category: 'edge case',
      },
      {
        input: '3 50\n6\n1000000\n1000010\n1000020\n1000030\n1000060\n1000075',
        expected: 'ALLOWED\nALLOWED\nALLOWED\nDENIED\nALLOWED\nALLOWED',
        category: 'edge case',
      },
      {
        input: '5 10\n10\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
        expected: 'ALLOWED\nALLOWED\nALLOWED\nALLOWED\nALLOWED\nDENIED\nDENIED\nDENIED\nDENIED\nDENIED',
        category: 'performance',
      },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 65536,
  },
  {
    id: 'payload-validator',
    title: 'Payload Validator',
    difficulty: 'Easy',
    points: 100,
    skills: ['string-parsing', 'validation', 'error-handling', 'regex'],
    timeEstimateMin: 20,
    description: `You are writing a registration payload validator for a microservice.
The input consists of three lines formatted as key=value:
name=<value>
email=<value>
age=<value>
(The lines may appear in any order).

Validation Rules:
1. name: Must be non-empty (at least one character after "name=").
2. email: Must contain exactly one "@" symbol, and at least one "." (dot) character that appears after the "@". The local part (before @), domain name (between @ and dot), and domain suffix (after dot) must all be non-empty.
3. age: Must be an integer between 18 and 65 inclusive (18 <= age <= 65). Any non-integer, decimal, or out-of-range value is invalid.

Output Format:
- If all three fields pass validation, print: "OK"
- If any fields fail, print: "INVALID <failing_fields>"
  where <failing_fields> is a comma-separated list of the invalid field names strictly in the canonical order: name,email,age (e.g., "INVALID name,email").`,
    constraints: [
      'Exactly three input lines: name=..., email=..., age=...',
      'Lines may appear in any order in standard input.',
      'Output failure fields must always follow canonical order: name,email,age.',
    ],
    examples: [
      {
        input: 'name=Alice Smith\nemail=alice@example.com\nage=28',
        output: 'OK',
        note: 'All fields satisfy constraints.',
      },
      {
        input: 'name=\nemail=bad-email.com\nage=16',
        output: 'INVALID name,email,age',
        note: 'name is empty, email lacks @, age is below 18.',
      },
      {
        input: 'name=Bob\nemail=bob@company.org\nage=70',
        output: 'INVALID age',
        note: 'Only age fails (above 65).',
      },
    ],
    starterCode: {
      python: `import sys

def main():
    lines = sys.stdin.read().splitlines()
    # TODO: Validate name, email, age and output OK or INVALID
    
if __name__ == "__main__":
    main()`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // TODO: Validate name, email, age and output OK or INVALID
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int main() {
    // TODO: Validate name, email, age and output OK or INVALID
    return 0;
}`,
    },
    visibleTests: [
      {
        input: 'name=Alice Smith\nemail=alice@example.com\nage=28',
        expected: 'OK',
      },
      {
        input: 'name=\nemail=bad-email.com\nage=16',
        expected: 'INVALID name,email,age',
      },
      {
        input: 'name=Bob\nemail=bob@company.org\nage=70',
        expected: 'INVALID age',
      },
    ],
    hiddenTests: [
      {
        input: 'name=Charlie\nemail=charlie@com\nage=25',
        expected: 'INVALID email',
        category: 'basic',
      },
      {
        input: 'name=Dave\nemail=dave.work@company\nage=30',
        expected: 'INVALID email',
        category: 'edge case',
      },
      {
        input: 'name=Eve\nemail=eve@@domain.com\nage=40',
        expected: 'INVALID email',
        category: 'edge case',
      },
      {
        input: 'name=Frank\nemail=frank@test.co.uk\nage=18',
        expected: 'OK',
        category: 'edge case',
      },
      {
        input: 'name=Grace\nemail=grace@mail.org\nage=65',
        expected: 'OK',
        category: 'edge case',
      },
      {
        input: 'age=17\nname=Helen\nemail=helen@domain.com',
        expected: 'INVALID age',
        category: 'edge case',
      },
      {
        input: 'name=Ian\nemail=ian@.com\nage=20',
        expected: 'INVALID email',
        category: 'edge case',
      },
      {
        input: 'name=Jack\nemail=jack@site.io\nage=25.5',
        expected: 'INVALID age',
        category: 'edge case',
      },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 65536,
  },
];

// Helper to sanitize Problem for client delivery (strip hiddenTests)
export function sanitizePublicProblem(problem: Problem): PublicProblem {
  const { hiddenTests: _, ...publicProblem } = problem;
  return publicProblem;
}

export function getAllPublicProblems(): PublicProblem[] {
  return PROBLEMS.map(sanitizePublicProblem);
}

export function getPublicProblemById(id: string): PublicProblem | null {
  const problem = PROBLEMS.find((p) => p.id === id);
  if (!problem) return null;
  return sanitizePublicProblem(problem);
}

export function getProblemByIdWithHidden(id: string): Problem | null {
  return PROBLEMS.find((p) => p.id === id) || null;
}
