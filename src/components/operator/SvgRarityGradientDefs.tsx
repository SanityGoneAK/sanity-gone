const SvgRarityGradientDefs = () => {
  return (
    <svg>
      <defs>
        {[1,2,3,4,5,6].map(rarity => {
          return <linearGradient key={rarity} id={`rarity${rarity}`}>
          <stop offset="0%" style={{stopColor: `var(--color-rarity-${rarity})`}}></stop>
          <stop offset="100%" style={{stopColor: `var(--color-rarity-${rarity}-dark)`}}></stop>
        </linearGradient>
        })}
      </defs>
    </svg>
  );
};
export default SvgRarityGradientDefs;