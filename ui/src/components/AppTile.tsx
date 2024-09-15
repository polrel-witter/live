import React, { useState } from 'react';

function normalizeUrbitColor(color: string): string {
  if (color.startsWith('#')) {
    return color;
  }
  return `#${color.slice(2).replace('.', '').toUpperCase()}`;
}

export const AppTile = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="flex-none relative w-12 h-12 mr-3 rounded-lg bg-gray-200 overflow-hidden"
      style={{ backgroundColor: "#00ea90" }}
    >
     hello
    </div>
  );
};
