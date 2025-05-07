const isValidEmail = (email: string): boolean => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email) &&
           !/\.\./.test(email); // Prevents multiple consecutive dots
};
export default isValidEmail