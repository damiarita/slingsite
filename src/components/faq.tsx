import React, { JSX } from 'react';

export const FAQ = ({
  question,
  h,
  children,
}: {
  question: string;
  h?: number;
  children: React.ReactNode;
}) => {
  const HeadingTag = `h${h || 3}` as keyof JSX.IntrinsicElements;
  return (
    <>
      <HeadingTag>{question}</HeadingTag>
      {children}
    </>
  );
};
