"use client";

import React, { useState, useRef, useEffect, useMemo, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Share, X, Download, Image as ImageIcon, Eye, EyeOff, Droplets, Trash2, PlusCircle, RefreshCw, Zap, PenSquare, Sparkles, UploadCloud, CheckCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { createRoot } from 'react-dom/client';

export type Competitor = {
  id: string;
  name: string;
  subtitle?: string;
  images?: { url: string }[];
};

export type Match = {
  a: Competitor | null;
  b: Competitor | null;
};

type Theme = {
  gradient: string;
  cardBg: string;
  text: string;
  accent: string;
  connector: string;
  buttonColor: string;
};

const themes: Record<string, Theme> = {
  space: { gradient: 'radial-gradient(ellipse at top, #374151, #111827, black)', cardBg: 'rgba(31, 41, 55, 0.6)', text: 'text-white', accent: 'text-cyan-300', connector: 'rgba(107, 114, 128, 0.7)', buttonColor: '#0891b2' },
  sunset: { gradient: 'linear-gradient(135deg, #ff7e5f, #feb47b)', cardBg: 'rgba(255, 255, 255, 0.2)', text: 'text-white', accent: 'text-yellow-200', connector: 'rgba(255, 255, 255, 0.7)', buttonColor: '#ff7e5f' },
  ocean: { gradient: 'linear-gradient(to right, #43cea2, #185a9d)', cardBg: 'rgba(255, 255, 255, 0.15)', text: 'text-white', accent: 'text-green-200', connector: 'rgba(255, 255, 255, 0.6)', buttonColor: '#43cea2' },
  gold: { gradient: 'radial-gradient(circle, #D4AF37, #B48628, #8F5F17)', cardBg: 'rgba(0, 0, 0, 0.3)', text: 'text-yellow-100', accent: 'text-white', connector: 'rgba(255, 255, 255, 0.5)', buttonColor: '#D4AF37' },
};

const placeholderImgUrl = "https://placehold.co/200x200/28247a/ffffff?text=Competitor";

interface ShareOptions {
  theme: string;
  showChampion: boolean;
  showSubtitle: boolean;
  showParticles: boolean;
  showVignette: boolean;
}

const Particles: FC<{ isForShare?: boolean; imageWidth: number; imageHeight: number }> = ({ isForShare = false, imageWidth, imageHeight }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    const particles: {x: number, y: number, radius: number, speedX: number, speedY: number}[] = [];
    const particleCount = 80;
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    if (isForShare) {
      canvas.width = imageWidth;
      canvas.height = imageHeight;
    } else {
      setCanvasDimensions();
    }
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    for (let i = 0; i < particleCount; i++) {
      particles.push({ x: Math.random() * width, y: Math.random() * height, radius: isForShare ? Math.random() * 0.8 + 0.2 : Math.random() * 1.5 + 0.5, speedX: (Math.random() - 0.5) * 0.5, speedY: (Math.random() - 0.5) * 0.5 });
    }
    const drawParticles = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const particle of particles) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
        }
    };
    if (isForShare) {
      drawParticles();
    } else {
      const animate = () => {
        for (const particle of particles) {
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
          if (particle.y < 0 || particle.y > height) particle.speedY *= -1;
        }
        drawParticles();
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
       return () => { cancelAnimationFrame(animationFrameId); };
    }
  }, [isForShare, imageWidth, imageHeight]);
  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
}

