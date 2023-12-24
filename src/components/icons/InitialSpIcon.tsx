type Props = React.SVGAttributes<SVGElement>;

const InitialSpIcon: React.FC<Props> = (props) => {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0.285645 13.8571V0.142822L11.7142 6.99997L0.285645 13.8571Z"
        fill="#E8E8F2"
      />
    </svg>
  );
};
export default InitialSpIcon;
