import React from 'react';

import DesktopComputerImg from 'src/img/desktop_computer.jpg';
import TabletImg from 'src/img/tablet.jpg';
import MeetingImg from 'src/img/meeting.jpg';

import Image from 'next/image';

import { TextSectionProps } from '@goldstack/template-metadata';

const TextSection = (props: TextSectionProps): JSX.Element => {
  return (
    <>
      <div className="container space-2">
        <div className="row justify-content-lg-between align-items-lg-center">
          <div className="col-lg-5 mb-9 mb-lg-0">
            <div className="mb-3">
              <h2 className="h1">{props.title}</h2>
            </div>
            <div dangerouslySetInnerHTML={{ __html: props.content }}></div>

            {props.action && (
              <div className="mt-4">
                <a
                  className="btn btn-primary btn-wide transition-3d-hover"
                  href={props.action.link}
                >
                  {props.action.title}
                </a>
              </div>
            )}
          </div>

          <div className="col-lg-6 col-xl-5">
            <div
              className="position-relative min-h-500rem mx-auto"
              style={{ maxWidth: '28rem' }}
            >
              <figure className="position-absolute top-0 right-0 z-index-2 mr-11">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 450 450"
                  width="165"
                  height="165"
                >
                  <g>
                    <defs>
                      <path
                        id="circleImgID2"
                        d="M225,448.7L225,448.7C101.4,448.7,1.3,348.5,1.3,225l0,0C1.2,101.4,101.4,1.3,225,1.3l0,0
                  c123.6,0,223.7,100.2,223.7,223.7l0,0C448.7,348.6,348.5,448.7,225,448.7z"
                      />
                    </defs>
                    <clipPath id="circleImgID1">
                      <use xlinkHref="#circleImgID2" />
                    </clipPath>
                    <g clipPath="url(#circleImgID1)">
                      <image
                        width="450"
                        height="450"
                        xlinkHref={DesktopComputerImg.src}
                      ></image>
                    </g>
                  </g>
                </svg>
              </figure>

              <figure className="position-absolute top-0 left-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 335.2 335.2"
                  width="120"
                  height="120"
                >
                  <circle
                    fill="none"
                    stroke="#377DFF"
                    strokeWidth="75"
                    cx="167.6"
                    cy="167.6"
                    r="130.1"
                  />
                </svg>
              </figure>

              <figure className="d-none d-sm-block position-absolute top-0 left-0 mt-11">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 515 515"
                  width="200"
                  height="200"
                >
                  <g>
                    <defs>
                      <path
                        id="circleImgID4"
                        d="M260,515h-5C114.2,515,0,400.8,0,260v-5C0,114.2,114.2,0,255,0h5c140.8,0,255,114.2,255,255v5
                  C515,400.9,400.8,515,260,515z"
                      />
                    </defs>
                    <clipPath id="circleImgID3">
                      <use xlinkHref="#circleImgID4" />
                    </clipPath>
                    <g clipPath="url(#circleImgID3)">
                      <image
                        width="515"
                        height="515"
                        xlinkHref={TabletImg.src}
                        transform="matrix(1 0 0 1 1.639390e-02 2.880859e-02)"
                      ></image>
                    </g>
                  </g>
                </svg>
              </figure>

              <figure
                className="position-absolute top-0 right-0"
                style={{ marginTop: '11rem', marginRight: '13rem' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 67 67"
                  width="25"
                  height="25"
                >
                  <circle fill="#00C9A7" cx="33.5" cy="33.5" r="33.5" />
                </svg>
              </figure>

              <figure
                className="position-absolute top-0 right-0 mr-3"
                style={{ marginTop: '8rem' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 141 141"
                  width="50"
                  height="50"
                >
                  <circle fill="#FFC107" cx="70.5" cy="70.5" r="70.5" />
                </svg>
              </figure>

              <figure className="position-absolute bottom-0 right-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 770.4 770.4"
                  width="280"
                  height="280"
                >
                  <g>
                    <defs>
                      <path
                        id="circleImgID6"
                        d="M385.2,770.4L385.2,770.4c212.7,0,385.2-172.5,385.2-385.2l0,0C770.4,172.5,597.9,0,385.2,0l0,0
                  C172.5,0,0,172.5,0,385.2l0,0C0,597.9,172.4,770.4,385.2,770.4z"
                      />
                    </defs>
                    <clipPath id="circleImgID5">
                      <use xlinkHref="#circleImgID6" />
                    </clipPath>
                    <g clipPath="url(#circleImgID5)">
                      <image
                        width="900"
                        height="900"
                        xlinkHref={MeetingImg.src}
                        transform="matrix(1 0 0 1 -64.8123 -64.8055)"
                      ></image>
                    </g>
                  </g>
                </svg>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TextSection;
