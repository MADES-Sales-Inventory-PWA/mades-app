export const Button = ({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) => {
  return (
    <button
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-button-login-1 to-button-login-2 px-4 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:from-button-login-hover-1 hover:to-button-login-hover-2 hover:shadow-md active:translate-y-0 focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50 ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
  );
}