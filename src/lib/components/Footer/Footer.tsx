import React, { useState } from 'react';
import styles from './footer.module.less';

const ICP_BEIAN = {
  number: '陕ICP备2026016431号',
  url: 'https://beian.miit.gov.cn/',
};

const GONG_AN_BEIAN = {
  number: '皖公网安备34011102004132号',
  url: 'https://beian.mps.gov.cn/#/query/webSearch',
};

export type FooterType = 'sea' | 'tree';

export interface FooterProps {
    /** Footer 类型 */
    type?: FooterType;
    /** 无缝拼接 */
    seamless?: boolean;
    /** 自定义类名 */
    className?: string;
    /** 自定义样式 */
    style?: React.CSSProperties;
}

export const Footer: React.FC<FooterProps> = ({ type = 'tree', seamless = false, className, style }) => {
    const cls = [styles.footer, styles[type], seamless && styles.seamless, className].filter(Boolean).join(' ');
    const [showQR, setShowQR] = useState(false);

    return (
      <>
        <div className={cls} style={style} />
        <div className={styles.beian}>
          <a
            href={ICP_BEIAN.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.beianLink}
          >
            {ICP_BEIAN.number}
          </a>
          <span className={styles.beianDivider}>·</span>
          <a
            href={GONG_AN_BEIAN.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.beianLink}
          >
            {GONG_AN_BEIAN.number}
          </a>
          <span className={styles.beianDivider}>·</span>
          <button
            className={styles.feedbackBtn}
            onClick={() => setShowQR(true)}
          >
            扫码关注公众号 → 留言
          </button>
        </div>

        {showQR && (
          <div className={styles.qrOverlay} onClick={() => setShowQR(false)}>
            <div className={styles.qrModal} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.qrTitle}>扫码关注「怂爸的养娃攻略」</h3>
              <p className={styles.qrDesc}>关注后发送消息，怂爸会认真回复每一条~</p>
              <img
                src="/公众号二维码.jpg"
                alt="公众号二维码"
                className={styles.qrImg}
              />
              <button
                className={styles.qrClose}
                onClick={() => setShowQR(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </>
    );
};

Footer.displayName = 'Footer';
