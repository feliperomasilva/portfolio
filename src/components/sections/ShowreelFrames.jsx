import { useEffect, useRef } from 'react';
import { canAnimate, ensureGsap, refreshScroll } from '../../lib/js/motion';
import { isMobileViewport } from '../../lib/js/device';
import './ShowreelFrames.css';

const FRAME_COUNT = 300;
const frameSrc = (i) => `/assets/frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
const POSTER_SRC = '/assets/lottie/showreel-poster.jpg';
const REVEAL_START = 0.86;
const REVEAL_END = 0.97;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const ShowreelFrames = ({ onFallback }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const fallbackRef = useRef(null);
  useEffect(() => {
    fallbackRef.current = onFallback;
  }, [onFallback]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const hero = document.getElementById('showreel');
    if (!wrap || !canvas || !hero) return;
    if (!canAnimate()) {
      fallbackRef.current?.();
      return;
    }

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {}, hero);
    const images = new Array(FRAME_COUNT);
    const copyEl = hero.querySelector('.cy-copy');
    const cardEl = hero.querySelector('.cy-card');
    const targets = [copyEl, cardEl].filter(Boolean);
    let disposed = false;
    let errors = 0;
    let current = -1;
    let currentFloat = 0;
    let targetFloat = 0;
    let raf = 0;
    let st = null;

    const ctx2d = canvas.getContext('2d');
    ctx2d.imageSmoothingEnabled = true;
    ctx2d.imageSmoothingQuality = 'high';
    hero.classList.add('frames-active');
    const setNavHidden = (hidden) => {
      document.body.classList.toggle('frames-nav-hidden', hidden);
      if (hidden) document.body.classList.remove('frames-nav-done');
    };
    const setNavDone = (done) => {
      document.body.classList.toggle('frames-nav-done', done);
      if (done) document.body.classList.remove('frames-nav-hidden');
    };
    setNavHidden(true);
    gsap.set(targets, { opacity: 0, y: 40, visibility: 'hidden' });

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(wrap.clientWidth * dpr));
      const h = Math.max(1, Math.round(wrap.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const drawCover = (img) => {
      if (!img || !img.naturalWidth) return;
      sizeCanvas();
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const renderFrame = (idx) => {
      const i = Math.max(0, Math.min(FRAME_COUNT - 1, idx));
      if (i === current) return;
      current = i;
      let img = images[i];
      if (!img) {
        for (let k = i - 1; k >= 0; k -= 1) {
          if (images[k]?.complete && images[k]?.naturalWidth) {
            img = images[k];
            break;
          }
        }
      }
      if (img) drawCover(img);
    };

    const updateTexts = (progress) => {
      const t = clamp01((progress - REVEAL_START) / (REVEAL_END - REVEAL_START));
      hero.classList.toggle('fr-reveal', t > 0.02);
      hero.classList.toggle('fr-done', progress >= REVEAL_END);
      if (progress >= REVEAL_END) setNavDone(true);
      else setNavHidden(true);
      if (!targets.length) return;
      gsap.set(targets, {
        opacity: t,
        y: (1 - t) * 40,
        visibility: t > 0.02 ? 'visible' : 'hidden',
      });
      targets.forEach((el) => {
        el.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
      });
    };

    const loadOne = (i) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          images[i] = img;
          if (i === 0 && !disposed) {
            wrap.classList.add('is-live');
            drawCover(img);
            updateTexts(st ? st.progress : 0);
            refreshScroll?.();
          }
          resolve(true);
        };
        img.onerror = () => {
          errors += 1;
          if (i === 0 || errors > 20) {
            fallbackRef.current?.();
          }
          resolve(false);
        };
        img.src = frameSrc(i + 1);
      });

    const preloadRest = async () => {
      const CONC = 6;
      let next = 1;
      const worker = async () => {
        while (next < FRAME_COUNT && !disposed) {
          const i = next;
          next += 1;
          await loadOne(i);
        }
      };
      await Promise.all(Array.from({ length: CONC }, () => worker()));
    };

    const renderLoop = () => {
      if (disposed) return;
      raf = requestAnimationFrame(renderLoop);
      const diff = targetFloat - currentFloat;
      if (Math.abs(diff) < 0.05) {
        if (currentFloat !== targetFloat) {
          currentFloat = targetFloat;
          renderFrame(Math.round(targetFloat));
        }
        return;
      }
      currentFloat += diff * 0.12;
      renderFrame(Math.round(currentFloat));
    };

    st = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: () => `+=${isMobileViewport() ? 3200 : 5000}`,
        pin: true,
        scrub: 1.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (disposed) return;
          targetFloat = self.progress * (FRAME_COUNT - 1);
          updateTexts(self.progress);
        },
        onLeave: () => {
          if (disposed) return;
          document.body.classList.remove('frames-nav-hidden', 'frames-nav-done');
        },
        onEnterBack: () => {
          if (disposed) return;
          setNavHidden(true);
        },
      },
    }).to(
      {},
      {
        duration: 1,
        ease: 'none',
      },
      0,
    ).scrollTrigger;

    loadOne(0).then((ok) => {
      if (disposed) return;
      if (!ok) return;
      targetFloat = (st?.progress || 0) * (FRAME_COUNT - 1);
      currentFloat = targetFloat;
      renderFrame(Math.round(targetFloat));
      raf = requestAnimationFrame(renderLoop);
      preloadRest();
    });

    const onResize = () => {
      if (disposed) return;
      const last = current;
      current = -1;
      sizeCanvas();
      if (last >= 0) renderFrame(last);
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      document.body.classList.remove('frames-nav-hidden', 'frames-nav-done');
      window.removeEventListener('resize', onResize);
      st?.kill();
      ctx.revert();
      gsap.set(targets, { clearProps: 'all' });
      hero.classList.remove('frames-active', 'fr-reveal', 'fr-done');
    };
  }, []);

  return (
    <div className="frames-bg" ref={wrapRef} aria-hidden="true">
      <img className="frames-poster" src={POSTER_SRC} alt="" draggable={false} />
      <canvas ref={canvasRef} className="frames-canvas" />
      <span className="frames-veil" />
    </div>
  );
};

export default ShowreelFrames;
