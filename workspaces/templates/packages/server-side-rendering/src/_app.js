import { jsx as _jsx } from 'react/jsx-runtime';
import React from 'react';
function Wrapped({ Component }) {
  return function Wrapper(props) {
    return _jsx(Component, { ...props });
  };
}
export default Wrapped;
//# sourceMappingURL=_app.js.map
