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

        import {
            CloseOutlined,
            RetweetOutlined
          } from '@ant-design/icons';

import "./videoContainerFS.css"

const VideoContainerFS = () => {
    const [personID, setPersonID] = useState(null)
    const [userName, setUserName] = useState(null)
    const [database, setDatabase] = useState(null)
    const [swap, setSwap] = useState(false)
    const [isLogin,setIsLogin] = useState(false)
    const [localConnection, setLocalConnection] = useState(null)
    const [localStream, setLocalStream] = useState(null)
    const [connectedUser, setConnectedUser] = useState(null)
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    useEffect(() => {
        
        // localStorage.setItem('myCat', 'Tom')
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
        
        listenToConnectionEvents(localConnection, username, userToCall, database, swap ? remoteVideoRef : localVideoRef, doCandidate)
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
                listenToConnectionEvents(localConnection, username, notif.from, database,  swap ? remoteVideoRef : localVideoRef, doCandidate)
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

    const changeCamera = () => {
        setSwap(!swap)
        let a = remoteVideoRef.current.srcObject
        remoteVideoRef.current.srcObject = localVideoRef.current.srcObject
        localVideoRef.current.srcObject = a
    }
    const closeConnection = () => {
        localStorage.setItem("videoStatus",false)
        remoteVideoRef.current.srcObject = null
        localVideoRef.current.srcObject = null
    }
    localStorage.setItem("videoStatus",true)
    return (
        <Row style={{width:'100%', height:'100%'}}>
            <Col span={24}
                style={{display:'flex', justifyContent:'center', alignItems:'center'}}
            >
                <div className={'videoContainerFS'}>
                    <video muted={swap} className={'bigVideo-fs'} ref={remoteVideoRef} autoPlay playsInline></video>
                    <video muted={!swap} className={'smallVideo-fs'} ref={localVideoRef} autoPlay playsInline></video>
                    <div className={'noCallerContainer'}>
                         <UserOutlined style={{fontSize:'50px'}} />
                    </div>
                    <div className={'control-div-fs'}>
                        {/* <Button className={'call-button-fs'} onClick={() => dialSomeone(userName, personID)} type="primary">Call</Button> */}
                        <Button className={'button-swap-fs'} onClick={changeCamera}  shape="circle" icon={<RetweetOutlined />} size={25} />
                        <Button className={'button-close-fs'} onClick={closeConnection} type="danger" shape="circle" icon={<CloseOutlined />} size={25} />
                    </div>

                </div>
                   
               
            </Col>
        </Row>
            
            
    )
}

export default VideoContainerFS
