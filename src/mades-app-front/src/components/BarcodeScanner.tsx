import React from 'react'
import { X, Camera } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType, BarcodeFormat } from '@zxing/library'
import type { IScannerControls } from '@zxing/browser'

// Native BarcodeDetector API (Chrome/Edge/Safari)
interface NativeBarcode { rawValue: string; format: string }
interface NativeBarcodeDetector {
  detect(source: HTMLVideoElement): Promise<NativeBarcode[]>
}
declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => NativeBarcodeDetector
  }
}

const ZXING_HINTS = new Map<DecodeHintType, unknown>([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.QR_CODE,
    ],
  ],
])

type Props = {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export const BarcodeScanner = ({ onDetected, onClose }: Props) => {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const controlsRef = React.useRef<IScannerControls | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const rafRef = React.useRef<number>(0)
  const detectedRef = React.useRef(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    function handleError(e: unknown) {
      if (e instanceof Error && e.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Habilítalo en la configuración del navegador.')
      } else {
        setError('No se pudo acceder a la cámara.')
      }
      setIsLoading(false)
    }

    async function startNative() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        })
        streamRef.current = stream
        const video = videoRef.current!
        video.srcObject = stream
        await video.play()
        setIsLoading(false)

        const detector = new window.BarcodeDetector!({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'],
        })

        const scan = async () => {
          if (detectedRef.current) return
          try {
            const results = await detector.detect(video)
            if (results.length > 0) {
              const value = results[0].rawValue
              console.log('[BarcodeScanner] Detectado:', value, '|', results[0].format)
              detectedRef.current = true
              onDetected(value)
              return
            }
          } catch {
            // no barcode in frame — continue
          }
          rafRef.current = requestAnimationFrame(() => { void scan() })
        }

        rafRef.current = requestAnimationFrame(() => { void scan() })
      } catch (e) {
        handleError(e)
      }
    }

    async function startZxing() {
      try {
        const reader = new BrowserMultiFormatReader(ZXING_HINTS)
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (devices.length === 0) {
          setError('No se encontró ninguna cámara en este dispositivo.')
          setIsLoading(false)
          return
        }

        const deviceId = devices[devices.length - 1].deviceId

        controlsRef.current = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result) => {
            if (result && !detectedRef.current) {
              const value = result.getText()
              console.log('[BarcodeScanner] Detectado (ZXing):', value)
              detectedRef.current = true
              onDetected(value)
            }
          }
        )

        setIsLoading(false)
      } catch (e) {
        handleError(e)
      }
    }

    if (typeof window.BarcodeDetector !== 'undefined') {
      void startNative()
    } else {
      void startZxing()
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      controlsRef.current?.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [onDetected])

  const [manualMode, setManualMode] = React.useState(false)
  const [manualValue, setManualValue] = React.useState('')

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    const value = manualValue.trim()
    if (!value) return
    console.log('[BarcodeScanner] Manual:', value)
    onDetected(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-black shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <Camera size={16} />
            <span className="text-sm font-medium">
              {manualMode ? 'Ingresar código manualmente' : 'Escanear código de barras'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {manualMode ? (
          /* ── Manual input fallback ── */
          <form onSubmit={submitManual} className="bg-gray-900 px-4 pb-5 pt-4">
            <p className="mb-3 text-xs text-gray-400">
              Ingresa el código de barras del producto:
            </p>
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="Ej: 7702061412303"
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setManualMode(false)}
                className="flex-1 rounded-lg border border-gray-600 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                Usar cámara
              </button>
              <button
                type="submit"
                disabled={!manualValue.trim()}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Buscar
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* ── Camera feed ── */}
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} className="h-full w-full object-cover" />

              {!error && !isLoading && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-20 w-56 rounded border-2 border-blue-400">
                    <span className="absolute -top-0.5 -left-0.5 block h-4 w-4 rounded-tl border-t-2 border-l-2 border-blue-300" />
                    <span className="absolute -top-0.5 -right-0.5 block h-4 w-4 rounded-tr border-t-2 border-r-2 border-blue-300" />
                    <span className="absolute -bottom-0.5 -left-0.5 block h-4 w-4 rounded-bl border-b-2 border-l-2 border-blue-300" />
                    <span className="absolute -bottom-0.5 -right-0.5 block h-4 w-4 rounded-br border-b-2 border-r-2 border-blue-300" />
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 animate-pulse bg-blue-400/70" />
                  </div>
                </div>
              )}

              {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-300">
                  Iniciando cámara...
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Ingresar código manualmente
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
              <p className="text-xs text-gray-400">
                Apunta la cámara al código de barras
              </p>
              <button
                type="button"
                onClick={() => setManualMode(true)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Ingresar manualmente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
