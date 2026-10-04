import type { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'glass' | 'dark' | 'ghost';
  arrow?: boolean;
  children: ReactNode;
};
export function Button({ variant = 'primary', arrow = false, children, className, ...rest }: Props) {
  return (
    <button className={`${styles.btn} ${styles[variant]} ${className ?? ''}`} {...rest}>
      <span className={styles.text}>{children}</span>
      {arrow && (
        <span className={styles.arrow} aria-hidden>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      )}
    </button>
  );
}
