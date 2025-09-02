/**
 * LaTeX online rendering utilities
 * Provides functions to convert LaTeX formulas to rendered images using online services
 */

/**
 * Convert LaTeX formula to image URL using CodeCogs service
 * @param {string} latex - The LaTeX formula
 * @param {Object} options - Rendering options
 * @param {string} options.format - Image format ('svg', 'png', 'gif')
 * @param {string} options.color - Text color (hex without #, e.g., '000000')
 * @param {string} options.background - Background color (hex without #, e.g., 'ffffff')
 * @param {number} options.size - Font size (10-20)
 * @returns {string} The image URL
 */
export function renderLatexToImage(latex, options = {}) {
  const {
    format = 'svg',
    color = '000000',
    background = 'ffffff',
    size = 12
  } = options;
  
  // Encode the LaTeX formula for URL
  const encodedLatex = encodeURIComponent(latex);
  
  // Use CodeCogs LaTeX renderer
  const baseUrl = 'https://latex.codecogs.com';
  const url = `${baseUrl}/${format}.latex?\\dpi{110}\\bg_${background}\\color{${color}}\\large${encodedLatex}`;
  
  return url;
}

/**
 * Convert LaTeX formula to SVG URL (recommended for best quality)
 * @param {string} latex - The LaTeX formula
 * @param {Object} options - Rendering options
 * @returns {string} The SVG image URL
 */
export function renderLatexToSVG(latex, options = {}) {
  return renderLatexToImage(latex, { ...options, format: 'svg' });
}

/**
 * Convert LaTeX formula to PNG URL (for compatibility)
 * @param {string} latex - The LaTeX formula
 * @param {Object} options - Rendering options
 * @returns {string} The PNG image URL
 */
export function renderLatexToPNG(latex, options = {}) {
  return renderLatexToImage(latex, { ...options, format: 'png' });
}

/**
 * Create markdown image syntax for LaTeX formula
 * @param {string} latex - The LaTeX formula
 * @param {string} alt - Alternative text for the image
 * @param {Object} options - Rendering options
 * @returns {string} Markdown image syntax
 */
export function createLatexMarkdown(latex, alt = 'Mathematical Formula', options = {}) {
  const imageUrl = renderLatexToSVG(latex, options);
  return `![${alt}](${imageUrl})`;
}

/**
 * Create inline LaTeX markdown with fallback
 * @param {string} latex - The LaTeX formula
 * @param {string} fallback - Fallback text if image fails to load
 * @param {Object} options - Rendering options
 * @returns {string} Markdown with image and fallback
 */
export function createInlineLatexMarkdown(latex, fallback = '', options = {}) {
  const imageUrl = renderLatexToSVG(latex, options);
  const altText = fallback || latex;
  return `![${altText}](${imageUrl} "${latex}")`;
}

/**
 * Create block LaTeX markdown (centered)
 * @param {string} latex - The LaTeX formula
 * @param {string} alt - Alternative text for the image
 * @param {Object} options - Rendering options
 * @returns {string} Centered markdown image
 */
export function createBlockLatexMarkdown(latex, alt = 'Mathematical Formula', options = {}) {
  const imageUrl = renderLatexToSVG(latex, options);
  return `<div align="center">\n\n![${alt}](${imageUrl})\n\n</div>`;
}

/**
 * Process text content and convert LaTeX formulas to images
 * @param {string} content - Text content with LaTeX formulas
 * @param {Object} options - Rendering options
 * @returns {string} Content with LaTeX converted to images
 */
export function processLatexInContent(content, options = {}) {
  // Replace block formulas $$...$$
  content = content.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
    const trimmedLatex = latex.trim();
    return createBlockLatexMarkdown(trimmedLatex, 'Mathematical Formula', options);
  });
  
  // Replace inline formulas $...$
  content = content.replace(/\$([^$]+)\$/g, (match, latex) => {
    const trimmedLatex = latex.trim();
    return createInlineLatexMarkdown(trimmedLatex, latex, options);
  });
  
  return content;
}

/**
 * Validate LaTeX syntax (basic validation)
 * @param {string} latex - The LaTeX formula
 * @returns {boolean} Whether the LaTeX appears to be valid
 */
export function validateLatex(latex) {
  if (!latex || typeof latex !== 'string') {
    return false;
  }
  
  // Basic validation: check for balanced braces
  let braceCount = 0;
  for (const char of latex) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) return false;
  }
  
  return braceCount === 0;
}

/**
 * Clean and prepare LaTeX for rendering
 * @param {string} latex - The raw LaTeX formula
 * @returns {string} Cleaned LaTeX formula
 */
export function cleanLatex(latex) {
  if (!latex) return '';
  
  return latex
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\\{/g, '{') // Remove unnecessary escapes
    .replace(/\\}/g, '}')
    .replace(/\\\\/g, '\\'); // Normalize backslashes
}
