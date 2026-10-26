import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto border border-rose-100">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Ha ocurrido un detalle al cargar la vista
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 text-left overflow-auto max-h-32">
              {this.state.error?.message ||
                'Error desconocido en el renderizado'}
            </p>

            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#EA580C] hover:bg-[#D9480F] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
