import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import React from 'react'

const CarsList = () => {
  return (
    <div>
        <div className="flex items-center justify-between mb-4 w-full">
        <div className="relative ">
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4'/>
          <Input 
            className='pl-10 w-full lg:w-80'
            placeholder='Search cars...'
          />
        </div>

      <Button>
        <Plus className='size-4'/> 
        Add a new listing 
      </Button>
        </div>
      

      <form>


      </form>
    </div>
  )
}

export default CarsList

