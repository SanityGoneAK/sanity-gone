const PauseIcon: React.FC<React.HTMLAttributes<SVGElement>> = (
  props
) => {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="40" height="40" rx="20" fill="#F45C5C" />
      <path d="M16 12L16 28" stroke="#050507" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 28L24 12" stroke="#050507" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default PauseIcon;