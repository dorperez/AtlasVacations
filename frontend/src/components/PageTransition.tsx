import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 },
};

const pageTransition = { duration: 1 };

const PageTransition = () => {
  const { pathname } = useLocation();
  return (
<motion.div
      key={pathname} // Ensures animation triggers on path change
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Outlet />
    </motion.div>
  );
};

export default PageTransition;