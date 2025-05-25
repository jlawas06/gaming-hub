# 🎯 BINGO Caller Web Application

A modern, interactive web application for automating BINGO games with speech synthesis and visual number tracking.

## Features

### 🎲 Core Functionality
- **Automatic Number Calling**: Randomly selects and announces BINGO numbers (1-75)
- **Speech Synthesis**: Speaks each called number aloud (e.g., "B 10", "N 42")
- **Visual Number Grid**: Displays all 75 numbers in a traditional BINGO format
- **Real-time Tracking**: Highlights called numbers and shows current selection

### 🎮 Game Controls
- **Start/Pause**: Toggle the automatic calling
- **New Game**: Reset all numbers and start fresh
- **Interval Control**: Adjust the delay between number calls (1-10 seconds)
- **Mute/Unmute**: Toggle speech synthesis on/off

### 📊 Visual Features
- **Current Number Display**: Large, prominent display of the current called number
- **Letter Column Indication**: Shows which BINGO column (B, I, N, G, O) the number belongs to
- **Called Numbers Grid**: Visual grid showing all numbers with called numbers highlighted
- **Statistics**: Track numbers called and remaining
- **Last Called**: Shows the previously called number

### ⌨️ Keyboard Shortcuts
- **Spacebar**: Start/Pause the game
- **N**: Start a new game
- **M**: Mute/Unmute speech

## How to Use

1. **Open the Application**: Open `index.html` in any modern web browser
2. **Start a Game**: Click the "START" button or press Spacebar
3. **Adjust Settings**: Use the interval slider to change calling speed
4. **Monitor Progress**: Watch the grid as numbers are called and highlighted
5. **New Game**: Click "NEW GAME" or press 'N' to reset

## BINGO Number System

The application follows standard BINGO conventions:
- **B**: Numbers 1-15
- **I**: Numbers 16-30
- **N**: Numbers 31-45
- **G**: Numbers 46-60
- **O**: Numbers 61-75

## Technical Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient backgrounds and smooth animations
- **Browser Speech API**: Uses Web Speech API for text-to-speech
- **Local Storage**: No server required - runs entirely in the browser
- **Accessible**: Clear visual indicators and keyboard navigation

## Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

*Note: Speech synthesis requires a modern browser with Web Speech API support*

## Installation

1. Download all files to a folder
2. Open `index.html` in your web browser
3. No additional installation required!

## File Structure

```
bingo-caller/
├── index.html      # Main HTML structure
├── styles.css      # CSS styling and animations
├── script.js       # JavaScript game logic
└── README.md       # This documentation
```

## Customization

The application can be easily customized by modifying:
- **Colors**: Edit the CSS gradient colors in `styles.css`
- **Speech Settings**: Adjust rate, pitch, and volume in `script.js`
- **Timing**: Modify default intervals and animation speeds
- **Layout**: Customize the grid size or button arrangements

## Troubleshooting

**Speech not working?**
- Ensure your browser supports Web Speech API
- Check that your device volume is turned up
- Try clicking the mute/unmute button

**Numbers not appearing?**
- Refresh the page
- Check browser console for any error messages
- Ensure JavaScript is enabled

## License

This project is open source and available under the MIT License.

---

Enjoy your BINGO games! 🎉 