import React from 'react';

export const DownloadInstructionsStep = (props: {
  title: string;
  stepNumber: number;
  children: React.ReactNode;
}): JSX.Element => {
  return (
    <>
      <div className="space-1 card bg-light shadow-none p-3 mt-4 rounded">
        <div className="media">
          <div className="avatar mr-5">
            <span className="avatar avatar-primary avatar-primary avatar-circle">
              <span className="avatar-initials">{props.stepNumber}</span>
            </span>
          </div>
          <div className="media-body">
            <span className="d-block text-dark font-weight-bold">{props.title}</span>
            {props.children}
          </div>
        </div>
      </div>
    </>
  );
};
