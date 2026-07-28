import React from 'react';
export interface PackageFeatureData {
  name: string;
}
export interface PackageListItem {
  alwaysIncluded?: boolean;
  packageName: string;
  packageId?: string;
  selected: boolean;
  packageDescription: string | React.ReactNode;
  icons: string[];
  features: PackageFeatureData[];
}
interface PackageListProps {
  items: PackageListItem[];
  selectedPackages: string[];
  disabled?: boolean;
  onSelect(packageId: string): void;
  onDeselect(packageId: string): void;
}
declare const PackageList: (props: PackageListProps) => React.ReactNode;
export default PackageList;
//# sourceMappingURL=PackageList.d.ts.map
