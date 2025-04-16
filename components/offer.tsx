import React from "react";

const Offer = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg p-4 shadow-lg animate-pulse mb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 text-gray-900 font-bold rounded-full px-3 py-1 text-xs uppercase tracking-wider animate-bounce">
            Limited Time
          </div>
          <h3 className="text-white font-bold text-lg md:text-xl">
            30% OFF All Credits!
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-md px-3 py-1.5">
            <span className="text-white text-sm font-mono">LAUNCHOFF</span>
          </div>
          <p className="text-white text-sm">
            for <span className="font-bold">additional 30% OFF</span> at
            checkout
          </p>
        </div>
      </div>
    </div>
  );
};

export default Offer;
