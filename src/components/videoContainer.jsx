import React,{useState, useEffect, useRef, createRef} from 'react'

import { Card, Row, Col, Input, Button } from 'antd';
import {UserOutlined} from '@ant-design/icons';
import firebase from 'firebase/app'
import 'firebase/database'
import 'webrtc-adapter'
import config from '../config'
import { 
            doOffer, 
            doAnswer, 
            doLogin, 
            doCandidate 
        } from '../module/FirebaseModule'
import {  
            createOffer, 
            initiateConnection, 
            startCall, 
            sendAnswer, 
            addCandidate, 
            initiateLocalStream, 
            listenToConnectionEvents
        } from '../module/RTCModule'

import "./videoContainer.css"

const VideoContainer = () => {
    const [personID, setPersonID] = useState(null)
    const [swap, setSwap] = useState(false)
    const [userName, setUserName] = useState(null)
    const [database, setDatabase] = useState(null)
    const [isLogin,setIsLogin] = useState(false)
    const [localConnection, setLocalConnection] = useState(null)
    const [localStream, setLocalStream] = useState(null)
    const [connectedUser, setConnectedUser] = useState(null)
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    useEffect(() => {
        (async () => {
            if (!firebase.apps.length) {
                 firebase.initializeApp(config)
             }
            const databaseVariabel = firebase.database()
            setDatabase(databaseVariabel)
             

            const localStream = await initiateLocalStream()
            localVideoRef.current.srcObject = localStream

             await setLocalStream(localStream)

            const localConnectionVariabel = await initiateConnection()
            await setLocalConnection(localConnectionVariabel)
            // await doLogin('myusername', database, handleUpdate)
        })();
    }, [])


    // const turnOnLocalVideo = async () => {
    //         try {
    //             const constraints = {'video': true, 'audio': true};
    //             const stream = await navigator.mediaDevices.getUserMedia(constraints);
    //             const videoElement = localVideoRef.current
    //             videoElement.srcObject = stream;
    //         } catch(error) {
    //             console.error('Error opening video camera.', error);
    //         }
    // }

    
    const dialSomeone = async (username, userToCall) => {
        listenToConnectionEvents(localConnection, username, userToCall, database, remoteVideoRef, doCandidate)
        // create an offer
        createOffer(localConnection, localStream, userToCall, doOffer, database, username)
      }

    const handleInputChange = (e) => {
        setPersonID(e.target.value);
    }

    const handleInputUsername = (e) => {
        setUserName(e.target.value);
    }

    const loginFunct = () => {
        setIsLogin(true)
        doLogin(userName, database, handleUpdate)
    }

    const handleUpdate = (notif, username) => {
        if (notif) {
            switch (notif.type) {
              case 'offer':
                setConnectedUser(notif.from)
                listenToConnectionEvents(localConnection, username, notif.from, database, remoteVideoRef, doCandidate)
                sendAnswer(localConnection, localStream, notif, doAnswer, database, username)
                break
              case 'answer':
                setConnectedUser(notif.from)
                startCall(localConnection, notif)
                break
              case 'candidate':
                addCandidate(localConnection, notif)
                break
              default:
                break
            }
          }
    }
    
    return (
        <Row style={{width:'100%', height:'100%'}}>
            <Col xs={{span : 22, offset: 1}} 
                sm={{span : 18, offset: 3}} 
                md={{span : 18, offset: 3}} 
                lg={{span : 18, offset: 3}} 
                xl={{span : 18, offset: 3}}
                style={{display:'flex', justifyContent:'center', alignItems:'center'}}
            >
                <div className={'videoContainer'}>
                    <video muted={swap} className={'bigVideo'} ref={remoteVideoRef} autoPlay playsInline></video>
                    <video muted={!swap}  className={'smallVideo'} ref={localVideoRef} autoPlay playsInline></video>
                    <div className={'noCallerContainer'}>
                         <UserOutlined style={{fontSize:'50px'}} />
                    </div>
                    <div className={'control-div'}>
                        {
                            isLogin ? 
                                (
                                    <>
                                        <Input value={personID} onChange={handleInputChange} className={'person-id'} placeholder="input id" />
                                        <Button className={'call-button'} onClick={() => dialSomeone(userName, personID)} type="primary">Call</Button>
                                    </>
                                )
                            : 
                            (
                                <>
                                    <Input value={userName} onChange={handleInputUsername} className={'person-id'} placeholder="username" />
                                    <Button className={'call-button'} onClick={loginFunct} type="primary">login</Button>
                                </>
                            )
                            
                            
                        }
                       
                    </div>

                </div>
                   
               
            </Col>
        </Row>
            
            
    )
}

export default VideoContainer
