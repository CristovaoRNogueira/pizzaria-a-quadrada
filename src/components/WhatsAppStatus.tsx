import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, MessageCircle, QrCode, RefreshCw } from "lucide-react";
import { whatsappService } from "../services/whatsapp";

const WhatsAppStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Verificar a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const sessionStatus = await whatsappService.getSessionStatus();
      setStatus(sessionStatus);
      setIsConnected(sessionStatus === "CONNECTED");

      if (sessionStatus === "QRCODE") {
        const qr = await whatsappService.getQRCode();
        setQrCode(qr);
      } else {
        setQrCode(null);
      }
    } catch (error) {
      setIsConnected(false);
      setStatus("DISCONNECTED");
    }
  };

  const handleReconnect = async () => {
    setIsLoading(true);
    try {
      await whatsappService.startSession();
      await checkStatus();
    } catch (error) {
      console.error("Erro ao reconectar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "CONNECTED":
        return "text-green-600";
      case "QRCODE":
        return "text-yellow-600";
      case "DISCONNECTED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "CONNECTED":
        return "WhatsApp Conectado";
      case "QRCODE":
        return "Aguardando QR Code";
      case "DISCONNECTED":
        return "WhatsApp Desconectado";
      default:
        return "Status Desconhecido";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          <div>
            <h3 className="font-semibold text-gray-800">Status WhatsApp</h3>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {status === "QRCODE" && (
            <button
              onClick={() => setShowQR(!showQR)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <QrCode className="h-4 w-4" />
              <span>Ver QR</span>
            </button>
          )}

          <button
            onClick={handleReconnect}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Reconectar</span>
          </button>
        </div>
      </div>

      {showQR && qrCode && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-3">
            Escaneie o QR Code com seu WhatsApp para conectar:
          </p>
          <img
            src={qrCode}
            alt="QR Code WhatsApp"
            className="mx-auto max-w-xs"
          />
        </div>
      )}

      {!isConnected && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <p className="text-yellow-800">
            <strong>Atenção:</strong> WhatsApp não conectado. As mensagens serão
            enviadas via WhatsApp Web (abertura manual).
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatsAppStatus;
