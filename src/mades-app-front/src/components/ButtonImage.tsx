export const ButtonImage = ({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) => {
  return (
    <button onClick={onClick} className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50">
      <img src={src} alt={alt} className="w-6 h-6" />
    </button>
  );
};

<button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {show ? <EyeOff /> : <Eye />}
        </button>