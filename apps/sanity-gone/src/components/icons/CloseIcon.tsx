import React from "react";

const CloseIcon: React.FC<React.HTMLAttributes<SVGElement>> = (props) => {
  return (
    <svg {...props} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M9.75592 0.244078C10.0814 0.569515 10.0814 1.09715 9.75592 1.42259L1.42259 9.75592C1.09715 10.0814 0.569515 10.0814 0.244078 9.75592C-0.0813592 9.43049 -0.0813592 8.90285 0.244078 8.57741L8.57741 0.244078C8.90285 -0.0813592 9.43049 -0.0813592 9.75592 0.244078Z"
              fill="currentColor" />
        <path fillRule="evenodd" clipRule="evenodd"
              d="M0.244078 0.244078C0.569515 -0.0813592 1.09715 -0.0813592 1.42259 0.244078L9.75592 8.57741C10.0814 8.90285 10.0814 9.43049 9.75592 9.75592C9.43049 10.0814 8.90285 10.0814 8.57741 9.75592L0.244078 1.42259C-0.0813592 1.09715 -0.0813592 0.569515 0.244078 0.244078Z"
              fill="currentColor" />
      </g>
    </svg>
  );
};

export default CloseIcon;
