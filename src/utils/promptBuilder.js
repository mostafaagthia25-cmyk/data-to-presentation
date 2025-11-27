export function buildPrompt(fileContent, userSettings) {
  const { selectedStyle, selectedColors, selectedFeatures, customDescription } = userSettings;
  
  // Get template based on style
  const templateInstructions = getTemplateInstructions(selectedStyle);
  
  // Build feature instructions
  const featureInstructions = buildFeatureInstructions(selectedFeatures);
  
  return `You are an expert HTML presentation designer. Create a stunning, interactive, fully self-contained HTML presentation.

📊 DATA TO CONVERT:
${formatDataForPrompt(fileContent)}

🎨 DESIGN REQUIREMENTS:
- Style Theme: ${selectedStyle}
- Primary Colors: ${selectedColors[0]}, ${selectedColors[1]}
- User Instructions: ${customDescription || 'Create a professional, engaging presentation'}

${templateInstructions}

🎯 INTERACTIVE FEATURES TO INCLUDE:
${featureInstructions}

📋 TECHNICAL REQUIREMENTS:
1. Create a COMPLETE, STANDALONE HTML file
2. Include ALL CSS inline or in <style> tags
3. Include ALL JavaScript inline or in <script> tags
4. CSS FRAMEWORK: Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
5. CHARTS: Use Chart.js from CDN for all charts: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
6. ANIMATIONS: Use CSS animations, no external libraries (use @keyframes, transitions, transforms)
7. LAYOUT: Responsive grid with breakpoints (sm, md, lg, xl) - mobile-first approach
8. Make it fully responsive (mobile, tablet, desktop)
9. Add smooth animations and transitions
10. Use modern glassmorphism and gradient effects
11. Ensure all interactive features work perfectly

🎭 STRUCTURE & SPECIFIC REQUIREMENTS:

**Hero Section:**
- Full-height viewport (min-h-screen)
- Gradient background using primary colors
- Large, bold title with gradient text effect
- Subtitle with key insights
- Animated entrance (fade-in, slide-up)
- Optional scroll indicator

**Content Cards:**
- Glassmorphism effect (backdrop-filter: blur, semi-transparent background)
- Hover animations (scale, glow, shadow increase)
- Smooth transitions (0.3s ease)
- Responsive padding and margins
- Border with subtle gradient or glow

**Data Visualizations & Charts:**
- Animated on scroll (use Intersection Observer)
- Vibrant colors matching the palette
- Interactive tooltips
- Smooth chart animations (1-2 second duration)
- Responsive canvas sizing

**Interactive Elements:**
- Smooth state transitions
- Hover effects on all clickable elements
- Loading states if needed
- Clear visual feedback

**Footer:**
- Gradient background matching hero
- Social icons or attribution
- Clean, minimal design
- Sticky or static at bottom

**Overall Layout:**
- Container max-width: 1280px (max-w-7xl)
- Generous padding: px-6 md:px-12
- Section spacing: py-12 md:py-20
- Card gaps: gap-6 md:gap-8

⚠️ CRITICAL: 
- Return ONLY the complete HTML code
- No explanations, no markdown, no code blocks
- Just pure HTML starting with <!DOCTYPE html>
- Ensure all CDN scripts are included
- Test that all features work without external dependencies

Begin generating the HTML now:`;
}

function formatDataForPrompt(fileContent) {
  if (fileContent.type === 'table') {
    return `Table Data (${fileContent.fileName || 'Uploaded File'}):
Headers: ${fileContent.headers.join(', ')}
Total Rows: ${fileContent.rows.length}
Sample Data (first 5 rows):
${JSON.stringify(fileContent.rows.slice(0, 5), null, 2)}

${fileContent.rows.length > 5 ? `Note: Showing 5 of ${fileContent.rows.length} total rows for context. Use this sample to understand data structure and generate appropriate visualizations for the full dataset.` : ''}`;
  } else if (fileContent.type === 'presentation') {
    return `PowerPoint Presentation (${fileContent.fileName || 'Uploaded File'}):
Total Slides: ${fileContent.slides.length}
Content Summary:
${fileContent.slides.map((slide, idx) => `Slide ${idx + 1}: ${slide.content.slice(0, 150)}...`).join('\n')}`;
  } else {
    return `Document (${fileContent.fileName || 'Uploaded File'}):
${fileContent.text.slice(0, 2000)}${fileContent.text.length > 2000 ? '...' : ''}

${fileContent.text.length > 2000 ? `Note: Showing first 2000 characters of ${fileContent.text.length} total characters.` : ''}`;
  }
}

