import React,{useState, useEffect, useRef, createRef} from 'react'

import { Card, Row, Col, Input, Button, Modal } from 'antd';
import {SyncOutlined, SettingOutlined } from '@ant-design/icons';
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
    const [personID, setPersonID] = useState("")
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null)
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
        if(connectionStatus == "disconnected") {
            setTimeout(() => {
                window.parent.postMessage("vboEndCall", "*");
            }, 1000);
        }
    }, [connectionStatus])
    

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

            const localConnectionVariabel = await initiateConnection(setConnectionStatus)
            await setLocalConnection(localConnectionVariabel)
            // await doLogin('myusername', database, handleUpdate)
        })();
    }, [])

    const showModal = () => {
        setIsModalVisible(true);
      };
    
      const handleOk = () => {
        closeConnection()
        setIsModalVisible(false);
      };

      const handleCancel = () => {
        setIsModalVisible(false);
      };



    
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
        setPersonID(e.target.value.toLowerCase());
    }

    const loginButtonFunc = () => {
        if(!isLogin){
            sessionStorage.setItem('videoCallStatus', "true");
            window.parent.postMessage("user login", "*");
            doLogin(userName, database, handleUpdate)
            setConnectionStatus("alreadyLogin")
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
        window.parent.postMessage("customerEndCall", "*");
        remoteVideoRef.current.srcObject = null
        localVideoRef.current.srcObject = null
    }

    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('refNo');
    console.log(myParam, "<<<<<<<<,,");
    
    return (
        <Row style={{width:'100%', height:'100%'}}>
            <Col span={24}
                style={{display:'flex', justifyContent:'center', alignItems:'center'}}
            >
                <div className={'videoContainerFS'}>
                    <video muted={swap} className={'bigVideo-fs'} ref={remoteVideoRef} autoPlay playsInline></video>
                    <video muted={!swap} className={'smallVideo-fs'} ref={localVideoRef} autoPlay playsInline></video>
                    <div className={'noCallerContainer-fs'}>
                        {
                            connectionStatus == null
                            ? <p className={'info-text'}>Press Login button</p>
                            :  connectionStatus == "alreadyLogin"
                            ? <p className={'info-text'}>Press call button for making a call, or wait until somone call you</p>
                            : connectionStatus == "connecting"
                            ? <p className={'info-text'}> <SyncOutlined className={'loadingSpin'} spin />Calling {personID}</p>
                            :  connectionStatus == "disconected" || connectionStatus == "failed"
                            ? <p className={'info-text'}> <SettingOutlined spin /> Bad connection {personID} </p>
                            : null
                        }
                        
                         {/* <UserOutlined style={{fontSize:'50px'}} /> */}
                    </div>
                    <div className={'userNamecontainer'}>
                        <p className={'userNameText'}>{`Your ID : ${userName}`}</p>
                    </div>
                    {
                        myParam !== null &&
                        <div className={'urlParams'}>
                            <p className={'userNameText'}>{`hased refnumber : ${myParam}`}</p>
                         </div>
                    }
                    
                    <div className={'control-div-fs'}>
                        {
                            callStatus 
                            ? 
                                <Input maxLength={5} value={personID} onChange={handleInputChange}  className={'person-id-fs'} placeholder="Destination UserID" />
                            :
                                (
                                    <>
                                        <Button className={'login-call-fs'} onClick={loginButtonFunc} style={isLogin ? {backgroundColor:'#00CC00'} : {backgroundColor:'#7C7C7C'}}  shape="circle" icon={<PoweroffOutlined className="phoneIcon"  />} size={25} />
                                        <Button className={'button-swap-fs'} onClick={changeCamera}  shape="circle" icon={<RetweetOutlined />} size={25} />
                                        <Button disabled={!isLogin} className={'button-close-fs'} onClick={showModal} type="danger" shape="circle" icon={<CloseOutlined />} size={25} />
                                    </>
                                )
                            
                        }
                        
                        <Button disabled={!isLogin || (callStatus && personID.length != 5) || connectionStatus == "connecting" } className={'button-call-fs'} onClick={callSomeone} shape="circle" icon={<PhoneOutlined className="phoneIcon" />} size={25} />
                    </div>

                </div>
                   
               
            </Col>
            <Modal
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                    <h3>Are You sure ?</h3>
                </Modal>
        </Row>
            
            
    )
}

export default VideoContainerFS
