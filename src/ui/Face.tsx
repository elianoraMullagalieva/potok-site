import styles from './Face.module.css';
/* Круглый портрет: аккуратный кроп лица, одинаковый везде, где упоминается команда */
export function Face({ src, name, size = 40, ring, className }: { src: string; name: string; size?: number; ring?: string; className?: string }) {
  return (
    <img className={`${styles.face} ${className ?? ''}`} src={`${import.meta.env.BASE_URL}${src}`} alt={name} title={name} width={size} height={size}
      style={{ width: size, height: size, boxShadow: ring ? `0 0 0 2px ${ring}` : undefined }} loading="lazy" draggable={false} />
  );
}
