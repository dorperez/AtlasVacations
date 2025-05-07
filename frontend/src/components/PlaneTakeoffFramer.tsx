import { motion } from "framer-motion";
import { BiSolidPlaneTakeOff } from "react-icons/bi";

export default function PlaneTakeoffFramer() {
  return (
    <motion.div
      initial={{ x: -120, y: -90, rotate: 0, opacity: 1 }}
      animate={{ x: 170, y: -160, rotate: -15, opacity: 0 }}
      transition={{ duration: 4, ease: "easeIn", repeat: Infinity }}
      style={{
        position: "absolute",
        fontSize: "50px",
        color: "var(--secondary-color)",
      }}
    >
      <BiSolidPlaneTakeOff />
    </motion.div>
  );
}