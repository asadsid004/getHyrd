"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  value?: File | null;
  maxSizeMB?: number;
  allowedTypes?: string[];
  label?: string;
  description?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  value = null,
  maxSizeMB = 5,
  allowedTypes = ["application/pdf"],
  label = "Upload your file",
  description = "Drag and drop or click to upload",
  className,
}) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: `Only ${allowedTypes
            .map((t) => t.split("/")[1].toUpperCase())
            .join(", ")} files are allowed.`,
        });
        return;
      }

      if (file.size > maxSizeBytes) {
        toast.error("File too large", {
          description: `Maximum file size is ${maxSizeMB}MB.`,
        });
        return;
      }

      onFileChange(file);
      toast.success("Resume uploaded successfully!");
    },
    [onFileChange, allowedTypes, maxSizeBytes, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: allowedTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {} as Record<string, string[]>
    ),
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer",
          isDragActive ? "border-primary bg-primary/5" : "border-muted",
          "hover:border-primary/70"
        )}
      >
        <input {...getInputProps()} />
        {value ? (
          <div className="flex flex-col items-center space-y-2">
            <FileText className="h-10 w-10 text-primary" />
            <p className="font-medium">{value.name}</p>
            <p className="text-sm text-muted-foreground">
              {(value.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">
              {description} (PDF, max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {value && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onFileChange(null)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Remove File
          </Button>
        </div>
      )}
    </div>
  );
};
