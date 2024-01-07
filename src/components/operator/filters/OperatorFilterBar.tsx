import React from 'react';
import OperatorFilters from './OperatorFilters';
const OperatorFilterBar = () => {
	return <div className="flex gap-6">
		<div>
			<OperatorFilters />
		</div>
		<div>
			Sort By
		</div>
		<div className="flex">
			View
			<div>Switch stuff</div>
		</div>
	</div>
}

export default OperatorFilterBar;