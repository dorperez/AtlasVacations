type SnackbarListener = (msg: string) => void;
let listener: SnackbarListener | null = null;

export const showSnackbar = (msg: string) => {
  if (listener) listener(msg);
};

export const useSnackBar = (cb: SnackbarListener) => {
  listener = cb;
};