/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          darkBg: '#0f172a',    
          darkCard: '#1e293b',  
          primary: '#0ea5e9',   
          accent: '#10b981',    
          danger: '#ef4444',    
        }
      },
    },
    plugins: [],
  }