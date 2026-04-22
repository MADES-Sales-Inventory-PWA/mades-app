export const BasicButton = ({ children, onClick, className}: { children: React.ReactNode; onClick: () => void; className?: string }) => {
  return (
    <button onClick={onClick} className={`rounded-full hover:cursor-pointer ${className}`}>
      {children}
    </button>
  );
};