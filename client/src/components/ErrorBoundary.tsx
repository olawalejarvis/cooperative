import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    const isDev = import.meta.env.MODE === 'development';
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ color: 'red', padding: 24, background: '#fff3f3', border: '1px solid #f5c2c7', borderRadius: 8, maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.</p>
          <button style={{ margin: '16px 0', padding: '8px 20px', borderRadius: 4, border: 'none', background: '#d32f2f', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => window.location.reload()}>Reload Page</button>
          {isDev && this.state.error && (
            <pre style={{ textAlign: 'left', background: '#f8d7da', color: '#721c24', padding: 12, borderRadius: 4, overflowX: 'auto' }}>
              {String(this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
