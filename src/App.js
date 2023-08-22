import logo from './public/logo.PNG';
import './App.css'
import io from "socket.io-client";
import React,{useState} from 'react'
import { useEffect } from 'react';
import axios from 'axios'
const socket=io.connect("http://localhost:3000");



function App() {
  const [title,setTitle]=useState('');
  const [speaker,setSpeaker]=useState('');
  const [boards,setBoards]=useState(undefined);

const [boardStatus,setBoardStatus]=useState(false);
const [boardValue,setBoardValue]=useState(undefined);
const [questions,setQuestions]=useState(undefined)
const [editStatus,setEditStatus]=useState(false);
// const [activeUsers,setActiveUsers]=useState({});

const [ask,setAsk]=useState(true);
const [text,setText]=useState('');

// const joinRoom=async(board)=>{
//   socket.emit("join_room",{room:board.title,id:board.socketId,sId:socket.id});
// }

// const leaveRoom=(board)=>{
//   socket.emit("leave_room",{room:board.title,id:board.socketId,sId:socket.id});
// }

// socket.on("add_user",(data)=>{
//   if(data.id!==socket.id)
//   return ;
//   let obj=activeUsers;
//   if(obj['temp']===undefined || obj['temp']===[1]){
//     obj['temp']=[0];
//   }
//   else{
//     obj['temp']=[1];
//   }
//   if(obj[data.room]===undefined || obj[data.room]===[]){
//     obj[data.room]=[data.sId];
//   }
//   else{
//     if(obj[data.room].includes(data.sId)){
//       console.log(data.sId,"included");
//       setActiveUsers(obj);
//       return ;
//     }
//     obj[data.room].push(data.sId);
//   }
//   console.log(obj,"add");
//   setActiveUsers(obj);
// })

// socket.on("remove_user",(data)=>{
//   if(data.id!==socket.id)
//   return ;
//   let obj=activeUsers;
//   if(obj[data.room].length===1){
//     obj[data.room]=[];
//   }
//   else{
//     obj[data.room] = obj[data.room].filter(function(item) {
//       return item !== data.sId;
//   })
//   }
//   console.log(obj,"remove");
//   setActiveUsers(obj);
// })

const createBoard=async()=>{
  axios.post('http://localhost:3000/board',{
    speaker:speaker,
    title:title,
    socketId:socket.id
  }).then((res)=>{
    let board=res.data;
  setBoards([...boards,board]);
  setTitle('');
  setSpeaker('');
  // socket.emit("join_room",{room:board.title,id:board.socketId,sId:socket.id});
  socket.emit("update_board","data");
  }).catch((err)=>{
    alert(err.response.data);
  })
}

const goHome=async()=>{
  socket.emit("update_board","data");
  axios.get('http://localhost:3000/board',{}).then((res)=>{
        setBoards(res.data);
      }).catch((err)=>{
        alert('Unexpected error');
        console.log(err);
      })
}

const askQuestion=async(id)=>{
  if(text===''){
    alert('Please enter a question');
    return ;
  }
  axios.post(`http://localhost:3000/questions`,{
    id:id,
    text:text
  }).then((res)=>{
    axios.get(`http://localhost:3000/questions/${id}`,{}).then((res1)=>{
      setQuestions(res1.data);
      setText('');
      socket.emit('update_questions',{id:id});
    }).catch((err)=>{
      alert(err.response.data);
    })
  }).catch((err)=>{
    alert(err.response.data);
  })
}

const deleteBoard=async(sId,id)=>{
  axios.delete(`http://localhost:3000/board/${sId}/${id}`).then((res)=>{
    let board=res.data;
    // leaveRoom(board);
    let newBoards=boards.filter((one)=>{
      return one._id!==board._id;
    });
    setBoards(newBoards);
    socket.emit("update_board",{method:'delete',id:board._id});
  }).catch((err)=>{
    alert(err.response.data);
  });
}

const editBoard1=async()=>{
  setEditStatus(!editStatus);
}

const editBoard=async(id)=>{
  if(title===''){
    alert('Please enter title');
    return ;
  }
  axios.put(`http://localhost:3000/board/${id}`,{
    title:title,
    speaker:speaker
  }).then((res)=>{
    setBoardValue(res.data);
    socket.emit("update_one_board",{id:id});
    socket.emit("update_board","data");
    setEditStatus(false);
  }).catch((err)=>{
    alert(err.response.data);
  })
}

socket.on("recieve",(data)=>{
  // axios.get('http://localhost:3000/board',{}).then((res)=>{
  //   setBoards(res.data);
  // }).catch((err)=>{
  //   console.log(err);
  // })
  if(boardValue!==undefined && data.method==='delete' && boardValue._id===data.id){
    setBoardStatus(false);
          setBoardValue(undefined);
          setQuestions(undefined);
          goHome();
          setTitle('');
          setSpeaker('');
  }
  else{
    axios.get('http://localhost:3000/board',{}).then((res)=>{
    setBoards(res.data);
  }).catch((err)=>{
    alert(err.response.data);
  })
  }
})

socket.on('update_ques_likes',(data)=>{
  if(boardValue && boardValue._id===data.id){
    axios.get(`http://localhost:3000/questions/${data.id}`,{}).then((res)=>{
      setQuestions(res.data);
    }).catch((err)=>{
      alert(err.response.data);
    })
  }
})


const getQuestions=async(id)=>{
  axios.get(`http://localhost:3000/questions/${id}`,{}).then((res)=>{
      setQuestions(res.data);
    }).catch((err)=>{
      alert(err.response.data);
    })
}

const voteQuestion=async(id,bId)=>{
  axios.put(`http://localhost:3000/questions/${id}`,{}).then((res)=>{
    axios.get(`http://localhost:3000/questions/${bId}`,{}).then((res1)=>{
      setQuestions(res1.data);
      socket.emit('update_questions_likes',{id:bId});
    }).catch((err)=>{
      alert(err.response.data);
    })
  }).catch((err)=>{
    alert(err.response.data);
  })
}

socket.on("edit board",(data)=>{
  if(boardValue && boardValue._id===data.id){
    axios.get(`http://localhost:3000/board/${data.id}`,{}).then((res)=>{
      setBoardValue(res.data);
    }).catch((err)=>{
      alert(err.response.data);
    })
  }
})

socket.on('update_ques',(data)=>{
  if(boardValue && boardValue._id===data.id){
    axios.get(`http://localhost:3000/questions/${data.id}`,{}).then((res)=>{
      setQuestions(res.data);
    }).catch((err)=>{
      alert(err.response.data);
    })
  }
})

useEffect(()=>{
  if(boards===undefined){
    axios.get('http://localhost:3000/board',{}).then((res)=>{
        console.log(res);
        setBoards(res.data);
      }).catch((err)=>{
        console.log(err);
      })
      return ;
  }
},[])

  return (
    <div className="App">
       <div id="header">
        <img src={logo} alt="logo" width="230px" height="95%" style={{paddingLeft:'5%',cursor:'pointer'}} onClick={()=>{
          // leaveRoom(boardValue);
          setBoardStatus(false);
          setBoardValue(undefined);
          setQuestions(undefined);
          goHome();
          setTitle('');
          setSpeaker('');
        }}/>
        <div id="headerRight">
        {boardValue && boardValue.socketId===socket.id && (<p style={{color:'#03AE14',marginTop: '15px',marginRight:'27px'}}>{`${'1'} Active members`}</p>)}
        {boardValue && (<button className='button5' >Share</button>)}
        </div>
       </div>
      {!boardStatus && (<div><div id="center">
        <input className='input' type="text" placeholder='Title' onChange={(e)=>setTitle(e.target.value)} value={title}/>
        <input className='input' type="text" placeholder='Speakers' onChange={(e)=>setSpeaker(e.target.value)} value={speaker}/>
        <div id="submit">
        <button className='button' onClick={createBoard}>Create a New Board</button>
        </div>
       </div>
       <div id="bottom">
        <div id="live">
          <p style={{color:'#1D9BF0'}}>Live Boards</p>
          <hr style={{border:'1px solid #DCDCDC',width:"100%"}}/>
        </div>
        <div id="boards">
        {boards && boards.map((board)=>{
          return (<div id="board">
            <div id="left" onClick={()=>{
            setBoardStatus(true);
            setBoardValue(board);
            getQuestions(board._id);
            //joinRoom(board);
          }}>
              <div style={{display:'flex',width:'100%',height:'35px'}}>
                 <p style={{color:'#747474'}}>{`Title: `}</p>
                 <p style={{marginLeft:'4%'}}>{board.title}</p>
              </div>
              <div style={{display:'flex',width:'100%'}}>
                 <p style={{color:'#747474'}}>{`Speaker(s): `}</p>
                 <p style={{marginLeft:'4%'}}>{board.speaker}</p>
              </div>
            </div>
            {socket.id===board.socketId && (<div id="right">
            <button className='button2' onClick={()=>deleteBoard(socket.id,board._id)}>Delete</button>
            </div>)}
          </div>)
        })}
        </div>
       </div></div>)}
       {boardStatus && (<div>
        <div id="board2">
            <div id="left">
              <div style={{display:'flex',width:'100%',height:'35px'}}>
                 <p style={{color:'#747474'}}>{`Title: `}</p>
                 <p style={{marginLeft:'4%'}}>{boardValue.title}</p>
              </div>
              <div style={{display:'flex',width:'100%'}}>
                 <p style={{color:'#747474'}}>{`Speaker(s): `}</p>
                 <p style={{marginLeft:'4%'}}>{boardValue.speaker}</p>
              </div>
            </div>
            {socket.id===boardValue.socketId && (<div id="right">
            <button className='button2' onClick={()=>editBoard1()}>Edit</button>
            </div>)}
          </div>
          <div id="down">
            <div id="live2">
              {socket.id!==boardValue.socketId && (<div id="ask">
                <input id="ques" type="text" placeholder='Type your question here' onChange={(e)=>setText(e.target.value)} value={text}/>
                <div style={{display:'flex',alignItems:'center',position:'absolute',height:'11vh',left:'80%'}}>
                <button className='button3' onClick={()=>askQuestion(boardValue._id)}>Ask</button>
                </div>
              </div>)}
              {editStatus && (<div id="center">
        <input className='input' type="text" placeholder='Title' onChange={(e)=>setTitle(e.target.value)}/>
        <input className='input' type="text" placeholder='Speakers' onChange={(e)=>setSpeaker(e.target.value)}/>
        <div id="submit">
        <button className='button' onClick={()=>editBoard(boardValue._id)}>Edit Board</button>
        </div>
       </div>)}
              <p style={{color:'#1D9BF0'}}>{`${questions && questions.length} questions`}</p>
              <hr style={{border:'1px solid #DCDCDC',width:"100%"}}/>
            </div>
            <div id="cards">
              {questions && questions.map((ques)=>{
                return (<div id="card">
                  <div style={{display:'flex',width:'90%'}}>
                  <div id="like">
                    <p style={{position:'relative',left:'40%',bottom:'5%'}}>{ques.likes}</p>
                  </div>
                  <div id="question">
                    <p>{ques.text}</p>
                  </div>
                  </div>
                  {socket.id!==boardValue.socketId && (<div style={{display:'flex',alignItems:'center',height:'13vh',marginRight:'4%'}}>
                    <button className='button2' onClick={()=>voteQuestion(ques._id,boardValue._id)}>Vote</button>
                  </div>)}
                </div>)
              })}
            </div>
          </div>
       </div>)}
    </div>
  );
}




export default App;
