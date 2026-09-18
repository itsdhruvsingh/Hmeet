'use client';

import * as React from 'react';
import styles from '@/styles/room.module.css';
import { Icon } from '@/components/ui/Icon';

export function Panel({
  title,
  onClose,
  actions,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <aside className={`pane ${styles.panel}`}>
      <header className={styles.panelHead}>
        <span className={styles.panelTitle}>{title}</span>
        <div className={styles.panelActions}>
          {actions}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="Close panel"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </header>
      <div className={styles.panelBody}>{children}</div>
      {footer ? <div className={styles.panelFoot}>{footer}</div> : null}
    </aside>
  );
}
