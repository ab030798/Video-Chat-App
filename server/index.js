

const {Server} = require("socket.io");
const io= new Server(8000,{
    cors:true,
});
const emailtosocketmap= new Map();
const sockettoemailmap= new Map();

io.on('connection',socket =>{
    console.log('socket connected',socket.id);
    socket.on('room:join',data=>{
        const {email,room}=data;
        emailtosocketmap.set(email,socket.id);
        sockettoemailmap.set(socket.id,email);
        io.to(room).emit("user joined",{email,id: socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join",data);



    });

    socket.on("user:call" ,({to,offer})=>{

        io.to(to).emit("incoming call" , {from :socket.id,offer});
    });
    socket.on("user accepted", ({to,ans})=>{
        io.to(to).emit("user accepted" , {from :socket.id,ans});

    });
    socket.on('peer:nego:need',({to,offer})=>{
        console.log("peer:nego:need",offer);

        io.to(to).emit("peer:nego:need" , {from :socket.id,offer});


    });
    socket.on("peer:Nego:done",({to,ans})=>{
        console.log("peer:Nego:done",ans);
        io.to(to).emit("peer:nego:final" , {from :socket.id,ans});

    });
    
}); 