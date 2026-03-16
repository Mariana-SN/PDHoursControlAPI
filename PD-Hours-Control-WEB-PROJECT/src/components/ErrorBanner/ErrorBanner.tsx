interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
}

export const ErrorBanner = ({ message, onClose }: ErrorBannerProps) => (
  <div className="error-banner">
    <span className="error-banner-icon">⚠</span>
    <span className="error-banner-message">{message}</span>
    {onClose && (
      <button className="error-banner-close" onClick={onClose}>✕</button>
    )}
  </div>
);