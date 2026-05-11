// Route-level error boundary. The demo's `findByKey` throws on an unknown
// unit key (which can happen if a deep-link carries a stale key, or if a
// future widget mounts before its data is ready). Catching here keeps a
// bad slice from blanking the entire app.

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[uf-demo] render error', error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="mx-auto mt-12 max-w-xl rounded-lg border p-6"
          style={{
            background: 'var(--uf-card)',
            borderColor: 'var(--uf-border)',
            color: 'var(--uf-fg)',
          }}
        >
          <p className="uf-eyebrow" style={{ color: 'var(--uf-accent)' }}>
            something broke
          </p>
          <p className="mt-2 text-sm">
            A widget failed to render. Reset by{' '}
            <a href="#/" className="underline" style={{ color: 'var(--uf-fg)' }}>
              going home
            </a>
            .
          </p>
          <pre
            className="mono mt-3 overflow-x-auto rounded px-3 py-2 text-xs"
            style={{ background: 'var(--uf-code-bg)', color: 'var(--uf-muted)' }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
