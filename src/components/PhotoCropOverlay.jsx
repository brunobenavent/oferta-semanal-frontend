import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Crop, ZoomIn, ZoomOut } from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────── */

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    // No crossOrigin — images are same-origin via Vite proxy (dev) or same server (prod)
    // Using crossOrigin on proxied requests can taint the canvas
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });

const getCroppedBlob = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
  });
};

/* ─── Component ───────────────────────────────────────────────── */

export default function PhotoCropOverlay({ imageUrl, initialZoom = 1, onCancel, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Safety: ensure processing resets on unmount + abort detection
  const abortedRef = useRef(false);
  useEffect(() => {
    return () => { setProcessing(false); };
  }, []);

  const onCropChange = useCallback((location) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCancel = () => {
    setProcessing(false);
    abortedRef.current = true;
    onCancel();
  };
  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    abortedRef.current = false;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageUrl, croppedAreaPixels);
      if (abortedRef.current) return;
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      onCropComplete(file);
    } catch (err) {
      console.error('[Crop] Error cropping image:', err);
      alert('Error al procesar la imagen');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(0,0,0,0.85)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Crop size={20} />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>Ajustar foto</span>
        </div>
        <button
          onClick={handleCancel}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Cancelar
        </button>
      </div>

      {/* Cropper */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
        />
      </div>

      {/* Zoom + Apply */}
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <ZoomOut size={20} color="#fff" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#2b6b4b' }}
        />
        <ZoomIn size={20} color="#fff" />

        <button
          onClick={handleApply}
          disabled={processing || !croppedAreaPixels}
          style={{
            background: processing ? '#999' : '#2b6b4b',
            border: 'none',
            color: '#fff',
            padding: '10px 28px',
            borderRadius: 8,
            cursor: processing ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.9375rem',
            whiteSpace: 'nowrap',
            marginLeft: 8,
          }}
        >
          {processing ? 'Procesando...' : 'Aplicar'}
        </button>
      </div>
    </div>
  );
}
