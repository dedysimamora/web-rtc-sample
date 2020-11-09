import React,{useState, useEffect, useRef, createRef} from 'react'

import { Card } from 'antd';

import "./videoContainer.css"

const VideoContainer = () => {
    const localVideoRef = useRef();


    // useEffect(() => {
    //     if (!localVideoRef) {
    //         return
    //       }
    //     const openMediaDevices = async (constraints) => {
    //         return await navigator.mediaDevices.getUserMedia(constraints);
    //     }
        
    //     try {
    //         let video = localVideoRef.current
    //         const stream = openMediaDevices({'video':true,'audio':true});
    //         console.log(stream, "<<<<<<<<<<<<<<< ");
    //         video.srcObject = stream
    //         // video.play()
    //     } catch(error) {
    //         console.error('Error accessing media devices.', error);
    //     }
        
    // }, [localVideoRef])

    useEffect(() => {
        connectVideo()
    }, [])


    const connectVideo = async () => {
            try {
                const constraints = {'video': true, 'audio': true};
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                const videoElement = localVideoRef.current
                videoElement.srcObject = stream;
            } catch(error) {
                console.error('Error opening video camera.', error);
            }
        
    }
    
   

    return (
            <Card  style={{width:'50%', height:'80%',borderRadius:20, border:'1px solid grey' }}>
                <video className={'bigVideo'} ref={localVideoRef} autoPlay playsInline></video>
                <video className={'smallVideo'} ref={localVideoRef} autoPlay playsInline></video>
            </Card>
            
    )
}

export default VideoContainer
