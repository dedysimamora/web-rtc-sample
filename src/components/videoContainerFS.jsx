import React,{useState, useEffect, useRef, createRef} from 'react'

import { Card, Row, Col, Input, Button } from 'antd';
import {UserOutlined} from '@ant-design/icons';
import firebase from 'firebase/app'
import 'firebase/database'
import 'webrtc-adapter'
import _ from 'lodash'
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
            RetweetOutlined,
            PhoneOutlined,
            PoweroffOutlined
          } from '@ant-design/icons';

import "./videoContainerFS.css"

const userName = _.times(5, () => _.random(35).toString(36)).join('')
const VideoContainerFS = () => {
    const [personID, setPersonID] = useState(null)
    const [callStatus, setCallStatus] = useState(false)
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
        
        listenToConnectionEvents(localConnection, username, userToCall, database, swap ? localVideoRef : remoteVideoRef, doCandidate)
        // create an offer
        createOffer(localConnection, localStream, userToCall, doOffer, database, username)
      }

    const callSomeone = () => {
        if(callStatus){
            dialSomeone(userName,personID)
            setCallStatus(!callStatus)
        } else {
            setCallStatus(!callStatus)
        }

    }

    const handleInputChange = (e) => {
        setPersonID(e.target.value);
    }

    const loginButtonFunc = () => {
        if(!isLogin){
            doLogin(userName, database, handleUpdate)
            setIsLogin(true)
        }
    }


    const handleUpdate = (notif, username) => {
        if (notif) {
            switch (notif.type) {
              case 'offer':
                setConnectedUser(notif.from)
                listenToConnectionEvents(localConnection, username, notif.from, database,  swap ? localVideoRef : remoteVideoRef, doCandidate)
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
        localConnection.close()
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
                    <div className={'userNamecontainer'}>

                    <p className={'userNameText'}>{`Your ID : ${userName}`}</p>
                    </div>
                    <div className={'control-div-fs'}>
                        {
                            callStatus 
                            ? 
                                <Input vvalue={personID} onChange={handleInputChange}  className={'person-id-fs'} placeholder="Destination UserID" />
                            :
                                (
                                    <>
                                        <Button className={'button-swap-fs'} onClick={changeCamera}  shape="circle" icon={<RetweetOutlined />} size={25} />
                                        <Button className={'button-close-fs'} onClick={closeConnection} type="danger" shape="circle" icon={<CloseOutlined />} size={25} />
                                    </>
                                )
                            
                        }
                        
                        <Button className={'button-call-fs'} onClick={callSomeone} style={callStatus ? {backgroundColor:'#00CC00'} : {backgroundColor:'#358DC5'}}  shape="circle" icon={<PhoneOutlined className="phoneIcon" />} size={25} />
                        <Button className={'login-call-fs'} onClick={loginButtonFunc} style={isLogin ? {backgroundColor:'#00CC00'} : {backgroundColor:'#7C7C7C'}}  shape="circle" icon={<PoweroffOutlined className="phoneIcon"  />} size={25} />
                    </div>

                </div>
                   
               
            </Col>
        </Row>
            
            
    )
}

export default VideoContainerFS
