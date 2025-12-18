'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { Plus, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
 
const CarsList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  
  // Use debounce for search
  const debouncedSearch = useDebounce(search, 500)

  // Update URL when search changes - FIXED VERSION
  useEffect(() => {
    const currentSearch = searchParams.get('q') || ''
    const currentPage = searchParams.get('page') || '1'
    
    // Only update if the search has actually changed
    if (debouncedSearch.trim() !== currentSearch.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      
      if (debouncedSearch.trim()) {
        params.set('q', debouncedSearch.trim())
        params.set('page', '1') // Reset to first page on new search
      } else {
        params.delete('q')
        // Only reset page if we're clearing search and not already on page 1
        if (currentPage !== '1') {
          params.set('page', '1')
        }
      }
      
      // Don't update if params haven't changed
      const newParamsString = params.toString()
      const currentParamsString = new URLSearchParams(searchParams.toString()).toString()
      
      if (newParamsString !== currentParamsString) {
        router.push(`/superadmin/cars?${newParamsString}`, { scroll: false })
      }
    }
  }, [debouncedSearch, router]) // REMOVED searchParams from dependencies to prevent infinite loop

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams(searchParams.toString())
    const currentSearch = params.get('q') || ''
    
    // Only submit if search has changed
    if (search.trim() !== currentSearch.trim()) {
      if (search.trim()) {
        params.set('q', search.trim())
        params.set('page', '1')
      } else {
        params.delete('q')
        params.set('page', '1')
      }
      
      router.push(`/superadmin/cars?${params.toString()}`)
    }
  }

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    const currentSearch = params.get('q')
    
    // Only clear if there's actually a search
    if (currentSearch) {
      setSearch('')
      params.delete('q')
      params.set('page', '1')
      
      router.push(`/superadmin/cars?${params.toString()}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e)
    }
  }

  return ( 
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 w-full">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex-1">
          <div className="relative h-10">
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4' />
            <Input
              className='pl-10 pr-10 w-full h-full'
              placeholder='Search cars by make, model, year, or description...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              type='search'
            />
            
            {/* Clear search button */}
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </form>

        <Button asChild className="w-full sm:w-auto h-10">
          <Link href='/superadmin/cars/create-car' className='flex items-center justify-center gap-2'>
            <Plus className='size-4' />
            Add a new listing
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default CarsList

