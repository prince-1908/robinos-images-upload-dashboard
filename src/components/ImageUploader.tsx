'use client'
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import '../app/globals.css'
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
                console.log(result);
            } else {
                console.log(result);
                alert('Error uploading file: ' + result.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className='flex mx-auto gap-[50px] flex-col justify-center items-center'>
            <input type="file" multiple onChange={handleFileChange}
              className="pt-6 text-sm text-grey-500
            file:mr-5 file:py-3 file:px-8
            file:rounded-full file:border-0
            file:text-md file:font-semibold  file:text-white
            file:bg-gradient-to-r file:from-blue-400 file:to-blue-700
            hover:file:cursor-pointer hover:file:opacity-80"
            />
            {/* div of two drop down menu  */}
            <div className='flex gap-x-4'>
            <Select onValueChange={(value) => setParentFolder(value)}>
                <SelectTrigger className="w-[180px] text-white font-serif bg-slate-700 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <SelectValue placeholder="Select Parent Folder" />
                </SelectTrigger>
                <SelectContent className=" mt-1 w-[180px] bg-white border border-gray-300 rounded-lg shadow-lg transition duration-200 ease-in-out  scale-95 transform origin-top">
                    <SelectGroup>
                        <SelectItem className='cursor-pointer hover:bg-red-400 transition duration-200' value="differentUploads">Different Uploads</SelectItem>
                        <SelectItem className='cursor-pointer hover:bg-red-400 transition duration-200' value="myUploads">My Uploads</SelectItem>
                        <SelectItem className='cursor-pointer hover:bg-red-400 transition duration-200' value="newUploads">New Uploads</SelectItem>
                        <SelectItem className='cursor-pointer hover:bg-red-400 transition duration-200' value="uploads">Uploads</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select onValueChange={(value) => setChildFolder(value)}>
                <SelectTrigger className="w-[180px] bg-slate-100 font-serif rounded-lg shadow-sm transition duration-200 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Select Child Folder" />
                </SelectTrigger>
                <SelectContent className=" mt-1 w-[180px] bg-white border border-gray-300 rounded-lg shadow-lg transition duration-200 ease-in-out  scale-95 transform origin-top">
                    <SelectGroup>
                        <SelectItem value="innerUploads">Inner Uploads</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            </div>

            <button onClick={handleUpload} disabled={files.length === 0 || !parentFolder || uploading}
             className='upload-btn'
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default ImageUploader;
