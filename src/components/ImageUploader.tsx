"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "../app/globals.css";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// import the carousel property
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useRef } from "react";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // Add the accessToken field
  }

  interface JWT {
    accessToken?: string; // Add the accessToken field to JWT as well
  }
}

const ImageUploader = () => {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parentFolder, setParentFolder] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [childFolder, setChildFolder] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  }, [files]);

  if (!session) {
    console.error("User is not authenticated or accessToken is missing");
    return null; // Return null instead of nothing for better practice
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !parentFolder) {
      alert("Please select file and parent folder");
      return
    };

    if (!files.every(file => file.name.split('.')[1] === "png")) {
      alert("Please select png files only.");
      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setUploading(true);

    const formData = new FormData();
    files.forEach((file: File) => {
      formData.append("file", file);
    });
    formData.append("folder", parentFolder);
    formData.append("folder", childFolder);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("File uploaded successfully to GitHub!");
        console.log(result);
      } else {
        console.log(result);
        alert("Error uploading file: " + result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 justify-evenly max-w-lg mx-auto">
      {/* choose file  input field  */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".png"
        onChange={handleFileChange}
        className="pt-4 text-sm text-grey-500
                file:mr-5 file:py-3 file:px-8
                file:rounded-full file:border-0
                file:text-sm file:font-semibold file:text-white
                file:bg-gradient-to-r file:from-blue-400 file:to-blue-700
                hover:file:cursor-pointer hover:file:opacity-80"
      />

      {/* carousel compoenets  */}
      {imagePreviews.length > 0 && <Carousel className="w-full max-w-sm mt-5">
        <CarouselContent className="-ml-1">
          {imagePreviews.map((preview, index) => (
            <CarouselItem
              key={index}
              className="pl-1 md:basis-1/2 lg:basis-1/3"
            >
              <div className="p-1">
                <Card>
                  <CardContent className="flex relative w-full h-full aspect-square items-center justify-center p-6">
                    <Image
                      src={preview}
                      alt={`Selected image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>}

      {/* div of two drop down menu */}
      <div className="flex flex-col sm:flex-row gap-y-4 gap-x-4 mt-4">
        <Select onValueChange={(value) => setParentFolder(value)}>
          <SelectTrigger className="w-full sm:w-[180px] text-white font-serif bg-slate-700 border border-gray-300 rounded-lg shadow-sm transition duration-200 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
            <SelectValue placeholder="Select Parent Folder" />
          </SelectTrigger>
          <SelectContent className=" mt-1 w-full sm:w-[180px] bg-white border border-gray-300 rounded-lg shadow-lg transition duration-200 ease-in-out  scale-95 transform origin-top">
            <SelectGroup>
              <SelectItem
                className="cursor-pointer hover:bg-red-400 transition duration-200"
                value="differentUploads"
              >
                Different Uploads
              </SelectItem>
              <SelectItem
                className="cursor-pointer hover:bg-red-400 transition duration-200"
                value="myUploads"
              >
                My Uploads
              </SelectItem>
              <SelectItem
                className="cursor-pointer hover:bg-red-400 transition duration-200"
                value="newUploads"
              >
                New Uploads
              </SelectItem>
              <SelectItem
                className="cursor-pointer hover:bg-red-400 transition duration-200"
                value="uploads"
              >
                Uploads
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setChildFolder(value)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-slate-100 font-serif rounded-lg shadow-sm transition duration-200 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <SelectValue placeholder="Select Child Folder" />
          </SelectTrigger>
          <SelectContent className=" mt-1 w-full sm:w-[180px] bg-white border border-gray-300 rounded-lg shadow-lg transition duration-200 ease-in-out  scale-95 transform origin-top">
            <SelectGroup>
              <SelectItem value="innerUploads">Inner Uploads</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* upload btn  */}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || !parentFolder || uploading}
        className=" upload-btn"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>


    </div>
  );
};

export default ImageUploader;
