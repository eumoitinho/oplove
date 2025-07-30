import React from 'react'

function Logo() {
  return (
    <div>
      <h1 className="text-[6rem] md:text-[10rem] lg:text-[12rem] font-bold leading-none tracking-tighter mb-8 md:mb-12 group cursor-default">
              <span className="block text-gray-900 dark:text-white group-hover:tracking-wide transition-all duration-500">
                open
              </span>
              <span className="block bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:tracking-wide transition-all duration-500">
                love
              </span>
            </h1>
    </div>
  )
}

export default Logo
