import React, { useState } from 'react';

import Plus from './../icons/font-awesome/solid/plus.svg';
import Check from './../icons/font-awesome/solid/check.svg';

import styled from 'styled-components';

import { dataUriToSrc } from './../utils/utils';

interface PackageCardProps {
  packageName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icons: any[];
  selected: boolean;
  onChange?(included: boolean): void;
  children: React.ReactNode;
  alwaysIncluded?: boolean;
}

const FontIcon = styled.span`
  svg {
    height: 0.875rem;
    vertical-align: text-top;
    margin-top: 0.25rem;
    margin-left: 0.25rem;
    margin-right: 0.25rem;
    stroke-width: 25;
  }
`;
const IncludedPackageCardStyle = styled.div`
  border: none;
  p {
    margin-bottom: 0;
  }
  .avatar-img {
    margin-bottom: 0.25rem;
  }
`;
const OptionalPackageCardStyle = styled.div`
  border: 0.0625rem solid #e7eaf3 !important;
  p {
    margin-bottom: 0;
  }
  .avatar-img {
    margin-bottom: 0.25rem;
  }
`;

const FeatureList = styled.span`
  ul {
    padding-left: 1rem;
    margin-bottom: 0;
  }

  li {
    list-style-type: none;
    padding-left: 1rem;
  }

  li:before {
    content: '✔';
    margin: 0 10px 0 -1.6em;
    color: #00c9a7;
  }
`;

const IncludeFooter = styled.div`
  background-color: #377dff;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  &:hover {
    background-color: #0069d9;
  }

  svg {
    fill: white;
    stroke: white;
  }
`;

const IncludedFooter = styled.div`
  color: #fff;
  background-color: #00c9a7;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  &:hover {
    background-color: #03af92;
    color: #fff;
  }

  svg {
    fill: #fff;
    stroke: #fff;
  }
`;

const AlwaysIncludedFooter = styled.div`
  color: #71869d;
  background-color: rgba(113, 134, 157, 0.1);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  &:hover {
    background-color: rgba(113, 134, 157, 0.1);
    color: #71869d;
  }

  svg {
    fill: #71869d;
    stroke: #71869d;
  }
`;

const PackageCard = (props: PackageCardProps): JSX.Element => {
  const [included, setIncluded] = useState(props.selected);
  const toggleIncluded = (): void => {
    if (props.onChange) {
      props.onChange(!included);
    }
    setIncluded(!included);
  };
  const CardStyle = props.alwaysIncluded
    ? IncludedPackageCardStyle
    : OptionalPackageCardStyle;
  const plusSvg = dataUriToSrc(Plus);
  const checkSvg = dataUriToSrc(Check);
  return (
    <CardStyle className="card card-frame h-100">
      <div className="card-body">
        <div className="media">
          <div className="avatar avatar-xs mt-1 mr-3">
            {props.icons.map((icon, index) => {
              return (
                <img key={index} className="avatar-img" src={icon} alt="" />
              );
            })}
          </div>
          <div className="media-body">
            <div className="d-flex align-items-center">
              <span className="d-block text-dark font-weight-bold">
                {props.packageName}
              </span>
            </div>
            <FeatureList className="d-block text-body">
              {props.children}
            </FeatureList>
          </div>
        </div>
      </div>
      {!included && !props.alwaysIncluded && (
        <IncludeFooter
          className="card-footer btn btn-primary btn-sm"
          onClick={toggleIncluded}
        >
          <FontIcon dangerouslySetInnerHTML={{ __html: plusSvg }}></FontIcon>
          Add to Project
        </IncludeFooter>
      )}
      {included && !props.alwaysIncluded && (
        <IncludedFooter
          className="card-footer btn btn-success btn-sm"
          onClick={toggleIncluded}
        >
          <FontIcon dangerouslySetInnerHTML={{ __html: checkSvg }}></FontIcon>
          Included in Project
        </IncludedFooter>
      )}
      {props.alwaysIncluded && false && (
        <AlwaysIncludedFooter className="card-footer text-center btn-sm">
          <FontIcon dangerouslySetInnerHTML={{ __html: checkSvg }}></FontIcon>
          Included in Project
        </AlwaysIncludedFooter>
      )}
    </CardStyle>
  );
};

export default PackageCard;