const BracketShareView: FC<{ rounds: Match[][]; winners: Competitor[][]; champion: Competitor | null; options: ShareOptions; matchWidth: number; matchHeight: number; hGap: number; vGap: number; }> = ({ rounds, winners, champion, options, matchWidth, matchHeight, hGap, vGap }) => {
  const { theme, showChampion, showSubtitle, showParticles, showVignette } = options;
  const currentTheme = themes[theme];
  const numCompetitors = rounds.length > 0 ? (rounds[0].length * 2) - (rounds[0][rounds[0].length-1]?.b ? 0 : 1) : 0;
  const imageWidth = numCompetitors > 50 ? 3840 : 1920;
  const imageHeight = numCompetitors > 50 ? 2160 : 1080;
  const imagePadding = numCompetitors > 50 ? 192 : 96;
  const paddingClass = numCompetitors > 50 ? 'p-24' : 'p-12';
  const championCardWidth = 200, championGap = 60;
  const totalRounds = rounds.length;

  const positions = useMemo(() => {
    const pos: { [key: string]: { x: number; y: number } } = {};
    const initialStride = matchHeight + vGap;
    for (let r = 0; r < totalRounds; r++) {
      const nMatches = rounds[r].length;
      const stride = initialStride * Math.pow(2, r);
      for (let i = 0; i < nMatches; i++) {
        pos[`${r}-${i}`] = { x: r * (matchWidth + hGap), y: i * stride + (stride / 2) - (matchHeight / 2) };
      }
    }
    return pos;
  }, [rounds, totalRounds, matchHeight, vGap, matchWidth, hGap]);

  const totalWidth = totalRounds * matchWidth + (totalRounds > 0 ? (totalRounds - 1) * hGap : 0) + (showChampion ? championGap + championCardWidth : 0);
  const totalHeight = useMemo(() => {
    let max = 0;
    Object.values(positions).forEach((p: {x: number, y: number}) => { max = Math.max(max, p.y + matchHeight); });
    return max + vGap * 2;
  }, [positions, matchHeight, vGap]);

  const connectors = useMemo(() => {
    const paths: string[] = [];
    for (let r = 0; r < totalRounds - 1; r++) {
      for (let i = 0; i < rounds[r].length; i++) {
        const fromPos = positions[`${r}-${i}`];
        const toPos = positions[`${r + 1}-${Math.floor(i / 2)}`];
        if (fromPos && toPos) {
          const x1 = fromPos.x + matchWidth, y1 = fromPos.y + matchHeight / 2, x2 = toPos.x, y2 = toPos.y + matchHeight / 2, midX = x1 + hGap / 2;
          paths.push(`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`);
        }
      }
    }
    if (showChampion) {
      const finalMatchPos = positions[`${totalRounds - 1}-0`];
      if (finalMatchPos) {
        const championX = (totalRounds - 1) * (matchWidth + hGap) + matchWidth + championGap, x1 = finalMatchPos.x + matchWidth, y1 = finalMatchPos.y + matchHeight / 2;
        paths.push(`M ${x1} ${y1} H ${championX}`);
      }
    }
    return paths;
  }, [rounds, positions, totalRounds, showChampion, matchWidth, hGap, matchHeight]);

  const getWinnerId = (match: Match, roundIdx: number) => winners[roundIdx]?.find(w => w.id === match.a?.id || w.id === match.b?.id)?.id;
  const availableWidth = imageWidth - imagePadding;
  const availableHeight = imageHeight - imagePadding;
  const scale = Math.min(availableWidth / totalWidth, availableHeight / totalHeight, 1);
  const finalMatchPos = positions[`${totalRounds - 1}-0`];

  return (
    <div style={{ backgroundImage: currentTheme.gradient }} className={`w-[${imageWidth}px] h-[${imageHeight}px] ${paddingClass} flex items-center justify-center ${currentTheme.text} font-sans relative overflow-hidden`}>
      {showParticles && <Particles isForShare={true} imageWidth={imageWidth} imageHeight={imageHeight} />}
      {showVignette && <div className="absolute inset-0" style={{boxShadow: 'inset 0 0 150px 50px black'}} />}
      <div className="relative flex items-center justify-center w-full h-full">
        <div className="relative" style={{ width: totalWidth * scale, height: totalHeight * scale }}>
            <div className="absolute top-0 left-0" style={{ width: totalWidth, height: totalHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <svg className="absolute top-0 left-0" width={totalWidth} height={totalHeight}>
                    {connectors.map((path, i) => <path key={i} d={path} stroke={currentTheme.connector} strokeWidth={3 / scale} fill="none" />)}
                </svg>
                {rounds.map((round, r) => round.map((match, i) => {
                const pos = positions[`${r}-${i}`];
                if (!pos) return null;
                const winnerId = getWinnerId(match, r);
                const renderCompetitor = (competitor: Competitor | null, isWinner: boolean) => (
                    <div className={`flex items-center gap-3 w-full ${isWinner ? 'font-bold' : 'opacity-60'}`}>
                    {competitor ? <>
                        <img src={competitor.images?.[0]?.url ?? placeholderImgUrl} width={40} height={40} className="rounded-md flex-shrink-0 object-cover" crossOrigin="anonymous"/>
                        <div className="truncate">
                        <p className="text-base truncate">{competitor.name}</p>
                        {showSubtitle && <p className="text-xs opacity-80 truncate">{competitor.subtitle}</p>}
                        </div>
                    </> : <p className="opacity-50 text-base">-</p>}
                    </div>
                );
                return (
                    <div key={`${r}-${i}`} style={{ width: matchWidth, height: matchHeight, left: pos.x, top: pos.y, backgroundColor: currentTheme.cardBg }} className="absolute flex flex-col justify-around p-3 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg">
                    {renderCompetitor(match.a, winnerId === match.a?.id)}
                    {match.b && <div className="h-px bg-white/20 my-1" />}
                    {renderCompetitor(match.b, winnerId === match.b?.id)}
                    </div>
                );
                }))}
                {showChampion && finalMatchPos && champion && (
                <div style={{ width: championCardWidth, left: (totalRounds - 1) * (matchWidth + hGap) + matchWidth + championGap, top: finalMatchPos.y + matchHeight / 2 - 75, backgroundColor: currentTheme.cardBg }} className="absolute flex flex-col items-center justify-center p-4 rounded-lg border-2 border-yellow-400 shadow-2xl shadow-yellow-400/20 backdrop-blur-sm">
                    <Crown size={32} className="text-yellow-300 drop-shadow-lg" />
                    <img src={champion.images?.[0]?.url ?? placeholderImgUrl} width={60} height={60} className="rounded-full my-2 border-2 border-yellow-300" crossOrigin="anonymous"/>
                    <p className="font-bold text-center text-yellow-200 line-clamp-2">{champion.name}</p>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const ShareModal: FC<{ showModal: boolean; onClose: () => void; champion: Competitor | null; rounds: Match[][]; winners: Competitor[][]; matchWidth: number; matchHeight: number; hGap: number; vGap: number; }> = ({ showModal, onClose, champion, rounds, winners, matchWidth, matchHeight, hGap, vGap }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [options, setOptions] = useState<ShareOptions>({ theme: 'space', showChampion: true, showSubtitle: true, showParticles: false, showVignette: false });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const showFeedback = (message: string) => { setFeedbackMessage(message); setTimeout(() => setFeedbackMessage(''), 3000); };

  useEffect(() => {
    if (!showModal) {
      setPreviewUrl('');
      return;
    }
    const generatePreview = async () => {
        setIsGenerating(true);
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed'; tempContainer.style.left = '-9999px'; tempContainer.style.top = '0px';
        document.body.appendChild(tempContainer);
        const root = createRoot(tempContainer);
        root.render(<BracketShareView {...{rounds, winners, champion, options, matchWidth, matchHeight, hGap, vGap}} />);
        await new Promise(resolve => setTimeout(resolve, 500));
        const node = tempContainer.firstChild as HTMLElement;
        if (!node) {
            root.unmount(); document.body.removeChild(tempContainer); setIsGenerating(false); return;
        }
        try {
            const url = await toPng(node, { cacheBust: true, quality: 0.9, fetchRequestInit: { mode: 'cors', cache: 'no-cache' } });
            setPreviewUrl(url);
        } catch (err) {
            console.error('Failed to generate preview', err);
            showFeedback('Error creating preview.');
        } finally {
            root.unmount(); document.body.removeChild(tempContainer); setIsGenerating(false);
        }
    };
    const timer = setTimeout(generatePreview, 200);
    return () => clearTimeout(timer);
  }, [showModal, options, champion, rounds, winners, matchWidth, matchHeight, hGap, vGap]);

  const handleDownload = async () => {
    if (!previewUrl) { showFeedback("Preview not ready yet."); return; }
    const link = document.createElement('a');
    link.download = `bracket-results.png`; link.href = previewUrl; link.click();
    showFeedback('Image downloaded!');
  };

  const ToggleButton: FC<{ label: string; icon: React.ReactNode; value: keyof Omit<ShareOptions, 'theme'> }> = ({ label, icon, value }) => (
    <button onClick={() => setOptions(o => ({...o, [value]: !o[value]}))} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 w-full ${options[value] ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
      {icon} {label}
    </button>
  );

  return (
    <AnimatePresence>
    {showModal && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-lg" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-4xl w-full flex flex-col lg:flex-row gap-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex-grow rounded-lg overflow-hidden relative shadow-lg aspect-video bg-slate-800 border border-slate-700">
          {isGenerating && !previewUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><RefreshCw/></motion.div>
                <p className="mt-2">Generating preview...</p>
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="mr-2"/>No data to display</div>
          )}
        </div>
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Droplets size={18} /> Theme</h3>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(themes).map(([key, themeData]) => ( <button key={key} onClick={() => setOptions(o => ({...o, theme: key}))} style={{ backgroundColor: themeData.buttonColor }} className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${options.theme === key ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white' : 'border-transparent'}`} /> ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><ImageIcon size={18} /> Options</h3>
            <div className="grid grid-cols-2 gap-2">
              <ToggleButton label="Champion" icon={options.showChampion ? <Eye size={16}/> : <EyeOff size={16}/>} value="showChampion" />
              <ToggleButton label="Subtitle" icon={options.showSubtitle ? <Eye size={16}/> : <EyeOff size={16}/>} value="showSubtitle" />
              <ToggleButton label="Particles" icon={<Sparkles size={16}/>} value="showParticles" />
              <ToggleButton label="Vignette" icon={<div className="w-4 h-4 rounded-full border-2 border-white" />} value="showVignette" />
            </div>
          </div>
          <div className="mt-auto">
            <button onClick={handleDownload} disabled={!previewUrl || isGenerating} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/30 disabled:shadow-none">
              <Download size={20} /> Download Image
            </button>
            <AnimatePresence>
                {feedbackMessage && <motion.p initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 10}} className="text-center text-green-400 mt-3 text-sm">{feedbackMessage}</motion.p>}
            </AnimatePresence>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors rounded-full p-1 hover:bg-slate-700"><X size={24} /></button>
      </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  );
}

const MainBracketView: FC<{ rounds: Match[][]; winners: Competitor[][]; champion: Competitor | null; onCompetitorChange: (roundIndex: number, matchIndex: number, competitorKey: 'a' | 'b', field: 'name' | 'subtitle', value: string) => void; onWinnerSelect: (roundIndex: number, matchIndex: number, winner: Competitor) => void; matchWidth: number; matchHeight: number; hGap: number; vGap: number; }> = ({ rounds, winners, champion, onCompetitorChange, onWinnerSelect, matchWidth, matchHeight, hGap, vGap }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const observer = new ResizeObserver(entries => entries[0] && setContainerSize(entries[0].contentRect));
    const currentRef = containerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);
  const championCardWidth = 180, championGap = 60;
  const totalRounds = rounds.length;
  const positions = useMemo(() => {
    const pos: { [key: string]: { x: number; y: number } } = {};
    const initialStride = matchHeight + vGap;
    for (let r = 0; r < totalRounds; r++) {
      const nMatches = rounds[r].length;
      const stride = initialStride * Math.pow(2, r);
      for (let i = 0; i < nMatches; i++) {
        pos[`${r}-${i}`] = { x: r * (matchWidth + hGap), y: i * stride + (stride / 2) - (matchHeight / 2) };
      }
    }
    return pos;
  }, [rounds, totalRounds, matchHeight, vGap, matchWidth, hGap]);
  const totalWidth = totalRounds * matchWidth + (totalRounds > 0 ? (totalRounds - 1) * hGap : 0) + championGap + championCardWidth;
  const totalHeight = useMemo(() => {
    let max = 0;
    Object.values(positions).forEach((p: {x: number, y: number}) => { max = Math.max(max, p.y + matchHeight); });
    return max + vGap * 2;
  }, [positions, matchHeight, vGap]);
  const scale = useMemo(() => {
    if (!containerSize.width || !totalWidth) return 0.5;
    return Math.min(containerSize.width / totalWidth, 1);
  }, [containerSize.width, totalWidth]);
  const connectors = useMemo(() => {
    const paths: string[] = [];
    for (let r = 0; r < totalRounds - 1; r++) {
      for (let i = 0; i < rounds[r].length; i++) {
        const fromPos = positions[`${r}-${i}`]; const toPos = positions[`${r + 1}-${Math.floor(i / 2)}`];
        if (fromPos && toPos) {
          const x1 = fromPos.x + matchWidth, y1 = fromPos.y + matchHeight / 2, x2 = toPos.x, y2 = toPos.y + matchHeight / 2, midX = x1 + hGap / 2;
          paths.push(`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`);
        }
      }
    }
    const finalMatchPos = positions[`${totalRounds - 1}-0`];
    if (finalMatchPos) {
      const championX = (totalRounds - 1) * (matchWidth + hGap) + matchWidth + championGap, x1 = finalMatchPos.x + matchWidth, y1 = finalMatchPos.y + matchHeight / 2;
      paths.push(`M ${x1} ${y1} H ${championX}`);
    }
    return paths;
  }, [rounds, positions, totalRounds, matchWidth, hGap, matchHeight]);
  const getWinnerId = (match: Match, roundIdx: number) => winners[roundIdx]?.find(w => w.id === match.a?.id || w.id === match.b?.id)?.id;
  const finalMatchPos = positions[`${totalRounds - 1}-0`];

  return (
    <div ref={containerRef} className="w-full min-h-[80vh] flex items-center justify-center p-4 overflow-x-auto">
      <div className="relative" style={{ width: totalWidth * scale, height: totalHeight * scale }}>
        <svg className="absolute top-0 left-0" width={totalWidth * scale} height={totalHeight * scale} viewBox={`0 0 ${totalWidth} ${totalHeight}`} preserveAspectRatio="xMinYMin meet">
          <defs><filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          {connectors.map((path, i) => <path key={i} d={path} stroke="rgba(107, 114, 128, 0.5)" strokeWidth={2 / scale} fill="none" />)}
        </svg>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {rounds.map((round, r) => round.map((match, i) => {
            const pos = positions[`${r}-${i}`]; if (!pos) return null;
            const winnerId = getWinnerId(match, r);
            const renderCompetitor = (competitor: Competitor | null, isWinner: boolean, competitorKey: 'a' | 'b') => (
              <div onClick={() => competitor && match.a && match.b && onWinnerSelect(r, i, competitor)} className={`group w-full rounded-md transition-all duration-200 ${isWinner ? 'bg-blue-500/20' : 'hover:bg-slate-700/50 cursor-pointer'}`}>
                <div className="flex items-center gap-3 w-full p-2">
                  {competitor ? <>
                    <img src={competitor.images?.[0]?.url ?? placeholderImgUrl} alt={competitor.name} width={36} height={36} className="rounded-md flex-shrink-0 object-cover" />
                    <div className="w-full overflow-hidden">
                      <input type="text" value={competitor.name} onChange={(e) => onCompetitorChange(r, i, competitorKey, 'name', e.target.value)} className="text-sm truncate bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -mx-1" />
                      <input type="text" value={competitor.subtitle ?? ''} onChange={(e) => onCompetitorChange(r, i, competitorKey, 'subtitle', e.target.value)} className="text-xs truncate bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -mx-1 opacity-60 mt-1" placeholder="Subtitle..." />
                    </div>
                  </> : <p className="opacity-50 text-sm p-1">-</p>}
                </div>
              </div>
            );
            return (
              <div key={`${r}-${i}`} style={{ width: matchWidth, height: matchHeight, left: pos.x, top: pos.y }} className="absolute flex flex-col justify-around p-2 rounded-lg bg-slate-800/80 border border-slate-700 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-blue-500 hover:shadow-blue-500/10">
                {renderCompetitor(match.a, winnerId === match.a?.id, 'a')}
                {match.b && <div className="h-px bg-slate-600 my-1" />}
                {renderCompetitor(match.b, winnerId === match.b?.id, 'b')}
              </div>
            );
          }))}
          {champion && finalMatchPos && (
            <div style={{ width: championCardWidth, left: (totalRounds - 1) * (matchWidth + hGap) + matchWidth + championGap, top: finalMatchPos.y + matchHeight / 2 - 65 }} className="absolute flex flex-col items-center justify-center p-3 rounded-lg bg-slate-900 border-2 border-yellow-400 shadow-2xl shadow-yellow-400/20">
              <Crown size={24} className="text-yellow-300 drop-shadow-lg" />
              <img src={champion.images?.[0]?.url ?? placeholderImgUrl} alt={champion.name} width={48} height={48} className="rounded-full my-2 border-2 border-yellow-300" />
              <p className="font-bold text-center text-sm text-yellow-200 line-clamp-2">{champion.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BracketPage: FC<{ rounds: Match[][]; winners: Competitor[][]; onCompetitorChange: (roundIndex: number, matchIndex: number, competitorKey: 'a' | 'b', field: 'name' | 'subtitle', value: string) => void; onWinnerSelect: (roundIndex: number, matchIndex: number, winner: Competitor) => void; matchWidth: number; matchHeight: number; hGap: number; vGap: number; }> = ({ rounds, winners, onCompetitorChange, onWinnerSelect, matchWidth, matchHeight, hGap, vGap }) => {
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const champion = winners.length > 0 ? winners[winners.length - 1]?.[0] || null : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <ShareModal showModal={isShareModalOpen} onClose={() => setShareModalOpen(false)} {...{champion, rounds, winners, matchWidth, matchHeight, hGap, vGap}} />
      <div className="relative z-10 p-4 sm:p-8 mx-auto w-full antialiased">
        <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Tournament Bracket</h1>
          <motion.button onClick={() => setShareModalOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30">
            <Share size={20} /> Share
          </motion.button>
        </div>
        <MainBracketView {...{rounds, winners, champion, onCompetitorChange, onWinnerSelect, matchWidth, matchHeight, hGap, vGap}} />
      </div>
    </motion.div>
  );
}

// NOTE: This generation logic is complex and has been left untouched as requested.
const generateBracketData = (competitors: Competitor[], isManual = false): { rounds: Match[][]; winners: Competitor[][] } => {
    if (competitors.length < 2) return { rounds: [], winners: [] };
    const players = [...competitors].sort(() => Math.random() - 0.5);
    let byePlayer: Competitor | null = null;
    if (players.length % 2 !== 0) { byePlayer = players.pop()!; }
    const allRounds: Match[][] = [];
    const allWinners: Competitor[][] = [];
    const round1Matches: Match[] = [];
    for (let i = 0; i < players.length; i += 2) { round1Matches.push({ a: players[i], b: players[i+1] }); }
    if (byePlayer) { round1Matches.push({ a: byePlayer, b: null }); }
    allRounds.push(round1Matches);
    const round1Winners = round1Matches.map(match => {
        if (match.a && !match.b) return match.a;
        if (!isManual && match.a && match.b) return Math.random() > 0.5 ? match.a : match.b;
        return null;
    }).filter((c): c is Competitor => c !== null);
    allWinners.push(round1Winners);
    if (!isManual) {
        let currentPlayers = round1Winners;
        while(currentPlayers.length > 1) {
            const nextRoundMatches: Match[] = []; const nextRoundWinners: Competitor[] = [];
            for (let i = 0; i < currentPlayers.length; i+= 2) {
                const match = { a: currentPlayers[i], b: currentPlayers[i+1] ?? null };
                nextRoundMatches.push(match);
                if (match.a) {
                    if (!match.b) { nextRoundWinners.push(match.a); }
                    else { nextRoundWinners.push(Math.random() > 0.5 ? match.a : match.b); }
                }
            }
            allRounds.push(nextRoundMatches); allWinners.push(nextRoundWinners); currentPlayers = nextRoundWinners;
        }
    } else {
        let lastRoundMatchCount = round1Matches.length;
        while (lastRoundMatchCount > 1) {
            const nextRoundSize = Math.ceil(lastRoundMatchCount / 2);
            allRounds.push(Array.from({ length: nextRoundSize }, () => ({ a: null, b: null })));
            allWinners.push([]);
            lastRoundMatchCount = nextRoundSize;
        }
        for (let r = 0; r < allRounds.length - 1; r++) {
            allWinners[r].forEach(winner => {
                const originalMatchIndex = allRounds[r].findIndex(m => m.a?.id === winner.id || m.b?.id === winner.id);
                if (originalMatchIndex !== -1) {
                    const nextMatchIndex = Math.floor(originalMatchIndex / 2);
                    const nextSlot = originalMatchIndex % 2 === 0 ? 'a' : 'b';
                    const nextRound = allRounds[r + 1];
                    if (nextRound?.[nextMatchIndex]) { nextRound[nextMatchIndex][nextSlot] = winner; }
                }
            });
            const nextRound = allRounds[r+1];
            if(nextRound) {
                nextRound.forEach(match => {
                    if (match.a && !match.b && !allWinners[r+1].some(w => w.id === match.a!.id)) { allWinners[r+1].push(match.a); }
                    if (!match.a && match.b && !allWinners[r+1].some(w => w.id === match.b!.id)) { allWinners[r+1].push(match.b); }
                });
            }
        }
    }
    return { rounds: allRounds, winners: allWinners };
};


const App: FC = () => {
  const [bracketData, setBracketData] = useState<{ rounds: Match[][]; winners: Competitor[][] } | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorSubtitle, setNewCompetitorSubtitle] = useState("");
  const [mode, setMode] = useState<'random' | 'manual'>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [matchWidth, setMatchWidth] = useState(310);
  const [matchHeight, setMatchHeight] = useState(150);
  const [hGap, setHGap] = useState(80);
  const [vGap, setVGap] = useState(25);
  const MAX_COMPETITORS = 1024;

  useEffect(() => {
    const initialCompetitors = Array.from({ length: 13 }, (_, i) => ({
      id: `competitor_${i + 1}`, name: `Competitor ${i + 1}`, subtitle: `Subtitle for ${i + 1}`,
      images: [{ url: `https://placehold.co/200x200/4f46e5/ffffff?text=${i+1}` }],
    }));
    setCompetitors(initialCompetitors);
    setBracketData(generateBracketData(initialCompetitors, true));
  }, []);

  const handleGenerateBracket = () => {
    setIsGenerating(true);
    setBracketData(competitors.length > 1 ? generateBracketData(competitors, mode === 'manual') : null);
    setTimeout(() => setIsGenerating(false), 1200);
  };
  const handleAddCompetitor = () => {
    if (newCompetitorName.trim() === "" || competitors.length >= MAX_COMPETITORS) return;
    const newCompetitor: Competitor = {
      id: `competitor_${Date.now()}`, name: newCompetitorName.trim(), subtitle: newCompetitorSubtitle.trim(),
      images: [{ url: `https://placehold.co/200x200/4f46e5/ffffff?text=${competitors.length + 1}` }],
    };
    setCompetitors([...competitors, newCompetitor]);
    setNewCompetitorName(""); setNewCompetitorSubtitle("");
  };
  const handleEditCompetitorInList = (id: string, field: 'name' | 'subtitle', value: string) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const handleRemoveCompetitor = (id: string) => { setCompetitors(competitors.filter(c => c.id !== id)); };
  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setCompetitors(competitors.map(c => c.id === id ? { ...c, images: [{ url: e.target?.result as string }] } : c));
    reader.readAsDataURL(file);
  };
  const handleCompetitorChangeInBracket = (roundIndex: number, matchIndex: number, competitorKey: 'a' | 'b', field: 'name' | 'subtitle', value: string) => {
      if (!bracketData) return;
      const newRounds = JSON.parse(JSON.stringify(bracketData.rounds));
      const newWinners = JSON.parse(JSON.stringify(bracketData.winners));
      const competitorToUpdate = newRounds[roundIndex][matchIndex][competitorKey];
      if (competitorToUpdate) {
          const originalId = competitorToUpdate.id;
          const updatedCompetitor = { ...competitorToUpdate, [field]: value };
          for (let r = 0; r < newRounds.length; r++) {
              for (let m = 0; m < newRounds[r].length; m++) {
                  if (newRounds[r][m].a?.id === originalId) newRounds[r][m].a = updatedCompetitor;
                  if (newRounds[r][m].b?.id === originalId) newRounds[r][m].b = updatedCompetitor;
              }
          }
          for (let w = 0; w < newWinners.length; w++) {
              for (let i = 0; i < newWinners[w].length; i++) {
                  if (newWinners[w][i].id === originalId) newWinners[w][i] = updatedCompetitor;
              }
          }
          setBracketData({ rounds: newRounds, winners: newWinners });
      }
  };
  const handleWinnerSelect = (roundIndex: number, matchIndex: number, winner: Competitor) => {
    if (!bracketData || mode === 'random') return;
    let newRounds = JSON.parse(JSON.stringify(bracketData.rounds)) as Match[][];
    let newWinners = JSON.parse(JSON.stringify(bracketData.winners)) as Competitor[][];
    const match = newRounds[roundIndex][matchIndex];
    const clearFutureProgression = (currentRound: number, currentMatchIdx: number) => {
        if (currentRound + 1 >= newRounds.length) return;
        const nextMatchIndex = Math.floor(currentMatchIdx / 2);
        const nextSlot = currentMatchIdx % 2 === 0 ? 'a' : 'b';
        const progressedCompetitor = newRounds[currentRound + 1]?.[nextMatchIndex]?.[nextSlot];
        if (progressedCompetitor) {
            newRounds[currentRound + 1][nextMatchIndex][nextSlot] = null;
            newWinners[currentRound + 1] = newWinners[currentRound + 1].filter((w: Competitor) => w.id !== progressedCompetitor.id);
            clearFutureProgression(currentRound + 1, nextMatchIndex);
        }
    };
    clearFutureProgression(roundIndex, matchIndex);
    newWinners[roundIndex] = newWinners[roundIndex].filter((w: Competitor) => w.id !== match.a?.id && w.id !== match.b?.id);
    newWinners[roundIndex].push(winner);
    for (let r = roundIndex; r < newRounds.length - 1; r++) {
        const currentWinnersInRound = newWinners[r]; const nextRound = newRounds[r+1]; const nextWinnersInRound = newWinners[r+1];
        currentWinnersInRound.forEach(w => {
            const mi = newRounds[r].findIndex(m => m.a?.id === w.id || m.b?.id === w.id);
            if(mi !== -1) {
                const nmi = Math.floor(mi / 2), ns = mi % 2 === 0 ? 'a' : 'b';
                if(nextRound?.[nmi]) { nextRound[nmi][ns] = w; }
            }
        });
        if (nextRound) {
            nextRound.forEach(m => {
                if(m.a && !m.b && !nextWinnersInRound.some(win => win.id === m.a!.id)) nextWinnersInRound.push(m.a);
                if(!m.a && m.b && !nextWinnersInRound.some(win => win.id === m.b!.id)) nextWinnersInRound.push(m.b);
            });
        }
    }
    setBracketData({ rounds: newRounds, winners: newWinners });
  };

  const primaryBtnClasses = "flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";
  const inputClasses = "bg-slate-700 text-white rounded-lg px-4 py-2 w-full border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 focus:bg-slate-800";

  return (
    <div className="bg-slate-900 text-white font-sans min-h-screen">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <header className="relative p-6 border-b border-slate-700/50">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Bracket Component Tester</h1>
        <p className="text-center text-slate-400 mt-2">Add, edit, or remove competitors, then generate the bracket.</p>
      </header>
      <div className="relative max-w-7xl mx-auto p-4 sm:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Competitor List ({competitors.length})</h2>
            <div className="flex items-center gap-2 p-1 bg-slate-700/80 rounded-lg border border-slate-600">
              <button onClick={() => setMode('random')} className={`px-4 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${mode === 'random' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-600/50'}`}><Zap size={16}/> Random</button>
              <button onClick={() => setMode('manual')} className={`px-4 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${mode === 'manual' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-600/50'}`}><PenSquare size={16}/> Manual</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <AnimatePresence>
            {competitors.map((competitor) => (
              <motion.div layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} key={competitor.id} className="flex items-center bg-slate-700/50 p-2 rounded-lg gap-3 border border-transparent hover:border-slate-600 transition-colors duration-200">
                <label title="Click to upload image" className="cursor-pointer group relative flex-shrink-0">
                  <img src={competitor.images?.[0]?.url ?? placeholderImgUrl} alt={competitor.name} width={40} height={40} className="rounded-md object-cover transition-opacity group-hover:opacity-70" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><UploadCloud size={20} /></div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(competitor.id, e.target.files[0])} />
                </label>
                <div className="flex-grow">
                  <input type="text" value={competitor.name} onChange={(e) => handleEditCompetitorInList(competitor.id, 'name', e.target.value)} className="bg-transparent text-white w-full focus:outline-none text-sm font-semibold" placeholder="Name..."/>
                  <input type="text" value={competitor.subtitle ?? ''} onChange={(e) => handleEditCompetitorInList(competitor.id, 'subtitle', e.target.value)} className="bg-transparent text-slate-400 w-full focus:outline-none text-xs" placeholder="Subtitle..."/>
                </div>
                <button onClick={() => handleRemoveCompetitor(competitor.id)} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 p-1">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6 items-end">
             <input type="text" value={newCompetitorName} onChange={(e) => setNewCompetitorName(e.target.value)} className={inputClasses} placeholder="New competitor name..." />
             <input type="text" value={newCompetitorSubtitle} onChange={(e) => setNewCompetitorSubtitle(e.target.value)} className={inputClasses} placeholder="Subtitle..."/>
          </div>
          <div className="flex flex-wrap gap-4 justify-between border-t border-slate-700 pt-6">
            <button onClick={handleAddCompetitor} className={primaryBtnClasses}><PlusCircle size={20} /> Add Competitor </button>
            <button onClick={handleGenerateBracket} disabled={isGenerating} className={`${primaryBtnClasses} ${isGenerating ? 'bg-gradient-to-r from-green-500 to-teal-500' : ''}`}>
                <AnimatePresence mode="wait">
                    <motion.span key={isGenerating ? 'generating' : 'idle'} initial={{opacity:0, y: -10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 10}} transition={{duration:0.2}} className="flex items-center gap-2">
                        {isGenerating ? <><CheckCircle size={20}/> Generated!</> : <><RefreshCw size={20}/> Generate Bracket</>}
                    </motion.span>
                </AnimatePresence>
            </button>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-4 mt-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4">Bracket Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="block text-sm text-slate-400 mb-1">Card Width</label><input type="number" value={matchWidth} onChange={(e) => setMatchWidth(parseInt(e.target.value) || 300)} className={inputClasses} /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Card Height</label><input type="number" value={matchHeight} onChange={(e) => setMatchHeight(parseInt(e.target.value) || 100)} className={inputClasses} /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Horizontal Gap</label><input type="number" value={hGap} onChange={(e) => setHGap(parseInt(e.target.value) || 60)} className={inputClasses} /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Vertical Gap</label><input type="number" value={vGap} onChange={(e) => setVGap(parseInt(e.target.value) || 25)} className={inputClasses} /></div>
            </div>
          </div>
        </motion.div>
      </div>
      <main className="relative">
        <AnimatePresence>
            {bracketData && bracketData.rounds.length > 0 ? (
            <BracketPage {...{rounds: bracketData.rounds, winners: bracketData.winners, onCompetitorChange: handleCompetitorChangeInBracket, onWinnerSelect: handleWinnerSelect, matchWidth, matchHeight, hGap, vGap}} />
            ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-10 text-slate-500">Add at least two competitors to generate a bracket.</motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;