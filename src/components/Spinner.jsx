import React from 'react';

const Spinner = ({ className = 'h-4 w-4' }) => {
    return (
        <span
            aria-hidden="true"
            className={`inline-block shrink-0 rounded-full border-2 border-current border-t-transparent [animation:spin_0.7s_linear_infinite] ${className}`}
        ></span>
    );
};

export default Spinner;
