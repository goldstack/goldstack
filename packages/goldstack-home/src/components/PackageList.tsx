import React, { useState, useEffect } from 'react';

import PackageFeature, { PackageFeatureData } from './PackageFeature';
import PackageCard from './PackageCard';
import styled from 'styled-components';

export interface PackageListItem {
  alwaysIncluded?: boolean;
  packageName: string;
  packageId?: string;
  selected: boolean;
  packageDescription: string | JSX.Element;
  icons: any[];
  features: PackageFeatureData[];
}

interface PackageListProps {
  items: PackageListItem[];
  selectedPackages: string[];
  onSelect(packageId: string): void;
  onDeselect(packageId: string): void;
}

const PackageDescription = styled.div`
  ul {
    padding-left: 1rem;
  }

  li {
    list-style-type: none;
    padding-left: 1rem;
  }

  li:before {
    content: '✔';
    margin: 0 10px 0 -1.6em;
    color: #17aa1c;
  }
`;

const FeatureList = styled.ul`
  margin-top: 0.25rem;
`;

const PackageList = (props: PackageListProps): JSX.Element => {
  const selectedIds = props.selectedPackages;

  return (
    <>
      {props.items.map(
        (item, index): React.ReactNode => {
          return (
            <div key={index} className="col-sm-6 col-md-4 px-2 mb-3">
              <PackageCard
                packageName={item.packageName}
                icons={item.icons}
                selected={
                  selectedIds &&
                  selectedIds.includes(item.packageId || 'undefined')
                }
                alwaysIncluded={item.alwaysIncluded}
                onChange={(included): void => {
                  if (included) {
                    props.onSelect(item.packageId || 'wrong package id');
                  } else {
                    props.onDeselect(item.packageId || 'wrong package id');
                  }
                }}
              >
                <PackageDescription>
                  {item.packageDescription}
                </PackageDescription>
                <FeatureList>
                  {item.features.map((feature, index) => {
                    return <PackageFeature key={index} {...feature} />;
                  })}
                </FeatureList>
              </PackageCard>
            </div>
          );
        }
      )}
    </>
  );
};

export default PackageList;
