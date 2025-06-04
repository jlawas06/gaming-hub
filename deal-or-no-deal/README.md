# Deal or No Deal

A modern web-based implementation of the classic game show "Deal or No Deal". Test your luck and decision-making skills as you try to win the highest possible prize!

## Features

- 26 cases with values ranging from $1 to $200
- Dynamic banker offers based on remaining cases
- Multiple rounds with decreasing number of cases to open
- Beautiful, responsive design
- Smooth animations and transitions
- Mobile-friendly interface

## How to Play

1. The game starts with 26 cases, each containing a random value between $1 and $200
2. In each round, you'll need to open a specific number of cases:
   - Round 1: Open 6 cases
   - Round 2: Open 5 cases
   - Round 3: Open 4 cases
   - Round 4: Open 3 cases
   - Round 5: Open 2 cases
   - Rounds 6-9: Open 1 case each
3. After each round, the banker will make you an offer
4. Choose to either:
   - Take the deal (accept the banker's offer)
   - Say "No Deal" (continue playing)
5. The game continues until you either:
   - Accept a deal
   - Complete all rounds and reveal your final case

## Tips

- The banker's offer is based on the average value of remaining cases
- Offers tend to increase as you eliminate lower-value cases
- Consider the risk vs. reward when deciding whether to take a deal
- Watch out for the highest values ($200) - they can significantly increase your potential winnings!

## Technical Details

- Built with vanilla JavaScript
- No external dependencies
- Responsive design using CSS Grid and Flexbox
- Modern ES6+ features
- Smooth animations and transitions

## Browser Support

The game works best in modern browsers that support ES6+ features:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This game is part of the JL Gaming Hub collection. Feel free to play and enjoy! 