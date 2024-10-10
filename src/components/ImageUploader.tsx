'use client'
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

declare module "next-auth" {
    interface Session {
        accessToken?: string;  // Add the accessToken field
    }

    interface JWT {
        accessToken?: string;  // Add the accessToken field to JWT as well
    }
}

const ImageUploader = () => {
    const { data: session } = useSession();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [parentFolder, setParentFolder] = useState<string | null>(null);
    const [childFolder, setChildFolder] = useState<string>("");

    if (!session) {
        console.error('User is not authenticated or accessToken is missing');
        return;
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        setFiles(selectedFiles);
    };

    const handleUpload = async () => {
        if (files.length === 0 || !parentFolder) return;

        setUploading(true);

        const formData = new FormData();
        files.forEach((file:File) => {
            formData.append('file', file);
        });
        formData.append('folder', parentFolder);
        formData.append('folder', childFolder);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert('File uploaded successfully to GitHub!');
            } else {
                alert('Error uploading file: ' + result.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input type="file" multiple onChange={handleFileChange} />
            <Select onValueChange={(value) => setParentFolder(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Parent Folder" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="differentUploads">Different Uploads</SelectItem>
                        <SelectItem value="myUploads">My Uploads</SelectItem>
                        <SelectItem value="newUploads">New Uploads</SelectItem>
                        <SelectItem value="uploads">Uploads</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select onValueChange={(value) => setChildFolder(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Child Folder" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="innerUploads">Inner Uploads</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <button onClick={handleUpload} disabled={files.length === 0 || !parentFolder || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default ImageUploader;
