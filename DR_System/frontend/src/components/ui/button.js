// src/components/ui/button.js

import React from "react";

export const Button = ({ children, onClick }) => {
    return (
        <button
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
            onClick={onClick}
        >
            {children}
        </button>
    );
};
