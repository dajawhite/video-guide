"use client"

import { ArrowUp, ChevronsRight, PlayCircle, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { FaPlay } from 'react-icons/fa';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

gsap.registerPlugin(ScrollToPlugin)

function VideoSteps() {
    const [isPausedByApp, setIsPausedByApp] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isRunning, setIsRunning] = useState(false)
    const playerRef = useRef(null)
    let interval
    const stepEndTimes = [24, 51, 68, 100]
    const stepDuration = [24, 27, 17, 32]
    const [step, setStep] = useState(0)
    const [scrollThrough, setScrollThrough] = useState(false)
    const scrollThroughRef = useRef(scrollThrough)
    // if user clicks youtube play button rather than
    const [timerKey, setTimerKey] = useState(0)

    const scrollTl = useRef(null)

    // YT API Setup
    useEffect(() => {
        var tag = document.createElement('script')
        tag.src = "https://www.youtube.com/iframe_api"
        var firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

        var newPlayer;
        // use window because YT API looks for globally accessible function
        // in JS window represents the global scope
        window.onYouTubeIframeAPIReady = function() {
            newPlayer = new YT.Player('player', {
                height: '390',
                width: '640',
                videoId: 'hnAQTWUTwEg',
                playerVars: {
                    'playsinline': 1,
                    'enablejsapi': 1,
                    'rel': 0,
                    'fs': 0,
                    'autoplay': 0,
                    'controls': 0,
                    'disablekb':1
                },
                events: {
                    'onStateChange': onPlayerStateChange
                }
            })
            playerRef.current = newPlayer
        }
    })

    // Updates playing state and calls for time checks
    const onPlayerStateChange = (event) => {
        clearInterval(interval)
        if(event.data === YT.PlayerState.PAUSED){
            setIsPlaying(false)
        }
        if(event.data === YT.PlayerState.PLAYING){
            setIsPausedByApp(false)
            setIsPlaying(true)
            interval = setInterval(() => {
                checkCurrentTime()
            }, 1000)
        }
        else if(event.data === YT.PlayerState.ENDED){
            setStep(4)
            setIsPlaying(false)
        }
    }

    // Sets instructions based on playback time
    const checkCurrentTime = () => {
        if(playerRef.current){
            const currentTime = Math.floor(playerRef.current.getCurrentTime())
            //if at an exact time pause the video (user will decide to replay or continue)
            if(!scrollThroughRef.current){ //this condition because when scrollThrough is truthy, allow user to freely scroll and scrub through the video
                if(stepEndTimes.includes(currentTime)){
                    playerRef.current.pauseVideo()
                    setIsPausedByApp(true)
                }
                else if(currentTime >= 0 && currentTime < 24){
                    setStep(0)
                }
                else if(currentTime >= 25 && currentTime < 51){
                    setStep(1)
                }
                else if(currentTime >= 52 && currentTime < 68){
                    setStep(2)
                }
                else if(currentTime >= 69 && currentTime < 100){
                    setStep(3)
                }
                else if(currentTime >= 101 && currentTime < 103){
                    setStep(4)
                }
            }            
        }
    }

    const handleReplay = () => {
        //remove video overlay
        setIsPausedByApp(false)
        //replay step 1, step state will be 1, set playback time to stepTime[step - 1], bring it back to 24
        if(playerRef.current){
            playerRef.current.seekTo(stepEndTimes[step - 1])
            playerRef.current.playVideo()
        }
        setTimerKey(prevKey => prevKey + 1)
    }

    const handleNextStep = () => {
        setIsPausedByApp(false)
        if(playerRef.current){
            setStep(step + 1)
            playerRef.current.playVideo()
        }
    }

    // Whenever step changes, SCROLL() is automatically called.
    useEffect(() => {
        SCROLL()
        setTimerKey(prevKey => prevKey + 1)
        return () => {
            if(scrollTl.current) scrollTl.current.kill()
        }
    }, [step])

    useEffect(() => {
        scrollThroughRef.current = scrollThrough
    },[scrollThrough])

    const SCROLL = () => {
        if(scrollTl.current) scrollTl.current.kill()
        if(step == 5){
            scrollTl.current = gsap.to('#steps_div',{duration: 0.5, scrollTo: {y:`#step_${step}`, offsetY:0}})
        }
        else{
            scrollTl.current = gsap.to('#steps_div',{duration: 0.5, scrollTo: {y:`#step_${step}`, offsetY:20}})
        }
    }

    const SCROLLTHROUGH = () => {
        if(scrollTl.current) scrollTl.current.kill()
        scrollTl.current = gsap.to("#steps_div",{duration: 0.5, scrollTo: 0})
    }

    const handleStart = () => {
        if(playerRef.current){
            playerRef.current.playVideo()
        }
        setIsRunning(true)
        // set() functions as a zero duration tween
        gsap.set("#steps_div", {
            display: "block",
            x: "100%", 
            autoAlpha: 0
        });
        
        gsap.to("#steps_div", {
        x: 0, 
        autoAlpha: 1, 
        duration: 0.5, 
        ease: "power2.out"
        });

        gsap.to('#duration_overlay',{
            autoAlpha: 0,
            duration: 0.5
        })

    }

    // once already set, button doesn't work again
    const handleBackThrough = () => {
        setIsRunning(false)
        setScrollThrough(true)
        SCROLLTHROUGH()
    }

  return (
    <>
        <div className='bg-white rounded-lg h-[390px] items-center flex flex-row shadow-lg relative'>
            {/* start card */}
            <div id='start_div' className='h-full w-[400px] bg-white rounded-lg p-9 flex flex-row items-center relative z-10'>
                <div>
                    <h1 className=' text-2xl font-medium mb-6'>Follow this video guide</h1>
                    <p className='mb-9 text-base font-light'>To configure your branding in HoneyBook, complete the 4 steps in this interactive video guide.</p>
                    <div className='group h-[50px] w-[125px] cursor-pointer'>
                        <button onClick={handleStart} className='relative z-10 bg-[#FEE715] group-hover:bg-[#e6d200] transition-colors ease-in-out group-hover:transition-colors group-hover:ease-in-out px-8 h-11 text-black flex items-center rounded-full font-normal'>Start <FaPlay size={12} color='black' className='ml-2'></FaPlay></button>
                        <div className='relative -top-[42px] z-0 h-[45px] w-[121px] rounded-full bg-[#e6d200] group-hover:bg-[#b3a800] transition-colors ease-in-out group-hover:transition-colors group-hover:ease-in-out'></div>
                    </div>
                </div>
            </div>
            {/* steps */}
            <div id='steps_div' className={`h-full w-[400px] bg-[#f9f9f9] p-5 rounded-tl-lg rounded-bl-lg snap-y snap-mandatory snap-always ${scrollThrough ?'overflow-scroll' :'overflow-hidden'} absolute hidden left-0  z-20`}>
                {/* 1 */}
                    <div className='h-[355px] snap-center z-50 relative ' id='step_0'>
                        <div className='w-[1px] h-[277px] bg-[#e7e7e8] z-10 absolute left-[38px] top-[80px]'></div>
                        {/* title */}
                        <div className=' bg-white rounded-sm p-[18px] mb-8 z-20 relative' style={{ boxShadow: '0 1px 3px 0 rgba(22, 45, 61, 0.12)',boxShadow:'0 6px 12px 0 rgba(22, 45, 61, 0.1)' }}>
                            <div className='flex flex-row items-center'>
                                <div className='bg-white border border-[#fee715] h-[48px] w-[48px] rounded-full relative flex items-center justify-center mr-3' style={{ boxShadow: '0 0 6px #fff26d' }}>
                                    <span className='absolute align-middle text-center mt-[1px] text-2xl font-medium'>
                                        1
                                        <sup className='transform translate-y-[3px] text-[#b7b9bc] text-base inline-block '>/4</sup>
                                    </span>
                                    
                                </div>
                                <h1 className='font-medium text-xl'>Customize your brand</h1>
                            </div>
                        </div>
                        {/* details */}
                        <div className='ml-[36px] z-20 relative'>
                            <ul className=''>
                                <li className='inline-flex mb-[18px] text-base'>
                                    <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                    <p>Before getting started <span className='underline text-blue-600 cursor-pointer'>log in</span> to your account</p>
                                </li>
                            </ul>
                        </div> 
                    </div>
                {/* 2 */}
                    <div className='h-[355px] snap-center z-50 relative ' id='step_1'>
                    <div className='w-[1px] h-[277px] bg-[#e7e7e8] z-10 absolute left-[38px] top-[80px]'></div>
                    {/* title */}
                    <div className=' bg-white rounded-sm p-[18px] mb-8 z-20 relative' style={{ boxShadow: '0 1px 3px 0 rgba(22, 45, 61, 0.12)',boxShadow:'0 6px 12px 0 rgba(22, 45, 61, 0.1)' }}>
                        <div className='flex flex-row items-center'>
                            <div className='bg-white border border-[#fee715] h-[48px] w-[48px] rounded-full relative flex items-center justify-center mr-3' style={{ boxShadow: '0 0 6px #fff26d' }}>
                                <span className='absolute align-middle text-center mt-[1px] text-2xl font-medium'>
                                    2
                                    <sup className='transform translate-y-[3px] text-[#b7b9bc] text-base inline-block '>/4</sup>
                                </span>
                                
                            </div>
                            <h1 className='font-medium text-xl'>Add logo and color</h1>
                        </div>
                    </div>
                    {/* details */}
                    <div className='ml-[36px]'>
                        <ul className=''>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Navigate to <span className='font-semibold'>Company Settings</span> from the profile menu</p>
                            </li>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Scroll down to <span className='font-semibold'>Brand Elements</span></p>
                            </li>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Upload a main and secondary logo</p>
                            </li>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Choose a brand color</p>
                            </li>
                        </ul>
                    </div> 
                </div>
                {/* 3 */}
                    <div className='h-[355px] z-50 relative snap-center  ' id='step_2'>
                    <div className='w-[1px] h-[277px] bg-[#e7e7e8] z-10 absolute left-[38px] top-[80px]'></div>
                    {/* title */}
                    <div className=' bg-white rounded-sm p-[18px] mb-8 z-20 relative' style={{ boxShadow: '0 1px 3px 0 rgba(22, 45, 61, 0.12)',boxShadow:'0 6px 12px 0 rgba(22, 45, 61, 0.1)' }}>
                        <div className='flex flex-row items-center'>
                            <div className='bg-white border border-[#fee715] h-[48px] w-[48px] rounded-full relative flex items-center justify-center mr-3' style={{ boxShadow: '0 0 6px #fff26d' }}>
                                <span className='absolute align-middle text-center mt-[1px] text-2xl font-medium'>
                                    3
                                    <sup className='transform translate-y-[3px] text-[#b7b9bc] text-base inline-block '>/4</sup>
                                </span>
                                
                            </div>
                            <h1 className='font-medium text-xl'>Upload additional imagery</h1>
                        </div>
                    </div>
                    {/* details */}
                    <div className='ml-[36px]'>
                        <ul className=''>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Click <span className='uppercase font-semibold'>go to library</span></p>
                            </li>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Upload brand images for file headers, item details, etc.</p>
                            </li>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Select a default header image</p>
                            </li>
                        </ul>
                    </div> 
                </div> 
                {/* 4 */}
                    <div className='h-[355px] snap-center z-50 relative ' id='step_3'>
                    <div className='w-[1px] h-[277px] bg-[#e7e7e8] z-10 absolute left-[38px] top-[80px]'></div>
                    {/* title */}
                    <div className=' bg-white rounded-sm p-[18px] mb-8 z-20 relative' style={{ boxShadow: '0 1px 3px 0 rgba(22, 45, 61, 0.12)',boxShadow:'0 6px 12px 0 rgba(22, 45, 61, 0.1)' }}>
                        <div className='flex flex-row items-center'>
                            <div className='bg-white border border-[#fee715] h-[48px] w-[48px] rounded-full relative flex items-center justify-center mr-3' style={{ boxShadow: '0 0 6px #fff26d' }}>
                                <span className='absolute align-middle text-center mt-[1px] text-2xl font-medium'>
                                    4
                                    <sup className='transform translate-y-[3px] text-[#b7b9bc] text-base inline-block '>/4</sup>
                                </span>
                                
                            </div>
                            <h1 className='font-medium text-xl'>Integrate Gmail account</h1>
                        </div>
                    </div>
                    {/* details */}
                    <div className='ml-[36px]'>
                        <ul className=''>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Navigate to <span className='font-semibold'>Company Settings</span> from the profile menu</p>
                            </li>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Select the <span className='font-semibold'>Integrations</span> tab on the left</p>
                            </li>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Click <span className='font-semibold'>Connect Google Account</span></p>
                            </li>
                            <li className='inline-flex mb-[18px] text-base'>
                                <span className='w-[6px] h-[6px] bg-[#e7e7e8] rounded-full mt-[9px] mr-[12px] inline-flex' ></span>
                                <p>Enter Google account credentials</p>
                            </li>
                        </ul>
                    </div> 
                </div> 
                {/* 5 */}
                <div className='h-[355px] snap-start z-50 relative -mx-5 ' id='step_4'>
                    {/* back */}
                    <div onClick={handleBackThrough} className=' bg-gray-50 shadow-inner shadow-gray-300 hover:text-black flex flex-col items-center justify-center h-24 w-full relative cursor-pointer'>
                        <ArrowUp className='mb-2'></ArrowUp>
                        <p>Back to steps</p>
                    </div>
                    {/* finish */}
                    <div className='px-10 h-5/6 flex flex-col justify-center items-start border-t border-gray-200'>
                        <h1 className=' text-2xl font-medium mb-6'>Complete!</h1>
                        <p className=' mb-9'>For more help with Honeybook visit our <span className=' text-base underline text-blue-600'><a href='https://help.honeybook.com/en/'>help center</a></span>.</p>
                    </div> 
                </div>  

            </div>
            {/* video */}
            <div className='rounded-tr-lg rounded-br-lg relative z-30'>
                <div id='player' className='h-[390px] w-[640px] bg-slate-300 rounded-tr-lg rounded-br-lg'></div>
                {/* duration overlay */}
                <div id='duration_overlay' className={`h-full w-full z-10 bg-[#101820] absolute top-0 left-0 rounded-tr-lg rounded-br-lg flex flex-col justify-center items-center px-20 opacity-90`}>
                    <div className='flex flex-col items-center justify-center relative top-4'>
                        <PlayCircle size={76} color='white' strokeWidth={1} className='mb-2 cursor-pointer' onClick={handleStart}></PlayCircle>
                        <p className='text-white font-normal'>1:44</p>
                    </div>
                </div>
                {step < 4 && (
                    // countdown timer -- show when !scrollThrough && is playing 
                    <div className={`absolute top-[30px] left-[570px] bg-[#101820a6] bg-opacity-70 z-20 h-[52px] w-[52px] rounded-full flex justify-center items-center ${!scrollThrough && isRunning && !isPausedByApp ? 'visible':'invisible'} text-white`}>
                        <CountdownCircleTimer
                            key={timerKey} 
                            duration={stepDuration[step]} 
                            colors={'#ffffff'} 
                            size={48} 
                            strokeWidth={2} 
                            isPlaying={isPlaying}
                        >
                            {({remainingTime}) => {
                                return `${remainingTime}`
                            }}
                        </CountdownCircleTimer>
                    </div>
                )}
                {/* step completed overlay */}
                <div className={`h-full w-full z-10 bg-[#101820a6] absolute top-0 left-0 rounded-tr-lg rounded-br-lg flex flex-col justify-center items-start px-20 ${isPausedByApp && !scrollThrough ? "visible":"opacity-0 invisible"}`}>
                    <div className='w-full relative -top-5'>
                        <h1 className='text-4xl text-white'>Step {step + 1} Done</h1>
                        <hr className='w-full h-[1px] opacity-30 bg-[#e7e7e8] my-6'></hr>
                        <div className='flex flex-row font-normal'>
                            <div className='group h-11 cursor-pointer'>
                                <button onClick={handleReplay} className='group rounded-full mr-3 outline outline-2 text-white py-2 hover:bg-[#b3a800] hover:outline-[#b3a800] hover:text-white hover:transition-colors hover:ease-in-out hover:duration-200 transition-colors duration-100 outline-white px-6 h-11 relative z-10'>Replay <RotateCcw color='white' className='inline transition-transform ease-in-out duration-300 group-hover:transition-transform group-hover:-rotate-45 group-hover:ease-in-out group-hover:duration-300' size={16}/></button>
                            </div>
                            <div className='group h-11 cursor-pointer'>
                                <button onClick={handleNextStep} className='group rounded-full relative z-10 bg-[#FEE715] outline-1 outline-[#fee715] group-hover:bg-[#e6d200] group-hover:outline-[#e6d200] group-hover:transition-colors group-hover:ease-in-out transition-colors ease-in-out py-2 px-6 h-11'>
                                    <h3 className='transition-transform ease-in-out duration-300 group-hover:translate-x-1 group-hover:ease-in-out group-hover:duration-300'>Next Step <ChevronsRight color='black' className='inline' size={16}/></h3>
                                </button>
                                <div className='relative -top-[42px] z-0 h-[45px] w-[144px] rounded-full bg-[#e6d200] group-hover:bg-[#b3a800] transition-colors ease-in-out group-hover:transition-colors group-hover:ease-in-out'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>   
        </div>
    </>
  )
}

export default VideoSteps