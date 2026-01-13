import { cx } from "~/utils/styles.ts";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  children?: React.ReactNode;
}

const Tag: React.FC<Props> = ({ active, children, className, ...props }) => {
  return (
    <button
      {...props}
      className={cx("py-1 px-2 rounded", {
        "bg-neutral-600": !active,
        "bg-blue-light text-neutral-950": active,
      }, className)}
    >
      {children}
    </button>
  );
};

export default Tag;