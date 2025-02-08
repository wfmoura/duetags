import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div style={{ width: '100%', backgroundColor: '#f3f3f3', borderRadius: '5px' }}>
      <div style={{ width: `${progress}%`, backgroundColor: '#4caf50', height: '10px', borderRadius: '5px' }}></div>
    </div>
  );
};

export default ProgressBar;