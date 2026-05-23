export const Button = ({ children, onClick, className, disabled, title, type = "button" }: { children: React.ReactNode; onClick: () => void; className?: string; disabled?: boolean; title?: string; type?: "button" | "submit" | "reset" }) => {
  return (
    <button
        type={type}
        className={`bg-gradient-to-b from-button-login-1 to-button-login-2 text-white py-2 px-4 rounded-[0.4rem] hover:from-button-login-hover-1 hover:to-button-login-hover-2 hover:cursor-pointer focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        onClick={onClick}
        disabled={disabled}
        title={title}
      >
        {children}
      </button>
  );
}