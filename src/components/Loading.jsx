import React from 'react';

const Loading = ({ label = 'Loading...' }) => {
    return (
        <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-4">
            <span className="h-10 w-10 rounded-full border-4 border-violet-100 border-t-violet [animation:spin_0.8s_linear_infinite]"></span>
            <p className="text-sm font-semibold text-ink/50">{label}</p>
        </div>
    );
};

export default Loading;
