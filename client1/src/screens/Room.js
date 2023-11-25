import React ,{useEffect,useCallback,useState} from "react";
import { useSocket } from "../Context/SocketProvider";

import ReactPlayer from 'react-player';
import peer from "../services/peer";


const RoomPage =() =>{

    const socket=useSocket();
    const [roomsocketid, RoomSocketId]=useState(null);

    const [mystream, setmyStream]= useState();
    const [remoteStream, setremoteStream]= useState();

    const handleUsejoined= useCallback(({email,id})=>{

        console.log(`email ${email} joined room`);
        RoomSocketId(id);
    },[]);
    

    const handleCallUser= useCallback(async()=>{

        const stream = await navigator.mediaDevices.getUserMedia({audio: true,video:true});
        const offer = await peer.getOffer();
        socket.emit("user:call", {to : roomsocketid,offer});

        setmyStream(stream);
    },[roomsocketid,socket]);

    const handleincomingcall= useCallback(async ({from,offer})=>{
        RoomSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({audio: true,video:true});
        setmyStream(stream);

        console.log("incoming call",from,offer);

        const ans= await peer.getAnswer(offer);
        socket.emit("user accepted",{ to: from ,ans});


    },[socket]);

    const sendStream = useCallback(()=>{
        for(const track of mystream.getTracks()){
            peer.peer.addTrack(track,mystream);

        }
    },[mystream]);
    

    const handlecallaccepted= useCallback(({from,ans})=>{

        peer.setLocalDescription(ans);
        console.log("user accepted");
        sendStream();
        
        

    },[sendStream])

    const handleNegoNeed= useCallback(async ()=>{
        const offer= await peer.getOffer();

        socket.emit('peer:nego:need',{offer,to:roomsocketid});

    },[socket,roomsocketid])

    useEffect(()=>{

        peer.peer.addEventListener("negotiationneeded",handleNegoNeed);
        return ()=>{
            peer.peer.removeEventListener("negotiationneeded",handleNegoNeed);

        }
    },[handleNegoNeed]);

    const handleNegoNeedIncoming= useCallback(async ({from,offer})=>{

        const ans= await peer.getAnswer(offer);
        socket.emit("peer:Nego:done",{to :from,ans});

    },[socket]);
    const handleNegoNeedFinal= useCallback(async ({ans})=>{

       await peer.setLocalDescription(ans);


    },[]);

    useEffect(()=>{

        peer.peer.addEventListener("track",async(ev)=>{
            const remoteStream= ev.streams;
            console.log("GOT TRACKS!!");
            setremoteStream(remoteStream[0]);
        });

        
    },[]);

    useEffect (() =>{
        socket.on("user joined",handleUsejoined);
        socket.on("incoming call", handleincomingcall);
        socket.on("user accepted",handlecallaccepted);
        socket.on("peer:nego:need",handleNegoNeedIncoming);
        socket.on("peer:nego:final",handleNegoNeedFinal);

        return()=>{
            socket.off("user joined",handleUsejoined);
            socket.off("incoming call", handleincomingcall);
            socket.off("user accepted",handlecallaccepted);
            socket.off("peer:nego:need",handleNegoNeedIncoming);
            socket.off("peer:nego:final",handleNegoNeedFinal);
        }


    },[socket,handleUsejoined,handleincomingcall,handlecallaccepted,handleNegoNeedIncoming,handleNegoNeedFinal]);

    return (

        <div>

            <h1> Room Page</h1>
            <h4>{roomsocketid ? 'connected' : 'not connected'}</h4>

            {
                mystream && <button onClick={sendStream}> send Stream</button>
            }

            {
              roomsocketid && <button onClick={handleCallUser}>CALL</button>
            }
            {
                 mystream && (
                    <>
                    <h1> My Stream</h1>

                    <ReactPlayer playing muted height="200px" width="300px"  url={mystream}/>
                    </>
                 )
                
            }
            {
                 remoteStream && (
                    <>
                    <h1> Remote Stream</h1>

                    <ReactPlayer playing muted height="200px" width="300px"  url={remoteStream}/>
                    </>
                 )
                
            }
        </div>
    );
};
export default RoomPage;