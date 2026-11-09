/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'muvaffaqiyat' | 'ogohlantirish' | 'xato' | 'malumot';
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => {
        let borderClass = 'border-cyan-500/50 bg-slate-900/95 text-cyan-200';
        let icon = <Info className="w-4 h-4 text-cyan-400 shrink-0" />;

        if (toast.type === 'muvaffaqiyat') {
          borderClass = 'border-emerald-500/60 bg-emerald-950/90 text-emerald-200';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'ogohlantirish') {
          borderClass = 'border-amber-500/60 bg-amber-950/90 text-amber-200';
          icon = <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />;
        } else if (toast.type === 'xato') {
          borderClass = 'border-rose-500/60 bg-rose-950/90 text-rose-200';
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border shadow-xl backdrop-blur-md text-xs transition-all animate-in slide-in-from-right-5 duration-200 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="font-medium">{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md hover:bg-black/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
