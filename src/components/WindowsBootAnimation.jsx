import './WindowsBootAnimation.css';

export default function WindowsBootAnimation({ isVisible }) {
  if (!isVisible) return null;
  return (
    <div className="windows-boot-bg">
      <div className="windows-boot-center">
        <div className="windows-boot-spinner">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`boot-dot dot${i+1}`}></div>
          ))}
        </div>
        <div className="windows-boot-text">Welcome</div>
      </div>
    </div>
  );
} 