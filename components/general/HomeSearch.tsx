'use client'

import React, { useState, useRef } from 'react'
import { Camera, Upload } from "lucide-react"
import { Button } from '@/components/ui/button'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { processCarImageSearch } from "../../app/actions/home";

const HomeSearch = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isImageSearchActive, setIsImageSearchActive] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [searchImage, setSearchImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Helper to capitalize words properly
  const capitalizeWords = (str: string) => {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) {
      toast.error("Please enter search term")
      return
    }

    setIsSearching(true)

    const term = searchTerm.trim();
    const normalized = term.toLowerCase();
    
    // Check common patterns and create appropriate URL
    let url = '/cars?page=1';
    
    // Simple heuristics for common body types
    if (normalized.includes('suv') || normalized === 'suv') {
      url = `/cars?bodyType=SUV&page=1`;
    } else if (normalized.includes('sedan') || normalized === 'sedan') {
      url = `/cars?bodyType=Sedan&page=1`;
    } else if (normalized.includes('coupe') || normalized === 'coupe') {
      url = `/cars?bodyType=Coupe&page=1`;
    } else if (normalized.includes('hatchback') || normalized === 'hatchback') {
      url = `/cars?bodyType=Hatchback&page=1`;
    } else if (normalized.includes('wagon') || normalized === 'wagon') {
      url = `/cars?bodyType=Wagon&page=1`;
    } else if (normalized.includes('convertible') || normalized === 'convertible') {
      url = `/cars?bodyType=Convertible&page=1`;
    } else if (normalized.includes('pickup') || normalized === 'pickup' || normalized.includes('truck')) {
      url = `/cars?bodyType=Pickup&page=1`;
    } else {
      // Otherwise treat it as a make (brand name)
      const capitalizedTerm = capitalizeWords(term);
      url = `/cars?make=${encodeURIComponent(capitalizedTerm)}&page=1`;
    }

    setTimeout(() => { 
      router.push(url)
      setIsSearching(false)
    }, 800)
  }

 
const handleImageSearch = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!searchImage) {
    toast.error("Please upload an image first");
    return;
  }

  setIsSearching(true);

  try {
    const result = await processCarImageSearch(searchImage);

    if (!result.success || !result.data) {
      toast.error(result.error ?? "Image search failed");
      setIsSearching(false);
      return;
    }

    const { make, bodyType, color, confidence } = result.data;

    if (confidence < 0.4) {
      toast.warning("Low confidence result. Showing best matches.");
    } else {
      toast.success("Car identified successfully");
    }

    const params = new URLSearchParams();
    params.set('page', '1');

    if (make) params.set("make", make);
    if (bodyType) params.set("bodyType", bodyType);
    if (color) params.set("color", color);

    router.push(`/cars?${params.toString()}`);
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong while searching");
  } finally {
    setIsSearching(false);
  }
};



  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]

      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size must be less than 5MB")
          return
        }

        setIsUploading(true)
        setSearchImage(file)

        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
          setIsUploading(false)
          toast.success("Image uploaded successfully")
        }

        reader.onerror = () => {
          setIsUploading(false)
          toast.error("Failed to upload image")
        }

        reader.readAsDataURL(file)
      }
    },
    accept: {
      'image/*': [".jpeg", ".jpg", ".png"]
    },
    maxFiles: 1,
    noClick: true,
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setIsUploading(true)
    setSearchImage(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      setIsUploading(false)
      toast.success("Image uploaded successfully")
    }

    reader.onerror = () => {
      setIsUploading(false)
      toast.error("Failed to upload image")
    }

    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview('')
    setSearchImage(null)
    toast.info('Image removed')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search for cars, brands, models or use our AI Image Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-5 pl-4 pr-48 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
            disabled={isSearching}
          />
 
          <div className="absolute right-32">
            <Camera
              size={42} 
              onClick={() => {
                if (isSearching) return
                setIsImageSearchActive(!isImageSearchActive)
                if (isImageSearchActive) {
                  setImagePreview('')
                  setSearchImage(null)
                }
              }}
              className={`cursor-pointer p-2 rounded-full ${isSearching
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : isImageSearchActive
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                } transition-all duration-200`}
              aria-label={isImageSearchActive ? "Switch to text search" : "Switch to image search"}
            />
          </div>

          <Button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 px-8 py-6 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 text-base"
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      <AnimatePresence>
        {isImageSearchActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-6 border border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800"
          >
            <form onSubmit={handleImageSearch}>
              <div className="space-y-4">
                {isUploading ? (
                  <div className="text-center">
                    <Skeleton className="w-full max-w-md mx-auto h-64 mb-4 rounded-2xl" />
                    <div className="flex gap-3 justify-center">
                      <Skeleton className="h-10 w-32 rounded-full" />
                      <Skeleton className="h-10 w-40 rounded-full" />
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div className="text-center">
                    <div className="relative w-full max-w-md mx-auto h-64 mb-4">
                      <Image
                        src={imagePreview}
                        alt="Uploaded Image"
                        fill
                        className="object-contain rounded-2xl"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={removeImage}
                        disabled={isSearching}
                        className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 rounded-full px-6"
                      >
                        Remove Image
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSearching}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-full px-6"
                      >
                        {isSearching ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Searching...
                          </div>
                        ) : (
                          'Search with Image'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
                      } ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                    />
                    
                    <input {...getInputProps()} />
                    
                    <Upload className="mx-auto mb-4 text-gray-400 dark:text-gray-500 size-14" />
                    <p className="mb-2 text-gray-700 dark:text-gray-300 font-medium">
                      {isDragActive && !isDragReject
                        ? "Drop the image here"
                        : "Drag & drop a car image or click to select"
                      }
                    </p>

                    {isDragReject && (
                      <p className="text-red-500 mb-2 font-medium">Invalid image type</p>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Supports: JPG, PNG (max 5MB)
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 disabled:opacity-50 rounded-full px-8"
                      disabled={isSearching}
                      onClick={triggerFileInput}
                    >
                      <Upload className="mr-2 w-4 h-4" />
                      {isSearching ? 'Processing...' : 'Select Image'}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isSearching && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isImageSearchActive ? 'Searching with Image...' : 'Searching Cars...'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                {isImageSearchActive
                  ? 'Our AI is analyzing your image to find matching cars'
                  : 'Finding the best matches for your search'
                }
              </p>
              <div className="w-full space-y-2 mt-4">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-2 w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeSearch

