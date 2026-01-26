import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}