'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
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
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in boundary [${this.props.name || 'Generic'}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border border-red-200 bg-red-50/50 backdrop-blur-md rounded-2xl p-6 text-center max-w-lg mx-auto my-4 shadow-md">
          <CardHeader className="p-0 flex flex-col items-center">
            <div className="bg-red-50 p-3 rounded-2xl text-red-500 border border-red-200 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-black uppercase text-[#041F1C] tracking-tight">
              Section Error
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase text-[#041F1C]/40 tracking-wider">
              {this.props.name || 'Component'} failed to load
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4 space-y-4">
            <p className="text-xs font-bold text-[#041F1C]/65 leading-relaxed bg-white/60 p-3 rounded-xl border border-white">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <Button
              onClick={this.handleReset}
              className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:brightness-110 text-white font-black uppercase tracking-widest rounded-xl shadow-md h-10 text-xs flex items-center justify-center gap-1.5 border-none"
            >
              <RefreshCcw size={12} />
              Retry Component
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
