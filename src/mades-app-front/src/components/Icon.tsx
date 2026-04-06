export const Icon = () => {
    return (
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6]">
          <svg className='w-10 h-10' viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="8" width="20" height="16" rx="3" fill="rgba(255,255,255,0.15)" stroke="white" stroke-width="1.5"></rect>
          <line x1="6" y1="13" x2="26" y2="13" stroke="white" stroke-width="1.5"></line>
          <line x1="12" y1="18" x2="20" y2="18" stroke="white" stroke-width="2" stroke-linecap="round"></line>
          <path d="M24 5 C28 8 28 12 25 14" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"></path>
          <polyline points="25,14 27,10 23,10" fill="white" stroke="none"></polyline>
        </svg>
        </div>
    );
}