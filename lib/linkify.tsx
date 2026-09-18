import * as React from 'react';

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/g;

export function linkify(text: string): React.ReactNode {
  const parts = text.split(URL_PATTERN);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <a key={index} href={part} target="_blank" rel="noreferrer noopener">
        {part}
      </a>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );
}
