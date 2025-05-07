import { useState, useEffect } from "react";
import "../styles/confirmPopup.scss";

interface PopUpProps {
  message: string;
  subMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ConfirmPopup = ({ message, subMessage, onConfirm, onCancel, isOpen }: PopUpProps) => {
  const [visible, setVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  
  // Store the current content
  const [currentMessage, setCurrentMessage] = useState(message);
  const [currentSubMessage, setCurrentSubMessage] = useState(subMessage);
  
  useEffect(() => {
    if (isOpen) {
      // Update content when opening
      setCurrentMessage(message);
      setCurrentSubMessage(subMessage);
      setVisible(true);
      
      // Add entrance animation class immediately
      setAnimationClass("entering");
      
      // Remove the entering class after animation completes
      const timer = setTimeout(() => {
        setAnimationClass("");
      }, 300);
      return () => clearTimeout(timer);
    } else if (visible) {
      // Start closing animation
      setAnimationClass("closing");
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, visible, message, subMessage]);
  
  const handleConfirm = () => {
    setAnimationClass("closing");
    setTimeout(() => {
      onConfirm();
    }, 300);
  };
  
  const handleCancel = () => {
    setAnimationClass("closing");
    setTimeout(() => {
      onCancel();
    }, 300);
  };
  
  if (!visible) return null;
  
  return (
    <div className={`popupOverlay ${animationClass}`} onClick={handleCancel}>
      <div className="popupContent" onClick={(e) => e.stopPropagation()}>
        <h3>{currentMessage}</h3>
        {currentSubMessage && <p>{currentSubMessage}</p>}
        <div className="popupButtons">
          <button className="confirm" onClick={handleConfirm}>Yes</button>
          <button className="cancel" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;