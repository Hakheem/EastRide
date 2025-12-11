
'use client'

import React, {useState} from 'react'
import { 
  Camera
} from "lucide-react"
import { Button } from '@/components/ui/button'

const HomeSearch = () => {
const [searchTerm, setSearchTerm] = useState('')
const [isImageSearch, setIsImageSearch] = useState(false)
  const handleTextSubmit = () => {}

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
<div className="relative flex items-center">
  <input
    type="text"
    placeholder="Search for cars, brands, models or use our AI Image Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full px-4 py-6 pl-10 pr-12 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    />

<div className="absolute left-3">
  <Camera
  size={32}
  onClick={() => setIsImageSearch(!isImageSearch)}
  className={`cursor-pointer p-1.5 rounded-xl ${isImageSearch ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
  />

</div>

<Button type="submit" className="absolute right-2 px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/90">
  Search
</Button>

</div>

      </form>




    </div>
  )
} 

export default HomeSearch