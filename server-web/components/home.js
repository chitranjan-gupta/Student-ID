"use client";
import { useState, useRef, useEffect } from "react";
import {
  Stepper,
  Step,
  Carousel,
  Button,
  IconButton,
} from "@material-tailwind/react";
import {
  CogIcon,
  UserIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import Connect from "./connect";
import Wallet from "./wallet";
import Register from "./register";

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLastStep, setIsLastStep] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(false);
  const [oob, setOob] = useState({});
  const [isLast, setIsLast] = useState(true);
  const showPrev = useRef();
  const showNext = useRef();
  const handleNext = () => {
    if (!isLastStep && !isLast) {
      setActiveStep((cur) => cur + 1);
      showNext.current.click();
    }
  };
  const handlePrev = () => {
    if (!isFirstStep) {
      setActiveStep((cur) => cur - 1);
      showPrev.current.click();
    }
  };
  const getOOBUrl = async () => {
    const res = await fetch(
      "https://studentid.onrender.com/oobs/create-invitation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    setOob(data);
  };
  useEffect(() => {
    if (oob.invitationUrl) {
      setIsLast(false);
    }
  }, [oob]);
  return (
    <div className="w-full h-full px-40 pt-20 overflow-hidden">
      <Stepper
        activeStep={activeStep}
        isLastStep={(value) => setIsLastStep(value)}
        isFirstStep={(value) => setIsFirstStep(value)}
        className="w-full h-5"
      >
        <Step onClick={() => setActiveStep(0)}>
          <UserIcon className="h-5 w-5" />
        </Step>
        <Step onClick={() => setActiveStep(1)}>
          <CogIcon className="h-5 w-5" />
        </Step>
        <Step onClick={() => setActiveStep(2)}>
          <BuildingLibraryIcon className="h-5 w-5" />
        </Step>
        <Step onClick={() => setActiveStep(3)}>
          <BuildingLibraryIcon className="h-5 w-5" />
        </Step>
      </Stepper>
      <Carousel
        className="rounded-xl w-full h-3/4 mt-2 overflow-hidden"
        transition={{ duration: 1 }}
        navigation={({ setActiveIndex, activeIndex, length }) => (
          <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
            {new Array(length).fill("").map((_, i) => (
              <span
                key={i}
                className={`hidden h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                  activeIndex === i ? "w-8 bg-black" : "w-4 bg-black/50"
                }`}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}
        prevArrow={({ handlePrev }) => (
          <IconButton
            variant="text"
            color="blue"
            size="lg"
            ref={showPrev}
            onClick={handlePrev}
            className="!absolute top-2/4 left-4 -translate-y-2/4 opacity-0 hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </IconButton>
        )}
        nextArrow={({ handleNext }) => (
          <IconButton
            variant="text"
            color="blue"
            size="lg"
            ref={showNext}
            onClick={handleNext}
            className="!absolute top-2/4 !right-4 -translate-y-2/4 opacity-0 hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </IconButton>
        )}
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 grid h-full w-full place-items-center">
            <Wallet choose={getOOBUrl} />
          </div>
        </div>
        <div className="relative w-full h-full">
          <div className="absolute inset-0 grid h-full w-full place-items-center">
            <Connect url={oob} />
          </div>
        </div>
        <div className="relative w-full h-full">
          <div className="absolute inset-0 grid h-full w-full place-items-center">
            <Register forward={handleNext} />
          </div>
        </div>
        <div className="relative w-full h-full">
          <div className="absolute inset-0 grid h-full w-full place-items-center"></div>
        </div>
      </Carousel>
      <div className="flex justify-between">
        <Button onClick={handlePrev} disabled={isFirstStep}>
          Prev
        </Button>
        <Button onClick={handleNext} disabled={isLast}>
          Next
        </Button>
      </div>
    </div>
  );
}
