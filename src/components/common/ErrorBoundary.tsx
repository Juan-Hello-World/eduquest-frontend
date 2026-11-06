import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Algo salió mal en la interfaz</h1>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Ocurrió un error inesperado al mostrar esta pantalla. Puedes recargar la aplicación de forma segura.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/dashboard')}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            Volver al inicio
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}