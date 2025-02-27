import React from 'react';
import { tw } from '@twind/core';

export type Default404ImageProps = {
  url?: string;
  alt?: string;
};

/**
 * Component used to display the 404 default image
 * @param url - url of the image
 * @param alt - description of the image
 */
const Default404Image: React.FC<Default404ImageProps> = ({ url, alt = '404 not found' }) => {
  return (
    <picture className={tw('w-[250px] h-[250px] m-auto my-4')}>
      <img alt={alt} src={url} />
    </picture>
  );
};

export default Default404Image;
