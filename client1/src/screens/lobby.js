import React ,{useState,useCallback,useEffect} from 'react'
import {useSocket} from '../Context/SocketProvider'
import {useNavigate} from 'react-router-dom'

const LobbyScreen = () => {

  const [email,setEmail]= useState("");
  const [room,setRoom] = useState("");

  const socket= useSocket();
  const navigate =useNavigate();
  



  const handlesubmitform =useCallback((e)=>{
    e.preventDefault();

    socket.emit('room:join',{email,room});
    
    
  },[email,room,socket])

  const handlejoinroom = useCallback((data)=>{
    const {email,room}=data;
    navigate(`/room/${room}`);

  },[navigate]);

  useEffect(()=>{
    socket.on("room:join",handlejoinroom);
    return ()=>{
      socket.off('room:join',handlejoinroom);
    }
  },[socket,handlejoinroom]);
  return ( 
    <div>
      <h1> lobby screen</h1>
      <form onSubmit={handlesubmitform}>

        <label htmlFor='email'>Email</label>
        <input type='email' id='email' value={email} onChange={(e)=> setEmail(e.target.value)}/>
        <br/>
        <label htmlFor='room'>Room Number</label>
        <input type='text' id='room' value={room} onChange={(e)=>setRoom(e.target.value)}/>

        <br/>
        <button> submit </button>
      </form>
    </div>
  );
};

export default LobbyScreen;
