import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';
interface Props { children: ReactNode; resetKey?: string; /** Start in the caught state with this error (component-library demo), without throwing. */ demoError?: Error }
interface State { error: Error | null }
/** Catches render errors per route so one broken page never blanks the app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: this.props.demoError ?? null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[page error]', error, info.componentStack); }
  componentDidUpdate(prev: Props) { if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null }); }
  render() {
    if (!this.state.error) return this.props.children;
    return (<div className="container page"><div className="errbox" role="alert"><h1>This page hit an error</h1><pre className="xs">{this.state.error.message}</pre><div className="row wrap"><button type="button" className="btn btn-outline btn-sm" onClick={() => this.setState({ error: null })}>Try again</button><a className="btn btn-ghost btn-sm" href="#/">Hub</a></div></div></div>);
  }
}
