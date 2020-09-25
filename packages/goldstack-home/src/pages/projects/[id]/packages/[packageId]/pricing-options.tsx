import React from 'react';
import { useRouter } from 'next/router';

import Pricing from 'src/components/Pricing';

const PricingOptionsPage = (): JSX.Element => {
  const router = useRouter();
  const { id, packageId } = router.query;
  return (
    <Pricing
      title="Pricing Options"
      actionTitle="Select"
      actionLink={`/projects/${id}/packages/${packageId}/purchase-template`}
    ></Pricing>
  );
};

export default PricingOptionsPage;
