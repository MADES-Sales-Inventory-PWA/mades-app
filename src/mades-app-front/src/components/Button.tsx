export const Button = ({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) => {
  return (
    <button
        className={`w-full mt-4 bg-gradient-to-b from-button-login-1 to-button-login-2 text-white py-2 px-4 rounded-[0.4rem] hover:from-button-login-hover-1 hover:to-button-login-hover-2 hover:cursor-pointer focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50 ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
  );
}