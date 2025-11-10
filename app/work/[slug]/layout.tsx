import styles from './WorkLayout.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work | Martin Nayeri',
  description: 'Selected projects from Martin Nayeri, a designer who blends a deep knowledge of UX and a passion for games.'
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.workLayout}>
      {children}
    </div>
  )
} 