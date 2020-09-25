import React from 'react';

import styled from 'styled-components';

export interface PackageFeatureData {
  name: string;
}

const PackageFeatureItem = styled.li``;

const PackageFeature = (props: PackageFeatureData): JSX.Element => {
  return <PackageFeatureItem>{props.name}</PackageFeatureItem>;
};

export default PackageFeature;
