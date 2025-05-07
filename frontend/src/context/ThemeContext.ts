import { createContext } from 'react';
const ThemeContext = createContext({theme:localStorage.getItem("appTheme"), setTheme: (theme: string) => {}});
export default ThemeContext