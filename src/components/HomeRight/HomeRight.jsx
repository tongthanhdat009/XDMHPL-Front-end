import React from 'react'
import contacts from './PopularUserCard'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Contact from './Contact';
const HomeRight = () => {
  return (
    <div className='hidden lg:flex flex-col w-60 p-2 mt-5'>
      <div className='flex justify-between items-center text-gray-500 mb-5'>
          <h2 className=' text-xl'>Contacts</h2>
          <div className='flex space-x-2'>
              <SearchRoundedIcon className='h-6' />
              <MoreHorizRoundedIcon className='h-6' />
          </div>
      </div>

      {contacts.map((contact) => (
        <Contact key={contact.id} src={contact.src} name={contact.name}/>
      ))}
    </div>

    
  )
}

export default HomeRight