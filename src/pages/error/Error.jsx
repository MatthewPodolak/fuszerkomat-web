import React, { useRef } from "react";
import Lottie from "lottie-react";
import NotFoundLottie from "@/assets/lotties/404.json";

export default function Error() {
  const lottieRef = useRef();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-7xl px-6 flex flex-col items-center text-center">
        <Lottie
          lottieRef={lottieRef}
          animationData={NotFoundLottie}
          loop
          autoplay
          className="w-3/4 max-w-[500px] md:max-w-[700px] aspect-square -mt-64"
        />
        <p className="mt-6 text-2xl md:text-4xl lg:text-5xl font-marker tracking-widest"> Tego to jeszcze nie zbudowalismy... </p>
      </div>
    </div>
  );
}