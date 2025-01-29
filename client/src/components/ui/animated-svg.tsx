import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedSVGProps {
  className?: string;
  src: string;
  alt: string;
}

export function AnimatedSVG({ className, src, alt }: AnimatedSVGProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(src)
      .then(response => response.text())
      .then(text => setSvgContent(text));
  }, [src]);

  if (!svgContent) return null;

  // Create a wrapper div to parse the SVG content
  const wrapper = document.createElement('div');
  wrapper.innerHTML = svgContent;
  const svgElement = wrapper.querySelector('svg');

  if (!svgElement) return null;

  // Get SVG attributes
  const viewBox = svgElement.getAttribute('viewBox') || "0 0 1000 1000";

  // Find all paths in the SVG
  const paths = Array.from(svgElement.querySelectorAll('path')).map(path => ({
    d: path.getAttribute('d'),
    fill: path.getAttribute('fill'),
  }));

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { 
          delay: i * 0.15, 
          type: "spring",
          duration: 1.5,
          bounce: 0 
        },
        opacity: { 
          delay: i * 0.15, 
          duration: 0.01 
        }
      }
    })
  };

  return (
    <div className={className}>
      <motion.svg
        viewBox={viewBox}
        initial="hidden"
        animate="visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <motion.path
            key={index}
            d={path.d || ""}
            fill={path.fill || "currentColor"}
            variants={pathVariants}
            custom={index}
            style={{
              strokeWidth: 2,
              stroke: path.fill || "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}