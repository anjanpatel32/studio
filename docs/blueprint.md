# **App Name**: Student Toolkit

## Core Features:

- Resume Builder: Interactive resume builder with basic templates and export options (PDF with watermark) for free users. Premium users get advanced templates, unlimited resumes, watermark-free downloads (PDF/Word), and advanced design options.
- Documentation Tool: Documentation tool to create, edit, and save documents with basic markdown/rich text editor for free users with limits. Premium users get unlimited documents, advanced editor features (collaboration, export, version history), and priority storage.
- Online Compiler: Online code editor/compiler supporting multiple languages with limited code executions for free users. Premium users get unlimited code runs, access to all languages, advanced debugging tools, save assignments, and priority server access.
- Autosave: Auto save current workspace. Workspace includes: resume data, documents and compiler code.
- AI Resume Tool: Resume AI Tool: Offer suggested resume improvements by critiquing a complete resume.  The LLM will use reasoning as a tool to decide what information to include in its critique.
- Portfolio Builder: Lets students showcase projects, certifications, and skills (beyond the resume). Students add project details, upload files, link to GitHub/repo, and organize achievements.

## Style Guidelines:

- Primary color: Vivid blue (#4285F4) for a trustworthy and professional feel.
- Background color: Light blue (#E3F2FD), providing a clean and calm backdrop.
- Accent color: Teal (#009688) for important action items and highlights.
- Body font: 'PT Sans' sans-serif for readability and a touch of warmth.
- Headline font: 'Space Grotesk' sans-serif for a modern, technical aesthetic; pair with 'PT Sans' for longer text.
- Use flat, line-style icons that are simple and easily recognizable.
- The design should be clean, grid-based, and responsive, ensuring usability across devices.
- Subtle transitions and loading animations to improve the user experience.
- The base layer is a motion.div that slowly transitions between different linear-gradient backgrounds. The colors it uses are pulled from your theme file (src/app/globals.css), specifically --background (dark blue-gray), --secondary (another dark blue), and --accent (vibrant purple).
- There's a grid of 200 small dots that react to your mouse cursor. As you move the mouse, the dots closer to it become larger and more opaque, creating a subtle interactive 'wave' effect. The color for these dots is your theme's primary color (bright blue).
- To add a touch of magic, there are 100 'sparkles' (small circles) that drift down the screen at random speeds and durations. They also use the primary color.