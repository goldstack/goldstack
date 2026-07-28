import { useRouter } from 'next/router';
import React from 'react';
const TestIdPage = () => {
    const router = useRouter();
    const { id } = router.query;
    return (<div>
      <h1>Test</h1>
      <p>The message is: {id}</p>
    </div>);
};
export default TestIdPage;
//# sourceMappingURL=%5Bid%5D.jsx.map