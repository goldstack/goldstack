import type React from 'react';
import Row from 'react-bootstrap/Row';

import PackageCard from './PackageCard';
export interface PackageFeatureData {
  name: string;
}
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
  disabled?: boolean;
  onSelect(packageId: string): void;
  onDeselect(packageId: string): void;
}

const PackageList = (props: PackageListProps): JSX.Element => {
  const selectedIds = props.selectedPackages;

  return (
    <>
      {props.items.map((item, index): React.ReactNode => {
        return (
          <div key={index} className="col-sm-6 col-md-4 px-2 mb-3">
            <PackageCard
              packageName={item.packageName}
              features={item.features}
              packageDescription={item.packageDescription}
              icons={item.icons}
              disabled={props.disabled}
              selected={selectedIds && selectedIds.includes(item.packageId || 'undefined')}
              alwaysIncluded={item.alwaysIncluded}
              onChange={(included): void => {
                if (included) {
                  props.onSelect(item.packageId || 'wrong package id');
                } else {
                  props.onDeselect(item.packageId || 'wrong package id');
                }
              }}
            ></PackageCard>
          </div>
        );
      })}
    </>
  );
};

export default PackageList;
