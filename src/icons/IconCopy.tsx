import React, { FunctionComponent } from 'react';
import type { IconProps } from './IconsProps';
import { DEFAULT_ICON_STYLES } from './IconsShared';
import './Icons.css';

export const IconCopy: FunctionComponent<IconProps> = (props: IconProps) => {
  const {
    className,
    click,
    fill,
    height,
    title,
    width,
  } = props;

  return (
    <button
      className="icon-button"
      onClick={click}
      title={title || 'Copy'}
      type="button"
    >
      <svg
        className={className}
        style={{
          ...DEFAULT_ICON_STYLES,
          ...{
            fill,
            height,
            width,
          },
        }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4l6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z" />
      </svg>
    </button>
  );
};
