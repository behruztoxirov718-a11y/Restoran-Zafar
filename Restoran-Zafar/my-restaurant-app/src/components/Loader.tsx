import React from 'react';

const Loader: React.FC = () => {
  return (
    <div id="zl-loader">
      <div className="zl-corner tl">
        <svg viewBox="0 0 30 30" fill="none">
          <path d="M2 30 L2 2 L30 2" stroke="#C9933A" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>
      <div className="zl-corner tr">
        <svg viewBox="0 0 30 30" fill="none">
          <path d="M2 30 L2 2 L30 2" stroke="#C9933A" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>
      <div className="zl-corner bl">
        <svg viewBox="0 0 30 30" fill="none">
          <path d="M2 30 L2 2 L30 2" stroke="#C9933A" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>
      <div className="zl-corner br">
        <svg viewBox="0 0 30 30" fill="none">
          <path d="M2 30 L2 2 L30 2" stroke="#C9933A" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>
      <div className="zl-tag">Toshkent &nbsp;·&nbsp; O'zbekiston</div>
      <div className="zl-line zl-line-top"></div>
      <div className="zl-zafar">
        <span>Z</span><span>A</span><span>F</span><span>A</span><span>R</span>
      </div>
      <div className="zl-dasturxon">
        <span>D</span><span>A</span><span>S</span><span>T</span><span>U</span><span>R</span><span>X</span><span>O</span><span>N</span>
      </div>
      <div className="zl-line zl-line-bot"></div>
      <div className="zl-progress-wrap">
        <div className="zl-progress-bar"></div>
        <div className="zl-progress-dot"></div>
      </div>
      <div className="zl-subtitle">Yuklanmoqda</div>
    </div>
  );
};

export default Loader;