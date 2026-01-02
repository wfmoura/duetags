import { useState } from "react";

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-xl">
      <div className="bg-blue-600 text-xs font-medium text-white text-center p-1 leading-none rounded-xl"
           style={{ width: `${progress}%` }}>
        {progress}%
      </div>
    </div>
  );
};

export default ProgressBar;
