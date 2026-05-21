import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';



function Header() {
  const [user, setUser] = useState(null);
  const [openDialog,setOpenDialog]=useState(false);

  useEffect(() =>{
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  },[])

  const login=useGoogleLogin({
    onSuccess:(codeResp)=>GetUserProfile(codeResp),
    onError:(error)=>console.log(error)
  })
  
  const GetUserProfile=(tokenInfo)=>{
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,{
      headers: {
       Authorization: `Bearer ${tokenInfo?.access_token}`,
       Accept:'Application/json'
      }
    }).then((resp) => {
      console.log('User profile data:', resp.data);
      localStorage.setItem('user',JSON.stringify(resp.data));
      setUser(resp.data);
      setOpenDialog(false);
      window.location.reload();
    }).catch((error) => {
      console.error('Error fetching user profile:', error);
    })
  }

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-4'>
      <img src='/logo.svg'/>
      <div >
       {user? 
       <div className='flex items-center gap-4'>
        <a href="/create-trip">
         <Button variant="outline" className= "rounded-full">Create Trip</Button> 
        </a>
        <a href="/my-trips">
        <Button variant="outline" className= "rounded-full">My Trips </Button> 
        </a>
         <Popover>
          <PopoverTrigger>
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className='rounded-full w-[38px] h-[38px] object-cover'
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className='rounded-full w-[38px] h-[38px] bg-gray-300 flex items-center justify-center'>
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
          </PopoverTrigger>
          <PopoverContent>
            <h2 className="cursor-pointer" onClick={()=>{
              googleLogout();
              localStorage.clear();
              setUser(null);
              window.location.reload();
            }}>Logout</h2>

          </PopoverContent>
         </Popover>

       </div>
       : <Button onClick={()=>setOpenDialog(true)}>Sign In</Button> 
       }
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg"/>
              <h2 className="font-bold text-lg mt-6">Sign In with Google</h2>
              <p>Sign In to the App with Google authentication securely</p>
              <Button
              onClick={login} className="w-full mt-5 flex gap-4 items-center">
                <FcGoogle className="h-7 w-7"/>
                Sign In With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default Header
