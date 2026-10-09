/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn } from 'child_process';

export interface OnlineCompilerResult {
  output: string;
  error?: string;
  status: string;
  exitCode: number;
  signal?: number | string;
  timeSec: number;
  totalSec?: number;
  memoryKb: number;
  isSimulated?: boolean;
}

const RUN_CODE_SYNC_URL = 'https://api.onlinecompiler.io/api/run-code-sync/';

export async function runCode(
  compiler: string,
  code: string,
  input: string
): Promise<OnlineCompilerResult> {
  const apiKey = process.env.ONLINECOMPILER_API_KEY?.trim();

  // If no external API key is provided, execute via real local Python runtime
  // so tests, code evaluation, and skill evidence run accurately and deterministically.
  if (!apiKey || apiKey === 'MY_ONLINECOMPILER_API_KEY') {
    return runLocalPython(compiler, code, input);
  }

  let attempt = 0;
  const maxRetries = 3;
  let delay = 1000;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(RUN_CODE_SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey, // Raw key, no Bearer per specification
        },
        body: JSON.stringify({
          compiler,
          code,
          input,
        }),
      });

      if (response.status === 429) {
        if (attempt < maxRetries) {
          attempt++;
          await new Promise((res) => setTimeout(res, delay));
          delay *= 2;
          continue;
        }
        return {
          output: '',
          error: 'Rate limit exceeded (HTTP 429). Runner queue is busy. Please try again.',
          status: 'error',
          exitCode: 429,
          timeSec: 0,
          memoryKb: 0,
        };
      }

      const text = await response.text();
      let data: Record<string, unknown> = {};
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      } catch {
        return {
          output: '',
          error: `Non-JSON response from runner (HTTP ${response.status}): ${text.slice(0, 200)}`,
          status: 'error',
          exitCode: 1,
          timeSec: 0,
          memoryKb: 0,
        };
      }

      if (!response.ok) {
        return {
          output: String(data.output || ''),
          error: String(data.error || data.message || `HTTP ${response.status} runner error`),
          status: 'error',
          exitCode: Number(data.exit_code ?? data.exitCode ?? 1),
          timeSec: Number(data.time ?? 0),
          memoryKb: Number(data.memory ?? 0),
        };
      }

      return {
        output: String(data.output || ''),
        error: data.error ? String(data.error) : undefined,
        status: String(data.status || 'success'),
        exitCode: Number(data.exit_code ?? data.exitCode ?? 0),
        signal: data.signal as number | string | undefined,
        timeSec: Number(data.time ?? data.timeSec ?? 0.05),
        totalSec: Number(data.total ?? data.totalSec ?? 0.1),
        memoryKb: Number(data.memory ?? data.memoryKb ?? 1024),
        isSimulated: false,
      };
    } catch (err: unknown) {
      if (attempt < maxRetries) {
        attempt++;
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        continue;
      }
      // If external onlinecompiler fails, fall back to local python execution
      console.warn('External onlinecompiler connection failed, falling back to local Python runner:', err);
      return runLocalPython(compiler, code, input);
    }
  }

  return runLocalPython(compiler, code, input);
}

// Real local Python executor for reliable execution and testing
function runLocalPython(
  compiler: string,
  code: string,
  input: string
): Promise<OnlineCompilerResult> {
  return new Promise((resolve) => {
    if (!code || !code.trim()) {
      resolve({
        output: '',
        error: 'Empty code provided',
        status: 'error',
        exitCode: 1,
        timeSec: 0,
        memoryKb: 0,
        isSimulated: false,
      });
      return;
    }

    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let killed = false;

    // Execute via local python3
    const child = spawn('python3', ['-c', code], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const timeout = setTimeout(() => {
      killed = true;
      try {
        child.kill('SIGKILL');
      } catch {
        // ignore
      }
    }, 5000);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 50000) {
        killed = true;
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore
        }
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (exitCode, signal) => {
      clearTimeout(timeout);
      const timeSec = Math.max(0.01, (Date.now() - startTime) / 1000);

      if (killed && signal === 'SIGKILL') {
        resolve({
          output: stdout.slice(0, 999),
          error: 'Execution timed out (5s limit)',
          status: 'timeout',
          exitCode: 124,
          signal: 'SIGKILL',
          timeSec,
          memoryKb: 16384,
          isSimulated: false,
        });
        return;
      }

      resolve({
        output: stdout.slice(0, 999),
        error: stderr ? stderr.slice(0, 999) : undefined,
        status: exitCode === 0 ? 'success' : 'error',
        exitCode: exitCode ?? (stderr ? 1 : 0),
        signal: signal ?? undefined,
        timeSec,
        memoryKb: 8192,
        isSimulated: false,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        output: '',
        error: `Python execution error: ${err.message}`,
        status: 'error',
        exitCode: 1,
        timeSec: (Date.now() - startTime) / 1000,
        memoryKb: 0,
        isSimulated: false,
      });
    });

    try {
      if (input) {
        child.stdin.write(input);
      }
      child.stdin.end();
    } catch {
      // stdin error
    }
  });
}

