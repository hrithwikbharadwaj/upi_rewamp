# Bank Wrapped - Next.js Version

A brutalist, high-energy financial recap app that turns your bank statement PDF into an Instagram-story-style experience.

## Features

- 🔒 **100% Client-Side Processing** - Your PDF never leaves your browser
- 📊 **Beautiful Visualizations** - See your spending in a whole new way
- 🎨 **Modern Design** - Brutalist aesthetics with smooth animations
- 📱 **Shareable Cards** - Generate and download your financial "aura" card

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## How It Works

1. Export your bank statement as a PDF
2. Drop it into the app
3. Watch as it analyzes your spending locally
4. Scroll through your personalized financial story
5. Share your results (if you dare!)

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **PDF.js** - PDF parsing
- **html2canvas** - Screenshot generation

## Privacy

All processing happens in your browser. No data is sent to any server. You can verify this by:
1. Opening your browser's Network tab
2. Dropping a PDF
3. Observing that no network requests are made during analysis

## License

MIT

