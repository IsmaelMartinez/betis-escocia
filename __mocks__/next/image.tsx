import React from 'react';

interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

// Mock component for next/image in Storybook
const MockImage = (props: NextImageProps) => {
  // Extract Next.js specific props and use the rest for the img element
  const { 
    width, 
    height, 
    loading, 
    fill, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    priority,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sizes,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    quality,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    placeholder,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blurDataURL,
    ...imgProps 
  } = props;
  
  // Use some of the extracted props
  const style = {
    ...imgProps.style,
    width: fill ? '100%' : width,
    height: fill ? '100%' : height,
  };
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      {...imgProps} 
      style={style}
      loading={loading || 'lazy'}
      alt={props.alt || ''} 
    />
  );
};

export default MockImage;
