import { QRCodeSVG } from "qrcode.react";
import { X, Smartphone } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const APP_URL = "https://id-preview--0ce6d81e-e6c8-40df-b777-786fd3848290.lovable.app";

export function MobileQRDialog({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-[340px] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground">Login on Mobile</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Scan this QR code with your phone camera to open the app
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={APP_URL}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">
              Or open this URL on your phone:
            </p>
            <code className="text-[10px] bg-accent/50 border border-border rounded-lg px-3 py-1.5 block text-foreground break-all">
              {APP_URL}
            </code>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Your session will sync automatically
          </p>
        </div>
      </div>
    </div>
  );
}
