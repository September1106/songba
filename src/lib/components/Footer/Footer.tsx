import React, { useState } from 'react';
import styles from './footer.module.less';
import { Modal } from 'animal-island-ui';
import 'animal-island-ui/dist/index.css';

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
          <span style={{ fontSize: '13px', marginRight: '12px' }}>📊 网站统计中</span>·
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
            href="https://beian.mps.gov.cn/#/query/webSearch?code=34011102004132"
            rel="noreferrer"
            target="_blank"
            className={styles.beianLink}
          >
            <img src="/备案图标.png" alt="公安网备案图标" className={styles.beianIcon} />
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

        <Modal
          open={showQR}
          title="扫码关注「怂爸的养娃攻略」"
          width={480}
          maskClosable
          footer={null}
          typewriter={false}
          onClose={() => setShowQR(false)}
          className="footer-qr-modal"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#8a7b66', textAlign: 'center', lineHeight: 1.6 }}>
              关注后发送消息，怂爸会认真回复每一条~
            </p>
            <img
              src="/公众号二维码.jpg"
              alt="公众号二维码"
              style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 12 }}
            />
          </div>
        </Modal>
      </>
    );
};

Footer.displayName = 'Footer';
