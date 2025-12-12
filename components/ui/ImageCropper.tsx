import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './Shared';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
}

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

    const onCropChange = (location: { x: number; y: number }) => {
        setCrop(location);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteCallback = useCallback(
        (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const createCroppedImage = async () => {
        if (!croppedAreaPixels) return;

        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = image;

        await new Promise((resolve) => {
            img.onload = resolve;
        });

        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            img,
            croppedAreaPixels.x * scaleX,
            croppedAreaPixels.y * scaleY,
            croppedAreaPixels.width * scaleX,
            croppedAreaPixels.height * scaleY,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        return new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleApply = async () => {
        const croppedImage = await createCroppedImage();
        if (croppedImage) {
            onCropComplete(croppedImage);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-space-dark border border-space-neon p-6 rounded-lg">
                <h3 className="text-2xl font-display font-bold text-white mb-4">Ajustar Imagem de Capa</h3>

                {/* Cropper Area */}
                <div className="relative w-full h-96 bg-black rounded-md mb-6">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={16 / 9}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteCallback}
                    />
                </div>

                {/* Zoom Slider */}
                <div className="mb-6">
                    <label className="block text-sm font-mono text-space-muted mb-2">ZOOM</label>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-space-steel rounded-lg appearance-none cursor-pointer accent-space-neon"
                    />
                </div>

                {/* Instructions */}
                <p className="text-sm text-space-muted font-mono mb-6">
                    Arraste a imagem para reposicionar. Use o slider para dar zoom.
                </p>

                {/* Actions */}
                <div className="flex gap-4 justify-end">
                    <Button variant="secondary" onClick={onCancel}>
                        CANCELAR
                    </Button>
                    <Button variant="primary" onClick={handleApply}>
                        APLICAR
                    </Button>
                </div>
            </div>
        </div>
    );
};
