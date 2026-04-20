export const ButtonImage = ({ children, onClick, className}: { children: React.ReactNode; onClick: () => void; className?: string }) => {
  return (
    <button onClick={onClick} className={`p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50 ${className}`}>
      {children}
    </button>
  );
};