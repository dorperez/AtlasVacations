import React, { useEffect, useState } from 'react';
import { useSnackBar } from '../functions/utils/snackbar';
import "../styles/snackBarStyle.scss"

const Snackbar: React.FC = () => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    useSnackBar((msg: string) => {
      setMessage(msg);
      setVisible(true);
      setAnimationClass('entering');
      
      setTimeout(() => {
        setAnimationClass('');
      }, 300);
      
      const timer = setTimeout(() => {
        setAnimationClass('closing');
        
        setTimeout(() => {
          setVisible(false);
        }, 300);
      }, 3000);
      
      return () => clearTimeout(timer);
    });
  }, []);

  if (!visible) return null;

  return (
    <div className={`snackBarContainer ${animationClass}`}>
      {message}
    </div>
  );
};

export default Snackbar;