function getTemplateInstructions(style) {
  const templates = {
    modern: `
🎨 MODERN STYLE:
- Use bold gradients (purple, fuchsia, cyan)
- Glassmorphism effects (backdrop-filter: blur(20px), background: rgba(255,255,255,0.1))
- Large, bold typography (text-5xl, text-6xl for headings)
- Floating cards with shadows (shadow-2xl, shadow-purple-500/50)
- Animated hover effects (hover:scale-105, hover:shadow-3xl)
- Dark theme with vibrant accents
- Neon glow effects on interactive elements
- Smooth gradient transitions`,
    
    minimal: `
🎨 MINIMAL STYLE:
- Clean, spacious layout with generous whitespace
- Monochromatic color scheme (grays, blacks, whites)
- Simple sans-serif fonts (Inter, system-ui)
- Subtle shadows (shadow-sm, shadow-md)
- Plenty of white space (py-16, gap-12)
- Focus on content, not decoration
- Understated animations (fade only)
- Professional, timeless aesthetic`,
    
    corporate: `
🎨 CORPORATE STYLE:
- Professional blue/navy color scheme (#1e40af, #1e3a8a)
- Clean, grid-based layout (grid-cols-2, grid-cols-3)
- Conservative typography (font-sans, font-semibold)
- Data-focused visualizations (charts, tables)
- Formal tone and language
- Business-appropriate design
- Subtle, professional animations
- High readability and accessibility`,
    
    vibrant: `
🎨 VIBRANT STYLE:
- Bright, energetic colors (pink, orange, yellow, green)
- Dynamic animations (bounce, pulse, spin)
- Bold, playful typography (font-extrabold, tracking-tight)
- Colorful gradients everywhere (from-pink-500 via-purple-500 to-blue-500)
- High contrast for impact
- Eye-catching visual elements
- Energetic, youthful aesthetic
- Maximum visual excitement`
  };
  
  return templates[style] || templates.modern;
}

function buildFeatureInstructions(features) {
  const featureMap = {
    expandable: `- Add expandable/collapsible cards that reveal more content on click
  * Use details/summary HTML elements or JavaScript toggle
  * Smooth height transition animation
  * Rotate chevron icon on expand/collapse
  * Example: Cards that show summary and expand to full details`,
    
    flipping: `- Create 3D flip cards with front/back content
  * Use CSS transform: rotateY(180deg)
  * Perspective effect for 3D appearance
  * Flip on hover or click
  * Example: Data cards with stats on front, details on back`,
    
    popout: `- Implement modal popups for detailed views
  * Overlay with backdrop blur
  * Smooth fade-in animation
  * Click outside to close
  * Example: Click chart to see expanded view in modal`,
    
    timeline: `- Include an interactive timeline visualization
  * Vertical or horizontal layout
  * Connected dots or milestones
  * Hover to reveal details
  * Animated line progress
  * Example: Project timeline, historical events`,
    
    pie: `- Add pie charts using Chart.js CDN
  * Animated drawing on scroll
  * Interactive tooltips
  * Vibrant segment colors
  * Legend with percentages
  * Example: Revenue breakdown, category distribution`,
    
    bar: `- Include bar charts for data comparison
  * Animated bar growth on scroll
  * Horizontal or vertical orientation
  * Color-coded categories
  * Grid lines for reference
  * Example: Monthly sales, performance metrics`,
    
    line: `- Add line charts for trend analysis
  * Smooth curved lines
  * Animated path drawing
  * Multiple datasets support
  * Point highlights on hover
  * Example: Revenue over time, growth trends`,
    
    animations: `- Implement scroll-triggered animations (fade-in, slide-up, etc.)
  * Use Intersection Observer API
  * Stagger animations for multiple elements
  * Smooth easing functions (ease-out, ease-in-out)
  * Subtle, not overwhelming
  * Example: Sections fade in as user scrolls down`
  };
  
  return features.map(f => featureMap[f] || '').filter(Boolean).join('\n\n');
}