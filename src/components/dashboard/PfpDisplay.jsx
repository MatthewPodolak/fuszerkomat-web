import { useState, useEffect } from "react";
import Fachura from "../../assets/images/Fachura.png";
import User from "../../assets/images/User.png";

export default function PfpDisplay({ size = "medium", source = null, type = "User", overlay = false }) {

  if (!type || (type !== "User" && type !== "Company")) { return null; }

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    ml: "w-16 h-16",
    large: "w-20 h-20",
    xl: "w-54 h-54",
  };

  const fallbackSrc = type === "User" ? User : Fachura;
  const [imgSrc, setImgSrc] = useState(source || fallbackSrc);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  useEffect(() => {
    setImgSrc(source || fallbackSrc);
  }, [source, fallbackSrc]);

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]}`}>
      <img
        src={imgSrc}
        onError={handleError}
        alt={`${type} Profile`}
        className="w-full h-full object-cover rounded-full border-2 border-primary shadow-2xl"
      />

      {overlay && (
        <div className="absolute cursor-pointer inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300"></div>
      )}
    </div>
  );
}