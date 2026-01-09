'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MediaItem {
  id: string;
  type: 'url' | 'file';
  url?: string;
  file?: File;
  preview?: string;
  urlError?: string;
}

interface MediaUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export default function MediaUpload({ value, onChange, maxFiles = 10, disabled = false }: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => 
    value.map((url, index) => ({
      id: `url-${index}`,
      type: 'url' as const,
      url,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleMediaChange = useCallback((items: MediaItem[]) => {
    setMediaItems(items);
    // Extract URLs from items (only URLs are sent to backend for now)
    // Files are kept for preview only until upload API is implemented
    // Only include URLs that are valid and have no errors
    const urls = items
      .map(item => {
        if (item.type === 'url' && item.url && item.url.trim() !== '' && !item.urlError) {
          return item.url.trim();
        }
        // Files are kept for preview but not sent as URLs yet
        // TODO: Implement file upload API and convert files to URLs
        return null;
      })
      .filter((url): url is string => url !== null);
    
    onChange(urls);
  }, [onChange]);

  const handleAddUrl = () => {
    if (mediaItems.length >= maxFiles) return;
    const newItem: MediaItem = {
      id: `url-${Date.now()}`,
      type: 'url',
      url: '',
    };
    handleMediaChange([...mediaItems, newItem]);
  };

  const validateUrl = (url: string): string | null => {
    if (!url || url.trim() === '') {
      return null; // Empty is allowed (optional field)
    }
    
    try {
      const urlObj = new URL(url.trim());
      // Check if it's HTTP/HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'L\'URL doit commencer par http:// ou https://';
      }
      // Basic image extension check (optional, but helpful)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
      const pathname = urlObj.pathname.toLowerCase();
      if (!imageExtensions.some(ext => pathname.endsWith(ext)) && !pathname.includes('image')) {
        // Warning only, not blocking
        return null;
      }
      return null;
    } catch {
      return 'URL invalide. Format attendu: https://example.com/image.jpg';
    }
  };

  const handleUrlChange = (id: string, url: string) => {
    const urlError = validateUrl(url);
    const updated = mediaItems.map(item => 
      item.id === id ? { ...item, url, urlError: urlError || undefined } : item
    );
    handleMediaChange(updated);
  };

  const handleRemove = (id: string) => {
    const item = mediaItems.find(i => i.id === id);
    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }
    const updated = mediaItems.filter(item => item.id !== id);
    handleMediaChange(updated);
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newFiles: MediaItem[] = Array.from(files)
      .slice(0, maxFiles - mediaItems.length)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        type: 'file' as const,
        file,
        preview: URL.createObjectURL(file),
      }));

    if (newFiles.length > 0) {
      handleMediaChange([...mediaItems, ...newFiles]);
    }
  }, [mediaItems, maxFiles, handleMediaChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-gray-700">Médias</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || mediaItems.length >= maxFiles}
            className="border-gray-300 hover:bg-gray-50 text-sm"
            aria-label="Téléverser des fichiers"
          >
            <Upload className="h-4 w-4 mr-1" aria-hidden="true" />
            Téléverser
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddUrl}
            disabled={disabled || mediaItems.length >= maxFiles}
            className="border-gray-300 hover:bg-gray-50 text-sm"
            aria-label="Ajouter une URL"
          >
            <Link2 className="h-4 w-4 mr-1" aria-hidden="true" />
            URL
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          aria-label="Sélectionner des fichiers image"
        />
      </div>

      {/* Drag & Drop Zone */}
      {mediaItems.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Zone de téléversement de fichiers"
          aria-disabled={disabled}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging 
              ? 'border-primary bg-viridial-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'}
          `}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Glissez-déposez vos images ici
          </p>
          <p className="text-xs text-gray-500">
            ou cliquez pour sélectionner des fichiers
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Formats acceptés: JPG, PNG, WebP (max {maxFiles} fichiers)
          </p>
        </div>
      )}

      {/* Media Items Grid */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
            >
              {/* Preview */}
              {item.preview ? (
                <img
                  src={item.preview}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
              ) : item.url && item.url.trim() !== '' ? (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center relative">
                  <img
                    src={item.url}
                    alt="Media"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}

              {/* URL Input for url type items */}
              {item.type === 'url' && (
                <div className="p-2 bg-white border-t border-gray-200">
                  <Input
                    type="url"
                    value={item.url || ''}
                    onChange={(e) => handleUrlChange(item.id, e.target.value)}
                    onBlur={() => {
                      if (item.url) {
                        handleUrlChange(item.id, item.url);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={`h-8 text-xs ${item.urlError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={disabled}
                    aria-label="URL de l'image"
                    aria-invalid={!!item.urlError}
                    aria-describedby={item.urlError ? `url-error-${item.id}` : undefined}
                  />
                  {item.urlError && (
                    <p 
                      id={`url-error-${item.id}`}
                      className="text-xs text-red-600 mt-1" 
                      role="alert"
                    >
                      {item.urlError}
                    </p>
                  )}
                </div>
              )}

              {/* File name for file type items */}
              {item.type === 'file' && item.file && (
                <div className="p-2 bg-white border-t border-gray-200">
                  <p className="text-xs text-gray-600 truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  {item.file.size && (
                    <p className="text-xs text-gray-400">
                      {item.file.size < 1024 * 1024 
                        ? `${(item.file.size / 1024).toFixed(1)} KB`
                        : `${(item.file.size / 1024 / 1024).toFixed(2)} MB`
                      }
                    </p>
                  )}
                  <p className="text-xs text-amber-600 mt-1" role="alert">
                    ⚠️ Upload API non disponible - veuillez utiliser une URL
                  </p>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                disabled={disabled}
                className={`
                  absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white
                  opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-sm focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                `}
                title="Supprimer"
                aria-label={`Supprimer ${item.type === 'file' ? item.file?.name || 'ce fichier' : 'cette image'}`}
              >
                <X className="h-3 w-3" />
              </button>

              {/* Upload indicator */}
              {uploading === item.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add more button */}
      {mediaItems.length > 0 && mediaItems.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Ajouter plus d'images"
          aria-disabled={disabled}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragging 
              ? 'border-primary bg-viridial-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'}
          `}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-xs text-gray-600">
            Ajouter plus d'images ({mediaItems.length}/{maxFiles})
          </p>
        </div>
      )}

      {mediaItems.length >= maxFiles && (
        <p className="text-xs text-gray-500 text-center">
          Nombre maximum de fichiers atteint ({maxFiles})
        </p>
      )}
    </div>
  );
}

