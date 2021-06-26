import React from 'react';

import Pricing from 'src/components/Pricing';

const PricingPage = (): JSX.Element => {
  return (
    <Pricing
      title="Pricing"
      actionTitle="Get Started"
      actionLink={'/'}
    ></Pricing>
  );
};

export default PricingPage;
