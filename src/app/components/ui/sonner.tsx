import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react';

import { UI_FONT_STACK } from '../../tokens/typography';

export function AppToaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-center"
      closeButton
      visibleToasts={4}
      gap={10}
      offset={20}
      duration={4000}
      className="p2p-toaster"
      toastOptions={{
        classNames: {
          toast: 'p2p-toast',
          title: 'p2p-toast-title',
          description: 'p2p-toast-description',
          closeButton: 'p2p-toast-close',
          actionButton: 'p2p-toast-action',
          cancelButton: 'p2p-toast-cancel',
        },
      }}
      icons={{
        success: <CheckCircle2 size={16} strokeWidth={2.25} color="#1FA97A" aria-hidden />,
        error: <AlertCircle size={16} strokeWidth={2.25} color="#F04438" aria-hidden />,
        warning: <AlertTriangle size={16} strokeWidth={2.25} color="#F79009" aria-hidden />,
        info: <Info size={16} strokeWidth={2.25} color="#667085" aria-hidden />,
        loading: <Loader2 size={16} strokeWidth={2.25} color="#667085" className="p2p-toast-spinner" aria-hidden />,
        close: <X size={14} strokeWidth={2.25} aria-hidden />,
      }}
      style={
        {
          '--width': '380px',
          fontFamily: UI_FONT_STACK,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
