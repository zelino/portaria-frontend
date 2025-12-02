"use client";

import { Button } from "@/components/ui/button";
import { Camera, FlipHorizontal, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel?: () => void;
  initialImage?: string | null;
  allowMultiple?: boolean; // Permite múltiplas capturas sem resetar
}

type FacingMode = "user" | "environment";

export function WebcamCapture({
  onCapture,
  onCancel,
  initialImage,
  allowMultiple = false,
}: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    initialImage || null
  );
  const [facingMode, setFacingMode] = useState<FacingMode>("environment"); // Padrão: traseira

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      onCapture(imageSrc);

      // Se allowMultiple, resetar após um pequeno delay para permitir nova captura
      if (allowMultiple) {
        setTimeout(() => {
          setCapturedImage(null);
        }, 500);
      }
    }
  }, [onCapture, allowMultiple]);

  const retry = () => {
    setCapturedImage(null);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setCapturedImage(null); // Resetar imagem ao trocar câmera
  };

  if (capturedImage && !allowMultiple) {
    return (
      <div className="space-y-4">
        <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
          {/* Botão para alternar câmera mesmo com imagem capturada */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              toggleCamera();
              retry();
            }}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-0"
            aria-label={`Alternar para câmera ${
              facingMode === "user" ? "traseira" : "frontal"
            }`}
          >
            <FlipHorizontal className="h-4 w-4 mr-1" />
            {facingMode === "user" ? "Traseira" : "Frontal"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={retry}
            variant="outline"
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
          {onCancel && (
            <Button type="button" onClick={onCancel} variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
          videoConstraints={{
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
        />
        {/* Botão para alternar câmera */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={toggleCamera}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-0"
          aria-label={`Alternar para câmera ${
            facingMode === "user" ? "traseira" : "frontal"
          }`}
        >
          <FlipHorizontal className="h-4 w-4 mr-1" />
          {facingMode === "user" ? "Traseira" : "Frontal"}
        </Button>
      </div>
      <Button type="button" onClick={capture} className="w-full">
        <Camera className="mr-2 h-4 w-4" />
        Capturar Foto
      </Button>
    </div>
  );
}
