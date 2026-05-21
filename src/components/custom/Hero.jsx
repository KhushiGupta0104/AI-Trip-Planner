import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className="flex flex-col items-center mx-57 gap-9">
      
      {/* Main Heading */}
      <h1 className="font-extrabold text-[50px] text-center mt-16">
        <span className='text-[#1A73E8]'>Plan Smarter. Travel Better.</span>
        <br/>
        Personalized Itineraries Powered by AI
      </h1>

      {/* Subtext */}
      <p className='text-xl text-gray-500 text-center'>
        WanderAI creates custom day-by-day travel plans tailored to your destination, 
        budget, and travel style — in seconds.
      </p>

      {/* CTA Button */}
      <Link to={'/create-trip'}>
        <Button className="bg-[#1A73E8] hover:bg-[#1558B0] text-white px-8 py-6 text-lg rounded-full">
          Start Planning for Free ✈️
        </Button>
      </Link>

      {/* Stats Section */}
<div className="w-full mt-8 bg-[#F0F7FF] rounded-2xl py-10 px-6">
  <div className="grid grid-cols-3 gap-6 text-center">
    
    <div className="flex flex-col items-center gap-2">
      <span className="text-4xl font-extrabold text-[#1A73E8]">10,000+</span>
      <span className="text-gray-500 text-sm font-medium">Trips Planned</span>
    </div>

    <div className="flex flex-col items-center gap-2">
      <span className="text-4xl font-extrabold text-[#1A73E8]">50+</span>
      <span className="text-gray-500 text-sm font-medium">Countries Covered</span>
    </div>

    <div className="flex flex-col items-center gap-2">
      <span className="text-4xl font-extrabold text-[#1A73E8]">100%</span>
      <span className="text-gray-500 text-sm font-medium">AI Powered</span>
    </div>

  </div>
</div>
    </div>
  )
}

export default Hero