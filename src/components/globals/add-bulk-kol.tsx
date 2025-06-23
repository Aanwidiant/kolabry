import React, { useRef, useState } from 'react';
import { Upload } from '@/components/icons';
import Button from '@/components/globals/button';
import Modal from '@/components/globals/modal';
import { useFileStore } from '@/store/fileStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface AddBulkKolProps {
    onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedExtensions = ['csv', 'xlsx'];

export default function AddBulkKol({ onClose }: AddBulkKolProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();
    const { setFile } = useFileStore();

    const isValidFile = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !allowedExtensions.includes(ext)) {
            toast.error('Invalid file type. Please upload a .csv or .xlsx file.');
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File is too large. Max size is 5MB.');
            return false;
        }
        return true;
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file && isValidFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && isValidFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleContinue = () => {
        if (!selectedFile) return;
        setFile(selectedFile);
        onClose();
        router.push('/kols/validate-kol');
    };

    return (
        <Modal
            title='Upload KOLs (Bulk)'
            onClose={onClose}
            footer={
                <Button onClick={handleContinue} disabled={!selectedFile}>
                    Continue
                </Button>
            }
        >
            <div
                className={`border-2 border-dashed rounded-lg p-6 h-52 flex flex-col gap-y-3 items-center justify-center text-center transition cursor-pointer ${
                    dragActive ? 'border-primary bg-primary/25' : 'border-gray'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <Upload className='w-20 h-20 text-gray' />
                <p className='text-gray'>
                    Drag & drop your file here, or <span className='text-primary underline'>browse</span>
                </p>
                <input type='file' ref={inputRef} onChange={handleFileChange} accept='.csv,.xlsx' className='hidden' />
            </div>

            {selectedFile && (
                <p className='mt-2'>
                    Selected file: <span className='font-bold'>{selectedFile.name}</span>
                </p>
            )}

            <a href='/examples/example-kols-data.xlsx' download className='text-primary underline text-sm block mt-2'>
                Download example file
            </a>
        </Modal>
    );
}
