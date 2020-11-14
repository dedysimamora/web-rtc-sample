import React,{useEffect, useState} from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import VideoContainer from "./components/videoContainer"
import VideoContainerFS from "./components/videoContainerFS"


import './App.css';

function App() {
  
  return (

    <Router>
        <Switch>
          <Route path="/fullscreen">
          <VideoContainerFS />
          </Route>
          <Route path="/">
            <VideoContainer />
          </Route>
        </Switch>
    </Router>
    // <div className={'main-container'}>
    //     <VideoContainer/>
    // </div>
  );
}

export default App;
