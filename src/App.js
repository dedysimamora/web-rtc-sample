import React,{useEffect, useState} from "react"

import VideoContainer from "./components/videoContainer"


import './App.css';

function App() {
  
  // useEffect(() => {
  //   navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
  //   if (navigator.getUserMedia) {
  //       navigator.getUserMedia({video: true}, handleVideo, videoError);
  //   }
  // });

  let joinRoom = () => {
 
  }
  return (
    <div className={'main-container'}>
        <VideoContainer/>
    </div>
  );
}

export default App;
