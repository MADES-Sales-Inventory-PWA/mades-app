export const BasicButton = ({ children, onClick, className, title, id}: { children: React.ReactNode; onClick: () => void; className?: string; title?: string; id?: string }) => {
  return (
    <button id={id} title={title} onClick={onClick} className={`rounded-full hover:cursor-pointer ${className}`}>
      {children}
    </button>
  );
};