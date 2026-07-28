import React from 'react';
import type { PackageFeatureData } from './PackageList';
interface PackageCardProps {
  packageName: string;
  icons: string[];
  selected: boolean;
  disabled?: boolean;
  onChange?(included: boolean): void;
  packageDescription: React.ReactNode;
  features: PackageFeatureData[];
  alwaysIncluded?: boolean;
}
declare const PackageCard: (props: PackageCardProps) => React.ReactNode;
export default PackageCard;
//# sourceMappingURL=PackageCard.d.ts.map
