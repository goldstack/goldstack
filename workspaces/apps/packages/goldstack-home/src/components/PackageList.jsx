import React from 'react';
import PackageCard from './PackageCard';
const PackageList = (props) => {
    const selectedIds = props.selectedPackages;
    return (<>
      {props.items.map((item, index) => {
            return (<div key={index} className="col-sm-6 col-md-4 px-2 mb-3">
            <PackageCard packageName={item.packageName} features={item.features} packageDescription={item.packageDescription} icons={item.icons} disabled={props.disabled} selected={selectedIds === null || selectedIds === void 0 ? void 0 : selectedIds.includes(item.packageId || 'undefined')} alwaysIncluded={item.alwaysIncluded} onChange={(included) => {
                    if (included) {
                        props.onSelect(item.packageId || 'wrong package id');
                    }
                    else {
                        props.onDeselect(item.packageId || 'wrong package id');
                    }
                }}></PackageCard>
          </div>);
        })}
    </>);
};
export default PackageList;
//# sourceMappingURL=PackageList.jsx.map