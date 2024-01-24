import React from "react";
import "./style.css";

export const BarIcon = ({ className }) => {
  return (
    <div className={`bar-icon ${className}`}>
      <div className="rectangle" />
      <div className="div" />
      <div className="rectangle-2" />
      <div className="rectangle-3" />
    </div>
  );
};