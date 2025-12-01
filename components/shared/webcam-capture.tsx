"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import Webcam from "react-webcam";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel?: () => void;
  initialImage?: string | null;
}

export function WebcamCapture({
  onCapture,
  onCancel,
  initialImage,
}: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    initialImage || null
  );

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      onCapture(imageSrc);
    }
  }, [onCapture]);

  const retry = () => {
    setCapturedImage(null);
  };

  if (capturedImage) {
    return (
      <div className="space-y-4">
        <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={retry} variant="outline" className="flex-1">
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
        />
      </div>
      <Button type="button" onClick={capture} className="w-full">
        <Camera className="mr-2 h-4 w-4" />
        Capturar Foto
      </Button>
    </div>
  );
}
