/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 text-red-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-950">
                {this.props.fallbackTitle || 'This section had a problem'}
              </h3>
              <p className="mt-1 text-xs text-red-700 leading-relaxed">
                {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
              </p>
              <button
                type="button"
                onClick={this.handleReset}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-100 hover:bg-red-200 px-3 py-1 text-xs font-semibold text-red-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
