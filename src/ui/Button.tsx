import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Base = { variant?: 'primary' | 'glass' | 'dark' | 'ghost'; arrow?: boolean; children: ReactNode; className?: string };
type Props = Base & (({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>));

export function Button({ variant = 'primary', arrow = false, children, className, ...rest }: Props) {
  const cls = `${styles.btn} ${styles[variant]} ${className ?? ''}`;
  const inner = (
    <>
      <span className={styles.text}>{children}</span>
      {arrow && (
        <span className={styles.arrow} aria-hidden>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      )}
    </>
  );
  if ('href' in rest && rest.href) return <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{inner}</a>;
  return <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{inner}</button>;
}
