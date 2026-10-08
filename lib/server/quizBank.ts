/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuizQuestionServer } from '../types.ts';

export const QUIZ_QUESTION_BANK: QuizQuestionServer[] = [
  // 1. Python GIL (Correction: says "pure-Python CPU-bound")
  {
    id: 'py-gil',
    topic: 'Python',
    prompt: 'In CPython, what is the primary architectural impact of the Global Interpreter Lock (GIL) on pure-Python CPU-bound multithreaded programs?',
    options: [
      { id: 'a', text: 'It prevents memory leaks by locking circular references during garbage collection' },
      { id: 'b', text: 'It restricts execution to one native thread per process at a time, preventing CPU-bound scaling across multiple cores' },
      { id: 'c', text: 'It completely disables asynchronous I/O loops and coroutine multitasking' },
      { id: 'd', text: 'It optimizes vector math instructions by serializing GIL cache registers' },
    ],
    correctOptionId: 'b',
    explanation: 'In CPython, the GIL ensures only one thread executes Python bytecode at any given moment, meaning pure-Python CPU-bound workloads do not achieve multi-core concurrency with standard threading (multiprocessing or native extensions must be used).',
    skills: ['python'],
  },

  // 2. Git Leaked Credentials (Correction: must say to rotate the credential)
  {
    id: 'git-revert-creds',
    topic: 'Git',
    prompt: 'A secret API token was accidentally committed and pushed to a shared remote Git repository. Beyond reverting the commit, what is the mandatory immediate remediation step?',
    options: [
      { id: 'a', text: 'Run `git rebase -i` to edit the commit and force-push without notifying team members' },
      { id: 'b', text: 'Immediately revoke/rotate the leaked credential at the provider, as historical git references must be presumed compromised' },
      { id: 'c', text: 'Add the file path to `.gitignore` so subsequent commits stop tracking the file' },
      { id: 'd', text: 'Create an encrypted tag pointing to the parent commit' },
    ],
    correctOptionId: 'b',
    explanation: 'Once pushed, any commit is cloned and cached. Rotating/revoking the credential immediately is essential because git history rewriting alone cannot guarantee the secret was not already copied by malicious scanners.',
    skills: ['git'],
  },

  // 3. SOLID Principles (Correction: pure "Open/Closed Principle" option)
  {
    id: 'solid-ocp',
    topic: 'OOP',
    prompt: 'Which SOLID software design principle dictates that software entities (classes, modules, functions) should be open for extension, but closed for modification?',
    options: [
      { id: 'a', text: 'Single Responsibility Principle' },
      { id: 'b', text: 'Open/Closed Principle' },
      { id: 'c', text: 'Liskov Substitution Principle' },
      { id: 'd', text: 'Interface Segregation Principle' },
    ],
    correctOptionId: 'b',
    explanation: 'The Open/Closed Principle (OCP) states that systems should allow new functionality to be added through extension (e.g. polymorphism, inheritance, plugins) without altering existing verified source code.',
    skills: ['oop'],
  },

  // 4. SQL Isolation Levels (Correction: says "per the ANSI SQL standard")
  {
    id: 'sql-isolation-ansi',
    topic: 'SQL',
    prompt: 'Per the ANSI SQL standard, which transaction isolation level is the minimum required to prevent dirty reads, non-repeatable reads, and phantom reads?',
    options: [
      { id: 'a', text: 'Read Uncommitted' },
      { id: 'b', text: 'Read Committed' },
      { id: 'c', text: 'Repeatable Read' },
      { id: 'd', text: 'Serializable' },
    ],
    correctOptionId: 'd',
    explanation: 'Per the ANSI SQL standard, Serializable is the strictest level and completely protects against dirty reads, non-repeatable (fuzzy) reads, and phantom reads by enforcing serial transaction execution semantics.',
    skills: ['sql'],
  },

  // 5. Cursor Pagination (Correction: no "O(1)" claim for cursor pagination)
  {
    id: 'db-pagination-cursor',
    topic: 'SQL',
    prompt: 'Why is keyset (cursor-based) pagination generally preferred over offset-based pagination (`OFFSET N LIMIT M`) on very large relational datasets?',
    options: [
      { id: 'a', text: 'Cursor pagination avoids having the database engine scan and discard N preceding rows, seeking directly via indexed predicates' },
      { id: 'b', text: 'Cursor pagination completely eliminates database indexing requirements' },
      { id: 'c', text: 'Cursor pagination guarantees O(1) in-memory table lookups across unindexed foreign keys' },
      { id: 'd', text: 'Cursor pagination removes all SQL row-level write locks across transaction tables' },
    ],
    correctOptionId: 'a',
    explanation: 'Offset-based pagination (`OFFSET 1000000`) forces the database to read and discard one million rows before returning M rows. Keyset pagination uses indexed comparison (e.g. `WHERE id > last_seen_id LIMIT M`), avoiding the wasteful scan.',
    skills: ['sql'],
  },

  // 6. Over-mocking Testing (Correction: asks about the risk)
  {
    id: 'testing-overmocking',
    topic: 'Testing',
    prompt: 'What is the primary risk of "over-mocking" internal collaborators and dependencies in unit test suites?',
    options: [
      { id: 'a', text: 'It creates tight coupling to implementation details and can cause tests to pass green while real runtime integration fails' },
      { id: 'b', text: 'It significantly slows down test execution by creating real network sockets' },
      { id: 'c', text: 'It forces the runtime garbage collector to retain thread local variables indefinitely' },
      { id: 'd', text: 'It causes compilation errors when using modern TypeScript transpilers' },
    ],
    correctOptionId: 'a',
    explanation: 'Over-mocking tests the mock configuration rather than actual behavior. If the mocked interface drifts from the real dependency, unit tests continue to pass with false confidence while production systems fail.',
    skills: ['testing'],
  },

  // 7. HTTP Status Codes (Correction: says "semantically intended")
  {
    id: 'http-status-semantics',
    topic: 'REST APIs',
    prompt: 'Which HTTP status code is semantically intended when a client request fails due to business validation errors (e.g., missing payload fields or malformed parameters), rather than missing authentication?',
    options: [
      { id: 'a', text: '401 Unauthorized' },
      { id: 'b', text: '403 Forbidden' },
      { id: 'c', text: '400 Bad Request (or 422 Unprocessable Entity)' },
      { id: 'd', text: '500 Internal Server Error' },
    ],
    correctOptionId: 'c',
    explanation: '400 Bad Request (or RFC 4918 / 9110 422 Unprocessable Entity) is semantically intended for client-side semantic and validation errors, whereas 401 denotes missing/invalid credentials and 403 denotes insufficient permissions.',
    skills: ['rest-semantics'],
  },

  // 8. Python Mutable Default Arguments
  {
    id: 'py-mutable-default',
    topic: 'Python',
    prompt: 'In Python, what happens when a mutable object (like a list `def append_to(item, target=[])`) is used as a default parameter?',
    options: [
      { id: 'a', text: 'A new empty list is instantiated dynamically on every function invocation' },
      { id: 'b', text: 'The default list is instantiated once at function definition time and shared across all calls that omit the parameter' },
      { id: 'c', text: 'Python raises a `TypeError` at module import time' },
      { id: 'd', text: 'The list is automatically converted to an immutable tuple by the bytecode compiler' },
    ],
    correctOptionId: 'b',
    explanation: 'Default argument expressions in Python are evaluated once when the function definition is executed, so the same mutable object instance persists across subsequent invocations.',
    skills: ['python'],
  },

  // 9. REST Idempotency
  {
    id: 'rest-idempotency',
    topic: 'REST APIs',
    prompt: 'According to RFC 9110 HTTP semantics, which set of HTTP methods are strictly specified as idempotent?',
    options: [
      { id: 'a', text: 'POST, PATCH, and CONNECT' },
      { id: 'b', text: 'GET, HEAD, PUT, and DELETE' },
      { id: 'c', text: 'POST, PUT, and DELETE' },
      { id: 'd', text: 'All HTTP methods are idempotent by definition' },
    ],
    correctOptionId: 'b',
    explanation: 'An idempotent method is one where multiple identical requests produce the same intended effect on the server as a single request. GET, HEAD, PUT, and DELETE are idempotent; POST and PATCH are not.',
    skills: ['rest-semantics'],
  },

  // 10. Python Generators & Memory
  {
    id: 'py-generator-yield',
    topic: 'Python',
    prompt: 'What is the primary memory advantage of using a generator with `yield` over returning a fully materialized list for processing 10 million records?',
    options: [
      { id: 'a', text: 'Generators execute on a separate CPU thread automatically' },
      { id: 'b', text: 'Generators evaluate lazily on-demand, holding only the current element in memory instead of the entire dataset' },
      { id: 'c', text: 'Generators store items directly in L1 CPU cache' },
      { id: 'd', text: 'Generators bypass the Python object model completely' },
    ],
    correctOptionId: 'b',
    explanation: 'Generators produce values one at a time using iterator protocol semantics, providing $O(1)$ auxiliary space complexity rather than holding all $N$ items in memory.',
    skills: ['python'],
  },

  // 11. SQL Indexing
  {
    id: 'sql-composite-index',
    topic: 'SQL',
    prompt: 'For a composite B-Tree index defined as `INDEX idx_user_status (user_id, status, created_at)`, which query predicate can fully leverage the index for lookup?',
    options: [
      { id: 'a', text: '`WHERE status = "ACTIVE"` without specifying `user_id`' },
      { id: 'b', text: '`WHERE user_id = 42 AND status = "ACTIVE"`' },
      { id: 'c', text: '`WHERE created_at > NOW()` alone' },
      { id: 'd', text: '`WHERE status = "ACTIVE" ORDER BY created_at`' },
    ],
    correctOptionId: 'b',
    explanation: 'Composite B-Tree indexes follow the leftmost-prefix rule: queries must filter on the leading column (`user_id`) to utilize the index for filtering subsequent columns.',
    skills: ['sql'],
  },

  // 12. Python `is` vs `==`
  {
    id: 'py-is-vs-equals',
    topic: 'Python',
    prompt: 'In Python, what is the precise distinction between the operators `is` and `==`?',
    options: [
      { id: 'a', text: '`is` checks value equivalence; `==` checks pointer identity' },
      { id: 'b', text: '`is` checks memory identity (`id(a) == id(b)`); `==` checks equality of evaluated values (`a.__eq__(b)`)' },
      { id: 'c', text: '`is` is only valid for strings; `==` is valid for numbers' },
      { id: 'd', text: 'There is no difference; they are interchangeable aliases' },
    ],
    correctOptionId: 'b',
    explanation: '`is` checks whether two references point to the exact same object in memory, while `==` calls `__eq__` to check if their values are equal.',
    skills: ['python'],
  },

  // 13. Git Merging vs Rebasing
  {
    id: 'git-rebase-vs-merge',
    topic: 'Git',
    prompt: 'When integrating changes from `main` into a private feature branch, what does `git rebase main` accomplish compared to `git merge main`?',
    options: [
      { id: 'a', text: 'It creates a merge commit with two parents preserving branched history' },
      { id: 'b', text: 'It reapplies feature commits one by one on top of main, producing a linear commit history' },
      { id: 'c', text: 'It squashes all commits in main into a single commit' },
      { id: 'd', text: 'It removes all remote tracking branches permanently' },
    ],
    correctOptionId: 'b',
    explanation: 'Rebasing re-roots the feature branch onto the tip of the target branch by replaying each commit, producing a clean, linear project history without merge bubbles.',
    skills: ['git'],
  },

  // 14. OOP Polymorphism
  {
    id: 'oop-polymorphism',
    topic: 'OOP',
    prompt: 'In object-oriented programming, how does runtime (dynamic) polymorphism benefit application architecture?',
    options: [
      { id: 'a', text: 'It enables caller code to operate on abstract interfaces while executing specific subclass behavior at runtime' },
      { id: 'b', text: 'It prevents subclasses from overriding base class method definitions' },
      { id: 'c', text: 'It increases compile times by forcing pre-allocated class layouts' },
      { id: 'd', text: 'It restricts objects to a single global instance' },
    ],
    correctOptionId: 'a',
    explanation: 'Polymorphism decouples client code from concrete implementations by allowing different objects to respond to the same interface or method call appropriately.',
    skills: ['oop'],
  },

  // 15. Testing Test Pyramid
  {
    id: 'testing-pyramid',
    topic: 'Testing',
    prompt: 'According to the standard Test Pyramid philosophy, what ratio of tests is generally recommended for an efficient and maintainable CI test suite?',
    options: [
      { id: 'a', text: 'Mostly manual QA tests, few automated tests' },
      { id: 'b', text: 'A large base of fast, isolated unit tests, a moderate layer of integration tests, and a small apex of end-to-end tests' },
      { id: 'c', text: '100% end-to-end browser tests to guarantee user realism' },
      { id: 'd', text: 'Exclusively integration tests that run against live third-party production APIs' },
    ],
    correctOptionId: 'b',
    explanation: 'The Test Pyramid emphasizes fast, deterministic unit tests at the base for rapid developer feedback, balanced by integration tests for contract verification and minimal E2E tests for smoke testing.',
    skills: ['testing'],
  },

  // 16. Python Exception Handling
  {
    id: 'py-try-else-finally',
    topic: 'Python',
    prompt: 'In Python `try ... except ... else ... finally` blocks, when does the `else` clause execute?',
    options: [
      { id: 'a', text: 'Only when an exception was caught and handled in an `except` block' },
      { id: 'b', text: 'Only when NO exceptions were raised inside the `try` block' },
      { id: 'c', text: 'Whenever `finally` fails to complete' },
      { id: 'd', text: 'Always, right before the `finally` block executes' },
    ],
    correctOptionId: 'b',
    explanation: 'The `else` block in a Python try construct runs only if the `try` suite finishes without raising any exceptions, keeping non-risky code out of the `try` scope.',
    skills: ['python'],
  },

  // 17. SQL Transactions ACID
  {
    id: 'sql-acid-atomicity',
    topic: 'SQL',
    prompt: 'In database ACID properties, what does "Atomicity" guarantee during transaction execution?',
    options: [
      { id: 'a', text: 'Concurrent transactions do not interfere with one another' },
      { id: 'b', text: 'All operations in the transaction succeed completely, or all changes are rolled back with no partial application' },
      { id: 'c', text: 'Committed data will survive power failures through write-ahead logging' },
      { id: 'd', text: 'Database constraints and foreign keys are never verified until server reboot' },
    ],
    correctOptionId: 'b',
    explanation: 'Atomicity ensures "all or nothing" execution: if any statement in the transaction fails, the entire transaction is aborted and rolled back to its initial state.',
    skills: ['sql'],
  },

  // 18. REST Versioning & Headers
  {
    id: 'rest-content-negotiation',
    topic: 'REST APIs',
    prompt: 'What is the role of the HTTP `Accept` header sent by an API client?',
    options: [
      { id: 'a', text: 'It declares the MIME media type of the payload in the request body' },
      { id: 'b', text: 'It informs the server which response media types (e.g. `application/json`, `application/xml`) the client is able to process' },
      { id: 'c', text: 'It authorizes the request using bearer token credentials' },
      { id: 'd', text: 'It specifies CORS origins for cross-domain preflight checks' },
    ],
    correctOptionId: 'b',
    explanation: 'The `Accept` request header is used for content negotiation to indicate what media types the client expects in the server response, whereas `Content-Type` describes the request payload.',
    skills: ['rest-semantics'],
  },

  // 19. Python Context Managers
  {
    id: 'py-context-manager',
    topic: 'Python',
    prompt: 'Which two dunder (magic) methods must a Python class implement to support the `with` statement protocol?',
    options: [
      { id: 'a', text: '`__start__` and `__stop__`' },
      { id: 'b', text: '`__enter__` and `__exit__`' },
      { id: 'c', text: '`__open__` and `__close__`' },
      { id: 'd', text: '`__begin__` and `__commit__`' },
    ],
    correctOptionId: 'b',
    explanation: 'Context managers implement `__enter__(self)` to acquire resources and `__exit__(self, exc_type, exc_val, exc_tb)` to guarantee cleanup, even if an exception occurs.',
    skills: ['python'],
  },

  // 20. Git Detached HEAD
  {
    id: 'git-detached-head',
    topic: 'Git',
    prompt: 'What does a "detached HEAD" state in Git mean?',
    options: [
      { id: 'a', text: 'The local repository has lost connection to the remote origin server' },
      { id: 'b', text: 'HEAD points directly to a specific commit hash rather than to a named branch reference' },
      { id: 'c', text: 'The working directory has uncommitted merge conflicts' },
      { id: 'd', text: 'The `.git` directory index has become corrupt' },
    ],
    correctOptionId: 'b',
    explanation: 'In a detached HEAD state, checkout is pointing directly to a specific commit. New commits made in this state are not on any branch and can become orphaned if you switch branches without creating a new branch reference.',
    skills: ['git'],
  },
];
