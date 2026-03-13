import React from 'react';
import { createRippleEffect } from '../../hooks/useRipple';

/**
 * RippleButton - A button component with water wave ripple effect
 * 
 * Usage:
 * <RippleButton className="btn btn-primary" onClick={handleClick}>
 *   Click Me
 * </RippleButton>
 */
const RippleButton = ({ 
  children, 
  onClick, 
  className = 'btn', 
  type = 'button',
  disabled = false,
  ...props 
}) => {
  const handleClick = (e) => {
    if (!disabled) {
      createRippleEffect(e);
      if (onClick) {
        onClick(e);
      }
    }
  };

  return (
    <button
      type={type}
      className={className}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default RippleButton;
