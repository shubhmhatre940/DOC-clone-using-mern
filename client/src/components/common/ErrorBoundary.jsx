import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Standard React Error Boundary component.
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Compact inline fallback for sidebars / modular widgets
      if (this.props.compact) {
        return (
          <div className="p-3 my-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{this.props.title || 'Component encountered an issue'}</span>
            </div>
            <p className="text-gray-600 truncate">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={this.handleReset}
              className="mt-1 self-start inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 transition text-[11px] font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        );
      }

      // Full screen or full container fallback
      return (
        <div className="min-h-[240px] flex flex-col items-center justify-center p-6 text-center bg-gray-50/70 rounded-xl border border-gray-200 m-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            {this.props.title || 'Something went wrong in this section'}
          </h2>
          <p className="text-sm text-gray-500 max-w-md mb-4">
            {this.state.error?.message || 'An unexpected error occurred. Your changes in the main document are safe.'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300 transition cursor-pointer"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
