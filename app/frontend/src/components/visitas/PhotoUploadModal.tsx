import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { uploadFileToS3, IS3UploadResponse } from '../../api/storage';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (upload: IS3UploadResponse) => void;
  mode?: 'photo' | 'document';
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  mode = 'photo',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedResult, setUploadedResult] =
    useState<IS3UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPhoto = mode === 'photo';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const res = await uploadFileToS3(selectedFile);
      setUploadedResult(res);
      onUploadSuccess(res);
      setTimeout(() => {
        setIsUploading(false);
        handleClose();
      }, 1000);
    } catch {
      setUploadError(
        'No se pudo subir el archivo. Verifica el tipo (JPG, PNG, WEBP, PDF) y que pese menos de 15 MB.',
      );
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedResult(null);
    setUploadError('');
    setIsUploading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isPhoto ? 'Tomar foto o subir evidencia' : 'Adjuntar documento'}
      description="Los archivos se almacenan de forma segura en Amazon S3. No se versionan binarios en Git."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            isLoading={isUploading}
          >
            Subir a S3
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#EA580C] bg-slate-50/50 hover:bg-orange-50/20 rounded-xl p-6 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={
              isPhoto
                ? 'image/jpeg,image/png,image/webp'
                : '.pdf,.xls,.xlsx,.csv'
            }
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="space-y-2">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="mx-auto h-40 max-w-full rounded-lg object-cover shadow-sm"
              />
              <p className="text-xs font-bold text-slate-700">
                {selectedFile?.name}
              </p>
              <p className="text-[10px] text-slate-500">
                Clic para cambiar de fotografía
              </p>
            </div>
          ) : selectedFile ? (
            <div className="space-y-2 py-4">
              <FileText className="mx-auto h-12 w-12 text-[#EA580C]" />
              <p className="text-xs font-bold text-slate-800">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {isPhoto ? (
                <Camera className="mx-auto h-10 w-10 text-slate-400" />
              ) : (
                <Upload className="mx-auto h-10 w-10 text-slate-400" />
              )}
              <p className="text-xs font-bold text-slate-700">
                {isPhoto
                  ? 'Haz clic para seleccionar o capturar foto'
                  : 'Haz clic para seleccionar documento'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isPhoto
                  ? 'PNG, JPG, WEBP hasta 10MB'
                  : 'PDF, DOCX, XLSX hasta 25MB'}
              </p>
            </div>
          )}
        </div>

        {/* Uploaded key indicator */}
        {uploadError && (
          <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
            {uploadError}
          </p>
        )}
        {uploadedResult && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold">Subido exitosamente a AWS S3</p>
              <p className="text-[10px] text-emerald-700 font-mono truncate">
                Key: {uploadedResult.s3_key}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
