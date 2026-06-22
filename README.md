# English Vocabulary Trainer App

A delightful, child-friendly React application for learning English vocabulary in Ukrainian. Built with the "Whimsical Learner" design system.

## ✨ Features

### 🎮 Interactive Learning
- Random word presentation without repetition
- Instant validation as you type
- Green success indicators on correct answers
- Skip button to move to next word
- 20+ pre-loaded vocabulary words

### 📊 Progress Tracking
- Counter for learned and skipped words
- Modal view of all skipped words
- Quick stats in the header
- Visual progress indicators

### 🔄 Advanced Learning Modes
- "Repeat skipped words" toggle to practice problematic vocabulary
- Automatically removes words from skip list when correctly answered
- Seamless switching between normal and review modes
- Smart random mixing of modes

### 🎨 Beautiful Design
- Soft, playful interface designed for ages 7-10
- Responsive layout for mobile and desktop
- Smooth animations and transitions
- Accessible, high-contrast colors
- Tailwind CSS with custom design system

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/chemiboxs/english-learner-app.git
cd english-learner-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── VocabularyApp.tsx   # Main app container
│   ├── WordCard.tsx        # Displays current word
│   ├── InputField.tsx      # Answer input field
│   ├── Button.tsx          # Reusable button component
│   ├── Toggle.tsx          # Toggle switch component
│   ├── Stats.tsx           # Learning statistics display
│   ├── SuccessNotification.tsx # Success feedback animation
│   └── SkippedWordsList.tsx    # Modal with skipped words
├── hooks/
│   └── useVocabulary.ts    # Core learning logic hook
├── types/
│   └── vocabulary.ts       # TypeScript type definitions
├── data/
│   └── words.json          # Vocabulary dataset (20+ words)
├── App.tsx                 # Main App component
├── index.tsx               # Entry point
└── index.css               # Global styles & imports
```

## ⚙️ Customization

### Adding More Words

Edit `src/data/words.json`:

```json
[
  { 
    "id": "unique-id",
    "ukrainian": "Word in Ukrainian",
    "english": "english-word",
    "emoji": "😀"
  }
]
```

### Changing Colors

Edit `tailwind.config.js` in the `colors` section:

```javascript
colors: {
  'primary': '#674bb5',        // Lavender
  'secondary': '#765469',      // Soft Pink
  'success': '#4ade80',        // Mint Green
  'tertiary-fixed': '#ffe24c', // Sunny Yellow
}
```

### Adjusting Animations

Modify the `keyframes` section in `tailwind.config.js`:
- `successPop` - Success notification animation (2.5s default)
- `slideUp` - Card entrance animation (0.4s default)
- `bounceIn` - Bounce effect (0.6s default)
- `fadeIn` - Fade in effect (0.3s default)

## 🎨 Design System

The app follows the **"Whimsical Learner"** design system:

- **Primary Color**: Lavender (`#674bb5`)
- **Secondary Color**: Soft Pink (`#765469`)
- **Accent Color**: Sunny Yellow (`#b49c00`)
- **Success Color**: Mint Green (`#4ade80`)
- **Typography**: Quicksand (rounded, friendly)
- **Spacing**: 8px grid system
- **Border Radius**: 8px default, 24px for large containers

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ♿ Accessibility

- High contrast colors (WCAG AA compliant)
- Keyboard navigation support
- Clear focus states
- Semantic HTML
- Large touch targets (minimum 48x48px)
- Proper ARIA labels for interactive elements

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add more vocabulary words
- Improve the design
- Fix bugs
- Suggest new features

## 💡 Future Features

- [ ] Pronunciation audio
- [ ] Difficulty levels
- [ ] User progress persistence (localStorage)
- [ ] Multiple vocabulary sets
- [ ] Leaderboard / achievements
- [ ] Offline support
- [ ] PWA support
- [ ] Dark mode

---

Made with ❤️ for young English learners! 🌟
