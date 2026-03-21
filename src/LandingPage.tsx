import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatedNumber } from './components/AnimatedNumber';
import {
    Rocket, Cpu, Briefcase, Zap, BarChart2, Newspaper, TrendingUp,
    Layers, BotOff, ShieldAlert, Star,
    Zap as ZapIcon, Play, ChevronDown, Check, Info
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface LandingProps {
    onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroCanvasRef = useRef<HTMLDivElement>(null);
    const globeCanvasRef = useRef<HTMLDivElement>(null);

    const [prices, setPrices] = useState<any[]>([]);
    const [fng, setFng] = useState<any>(null);
    const [demoStep, setDemoStep] = useState(0);
    const [demoAItext, setDemoAIText] = useState('');
    const [yearly, setYearly] = useState(false);

    // Stats Counters
    const [stats, setStats] = useState({ uptime: 0, latency: 0, fees: 0, signals: 0 });

    const demoConversations = [
        {
            user: "Should I buy ETH right now?",
            ai: "ETH is at $2,180 (-6.4%). Fear & Greed is 23 — Extreme Fear. Whales accumulating. This is a fear-driven dip. Risk: Medium-High. Want me to open a position?",
            panel: "chart"
        },
        {
            user: "Analyze BTC chart",
            ai: "BTC analysis complete. Support: $68,420. Resistance: $73,800. EMA20 above EMA50 — bullish structure. Key level to watch: $70,000.",
            panel: "chart-with-lines"
        },
        {
            user: "Send 0.05 BNB to Rahul",
            ai: "Found Rahul at 0x4f3...a91. Sending 0.05 BNB. Gas fee: ~$0.20. Confirm?",
            panel: "transaction"
        }
    ];

    // Fetch Live Data
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const coinIds = 'bitcoin,ethereum,binancecoin,solana';
                const priceRes = await fetch(`/api/coingecko/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);
                if (priceRes.ok) {
                    const d = await priceRes.json();
                    setPrices([
                        { id: 'bitcoin', symbol: 'BTC', price: d.bitcoin?.usd, change: d.bitcoin?.usd_24h_change },
                        { id: 'ethereum', symbol: 'ETH', price: d.ethereum?.usd, change: d.ethereum?.usd_24h_change },
                        { id: 'solana', symbol: 'SOL', price: d.solana?.usd, change: d.solana?.usd_24h_change },
                        { id: 'binancecoin', symbol: 'BNB', price: d.binancecoin?.usd, change: d.binancecoin?.usd_24h_change },
                    ]);
                }
                const fngRes = await fetch('https://api.alternative.me/fng/');
                if (fngRes.ok) {
                    const d = await fngRes.json();
                    setFng(d.data?.[0]);
                }
            } catch (e) {
                console.log("Failed to fetch landing stats", e);
            }
        };
        fetchStats();
    }, []);

    // Premium neon cursor glow
    useEffect(() => {
        if (!containerRef.current) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const cursor = document.createElement('div');
        cursor.className = 'cursor-neon';
        document.body.appendChild(cursor);

        let rafId = 0;
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;

        const onMouseMove = (e: MouseEvent) => {
            targetX = e.clientX;
            targetY = e.clientY;
            cursor.classList.add('active');
        };

        const onMouseDown = () => cursor.classList.add('pressed');
        const onMouseUp = () => cursor.classList.remove('pressed');

        const tick = () => {
            currentX += (targetX - currentX) * 0.16;
            currentY += (targetY - currentY) * 0.16;
            cursor.style.left = `${currentX}px`;
            cursor.style.top = `${currentY}px`;
            rafId = requestAnimationFrame(tick);
        };

        document.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mousedown', onMouseDown, { passive: true });
        document.addEventListener('mouseup', onMouseUp, { passive: true });
        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            cursor.remove();
        };
    }, []);

    // GSAP Animations Setup (using useGSAP to fix StrictMode double-fire bugs)
    useGSAP(() => {
        // Hero Entrance
        gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, delay: 0.2 });
        gsap.from('.hero-heading', { opacity: 0, y: 40, duration: 0.8, delay: 0.4, stagger: 0.1 });
        gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 0.6, delay: 0.8 });
        gsap.from('.hero-prices', { opacity: 0, duration: 0.6, delay: 1.0 });
        gsap.from('.hero-cta', { opacity: 0, y: 20, duration: 0.6, delay: 1.2, stagger: 0.1 });

        // Lightweight non-scroll animations (native scrolling remains untouched)
        gsap.from('.section', {
            opacity: 0.98,
            duration: 0.25,
            stagger: 0.03,
            ease: 'none'
        });
        gsap.to('.timeline-dot-anim', {
            left: '100%',
            duration: 3.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }, { scope: containerRef });

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setStats({ uptime: 100, latency: 30, fees: 0, signals: 10000 });
        }, 450);
        return () => window.clearTimeout(timer);
    }, []);

    // 3D Hero Scene
    useEffect(() => {
        if (!heroCanvasRef.current) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        heroCanvasRef.current.appendChild(renderer.domElement);

        // Floating nodes
        const nodes: THREE.Mesh[] = [];
        for (let i = 0; i < 15; i++) {
            const geometry = i % 2 === 0
                ? new THREE.IcosahedronGeometry(0.3, 0)
                : new THREE.OctahedronGeometry(0.25);
            const material = new THREE.MeshBasicMaterial({
                color: i % 3 === 0 ? 0x00ff88 : i % 3 === 1 ? 0x7000ff : 0x00d4ff,
                wireframe: true,
                transparent: true,
                opacity: 0.4
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4
            );
            mesh.userData = {
                rotationSpeed: { x: Math.random() * 0.005, y: Math.random() * 0.005 },
                floatSpeed: Math.random() * 0.001 + 0.0005,
                floatOffset: Math.random() * Math.PI * 2,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01)
            };
            scene.add(mesh);
            nodes.push(mesh);
        }

        // Lines between nodes
        const linesMaterial = new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.15 });
        const linesGeometry = new THREE.BufferGeometry();
        const linePositions = new Float32Array(nodes.length * nodes.length * 3);
        linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
        scene.add(linesMesh);

        // Particle field
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x5555aa,
            size: 0.02,
            transparent: true,
            opacity: 0.6
        });
        scene.add(new THREE.Points(particleGeometry, particleMaterial));

        // Mouse Parallax
        let targetCameraPos = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
            targetCameraPos.x = (e.clientX / window.innerWidth - 0.5) * 2.0;
            targetCameraPos.y = (-e.clientY / window.innerHeight + 0.5) * 2.0;
        };
        window.addEventListener('mousemove', onMouseMove);

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            camera.position.x += (targetCameraPos.x - camera.position.x) * 0.02;
            camera.position.y += (targetCameraPos.y - camera.position.y) * 0.02;
            camera.lookAt(0, 0, 0);

            const positionsBuffer = linesGeometry.attributes.position.array as Float32Array;
            let lineIndex = 0;

            nodes.forEach((node, i) => {
                node.rotation.x += node.userData.rotationSpeed.x;
                node.rotation.y += node.userData.rotationSpeed.y;

                // Gentle float bounds
                node.position.add(node.userData.velocity);
                if (node.position.length() > 6) node.userData.velocity.multiplyScalar(-1);

                // Connect nearby nodes
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = node.position.distanceTo(nodes[j].position);
                    if (dist < 3.5) {
                        positionsBuffer[lineIndex++] = node.position.x;
                        positionsBuffer[lineIndex++] = node.position.y;
                        positionsBuffer[lineIndex++] = node.position.z;
                        positionsBuffer[lineIndex++] = nodes[j].position.x;
                        positionsBuffer[lineIndex++] = nodes[j].position.y;
                        positionsBuffer[lineIndex++] = nodes[j].position.z;
                    }
                }
            });

            // Clear remaining positions
            for (let i = lineIndex; i < positionsBuffer.length; i++) positionsBuffer[i] = 0;
            linesGeometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            heroCanvasRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    // 3D Globe Scene
    useEffect(() => {
        if (!globeCanvasRef.current) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.z = 6;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        // Match the size roughly to the container
        renderer.setSize(400, 400);
        globeCanvasRef.current.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        const globeGeo = new THREE.SphereGeometry(2, 24, 24);
        const globeMat = new THREE.MeshBasicMaterial({ color: 0x7000ff, wireframe: true, transparent: true, opacity: 0.15 });
        group.add(new THREE.Mesh(globeGeo, globeMat));

        const cities = [
            { lat: 19.076, lng: 72.877 }, // Mumbai
            { lat: 40.712, lng: -74.006 }, // NYC
            { lat: 51.507, lng: -0.127 }, // London
            { lat: 1.352, lng: 103.820 }, // Singapore
            { lat: 35.689, lng: 139.692 } // Tokyo
        ];

        cities.forEach(city => {
            const phi = (90 - city.lat) * (Math.PI / 180);
            const theta = (city.lng + 180) * (Math.PI / 180);

            const dotGeo = new THREE.SphereGeometry(0.06);
            const dotMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
            const dot = new THREE.Mesh(dotGeo, dotMat);

            dot.position.set(
                -2 * Math.sin(phi) * Math.cos(theta),
                2 * Math.cos(phi),
                2 * Math.sin(phi) * Math.sin(theta)
            );
            group.add(dot);
        });

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            group.rotation.y += 0.003;
            group.rotation.x += 0.001;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            globeCanvasRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    // Demo Sequence Loop & Typewriter
    useEffect(() => {
        const activeMsg = demoConversations[demoStep].ai;
        setDemoAIText('');

        let index = 0;
        const interval = setInterval(() => {
            setDemoAIText(activeMsg.slice(0, index));
            index++;
            if (index > activeMsg.length + 40) {
                clearInterval(interval);
            }
        }, 20); // Faster typewriter

        const nextTimeout = setTimeout(() => {
            setDemoStep(s => (s + 1) % demoConversations.length);
        }, 5500);

        return () => {
            clearInterval(interval);
            clearTimeout(nextTimeout);
        };
    }, [demoStep]);

    const btcPrice = prices.find(p => p.symbol === 'BTC')?.price || 69241;
    const ethPrice = prices.find(p => p.symbol === 'ETH')?.price || 2180;
    const billingType = yearly ? 'yearly' : 'monthly';
    const openPaymentPage = (plan: 'free' | 'pro' | 'pro-plus') => {
        window.history.pushState({}, '', `/payment/${plan}?billing=${billingType}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <div ref={containerRef} className="landing-root" style={{ background: 'transparent', color: 'var(--text-primary)', overflowX: 'hidden' }}>

            {/* SECTION 1 — Hero */}
            <section className="landing-hero" style={{ height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div ref={heroCanvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.8 }} />

                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px', padding: '0 20px' }}>
                    <div className="hero-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
                        <ZapIcon size={14} fill="#00ff88" strokeWidth={0} /> AI-Powered Crypto Intelligence
                    </div>

                    <h1 className="hero-title" style={{ fontSize: 'clamp(34px, 5.3vw, 62px)', fontWeight: 800, lineHeight: 1.08, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                        <div className="hero-product">CryptoGuru.ai</div>
                        <div className="hero-heading">Trade Smarter.</div>
                        <div className="hero-heading">Not Harder.</div>
                    </h1>

                    <p className="hero-sub" style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.5 }}>
                        The world's first conversational crypto co-pilot.<br />
                        AI that thinks, reasons, and protects you — all inside a single chat.
                    </p>

                    <div className="hero-prices mono" style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', marginBottom: '40px', opacity: 0.8 }}>
                        <span>BTC ${btcPrice.toLocaleString()} <span style={{ color: '#00ff88' }}>▲2.3%</span></span>|
                        <span>ETH ${ethPrice.toLocaleString()} <span style={{ color: '#ff3366' }}>▼6.4%</span></span>|
                        <span>Fear & Greed: {fng?.value || 23} {fng?.value_classification?.toUpperCase() || 'EXTREME FEAR'}</span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '16px',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <button
                            className="btn-primary hero-cta"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                lineHeight: 1,
                                padding: '16px 36px',
                                height: '56px',
                                marginBottom: '20px'
                            }}
                            onClick={onLaunch}
                        > 
                            Launch App →
                        </button>
                        <button
                            className="btn-outline hero-cta"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '18px',
                                lineHeight: 1,
                                padding: '16px 36px',
                                height: '56px',
                                marginTop: '20px'
                            }}
                        >
                            Watch Demo <Play size={18} fill="#fff" />
                        </button>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '20px', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ opacity: 0.6 }}>scroll to explore</div>
                    <ChevronDown size={16} style={{ animation: 'bounce-slow 2s infinite' }} />
                </div>
            </section>

            {/* SECTION 2 — Stats Bar */}
            <section className="landing-ticker">
                <div className="ticker-content" style={{ display: 'flex', gap: '40px', padding: '0 20px' }}>
                    {[...prices, ...prices, ...prices].map((p, i) => (
                        p.price && (
                            <span key={i} className="mono" style={{ fontSize: '14px' }}>
                                <span style={{ color: '#00d4ff' }}>●</span> {p.symbol} ${p.price.toLocaleString()}
                                <span style={{ color: (p.change || 0) >= 0 ? '#00ff88' : '#ff3366', marginLeft: '6px' }}>
                                    {(p.change || 0) >= 0 ? '+' : ''}{(p.change || 0).toFixed(2)}%
                                </span>
                            </span>
                        )
                    ))}
                    {fng && (
                        <span className="mono" style={{ fontSize: '14px' }}>
                            <span style={{ color: '#7000ff' }}>●</span> Fear & Greed: {fng.value} Extreme Fear
                        </span>
                    )}
                </div>
            </section>

            {/* SECTION 3 — Problem Statement */}
            <section className="section problem-section" style={{ padding: '80px 5%', background: '#050508' }}>
                <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', textAlign: 'center', marginBottom: '60px', fontWeight: 800 }}>Crypto is powerful. But it's broken.</h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', maxWidth: '1200px', margin: '0 auto', justifyContent: 'center' }}>
                    {[
                        { icon: <Layers size={40} color="#ff3366" />, title: 'Too Fragmented', desc: 'Wallets, exchanges, charts, news — all separate apps.' },
                        { icon: <BotOff size={40} color="#ffb822" />, title: 'No Intelligence', desc: 'Bots show prices. They don\'t explain. They don\'t think.' },
                        { icon: <ShieldAlert size={40} color="#00d4ff" />, title: 'Too Risky', desc: 'Wrong address. Emotional trades. No protection.' }
                    ].map((item, i) => (
                        <div key={i} className="feature-card" style={{ flex: '1 1 300px', textAlign: 'center', position: 'relative' }}>
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#00d4ff' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 4 — Solution */}
            <section className="section" style={{ padding: '80px 5%', position: 'relative', overflow: 'hidden' }}>
                <div ref={globeCanvasRef} style={{ position: 'absolute', right: '-10%', top: '50%', transform: 'translateY(-50%)', zIndex: 0, opacity: 0.8, filter: 'blur(2px)' }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                    <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, marginBottom: '60px' }}>One conversation.<br /><span style={{ color: '#00ff88' }}>Everything.</span></h2>

                    <div className="glass-card" style={{ background: 'rgba(13, 13, 26, 0.6)', backdropFilter: 'blur(40px)', padding: '40px', borderRadius: '24px', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="msg-user" style={{ alignSelf: 'flex-end', fontSize: '18px' }}>
                            {demoConversations[demoStep].user}
                        </div>
                        <div className="msg-ai" style={{ alignSelf: 'flex-start', minHeight: '100px', fontSize: '18px' }}>
                            {demoAItext}
                            <span className="mono" style={{ color: '#00ff88', opacity: 0.7 }}>_</span>
                        </div>

                        <div style={{ alignSelf: 'center', marginTop: '20px', padding: '20px', border: '1px dashed rgba(0,212,255,0.4)', borderRadius: '12px', color: '#00d4ff', fontSize: '14px', width: '100%', textAlign: 'center', background: 'rgba(0,212,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            {demoConversations[demoStep].panel === 'chart' && <><BarChart2 size={16} /> Rendering Interactive Candlestick Chart</>}
                            {demoConversations[demoStep].panel === 'chart-with-lines' && <><Info size={16} /> Drawing Support/Resistance trendlines automatically</>}
                            {demoConversations[demoStep].panel === 'transaction' && <><Briefcase size={16} /> Preparing Transaction payload for wallet signing</>}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5 — Features Grid */}
            <section className="section features-grid" style={{ padding: '80px 5%', background: '#0a0a14' }}>
                <h2 style={{ textAlign: 'center', fontSize: '48px', fontWeight: 800, marginBottom: '60px' }}>Built for the way you actually think.</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                    {[
                        { icon: <Cpu size={36} color="#00ff88" />, title: "AI Intelligence", desc: "Real analysis with live prices, news and sentiment. Not generic advice." },
                        { icon: <Briefcase size={36} color="#00d4ff" />, title: "Portfolio Tracking", desc: "Connect wallet. See holdings, PnL and risk exposure in seconds." },
                        { icon: <Zap size={36} color="#ffb822" />, title: "Instant Swaps", desc: "Buy and sell tokens through conversation. Powered by PancakeSwap." },
                        { icon: <BarChart2 size={36} color="#7000ff" />, title: "Chart Analysis", desc: "AI draws support, resistance and trendlines automatically." },
                        { icon: <Newspaper size={36} color="#ff3366" />, title: "News & Sentiment", desc: "Live crypto news with Fear & Greed index. Know what market feels." },
                        { icon: <TrendingUp size={36} color="#00ff88" />, title: "Paper Futures", desc: "Practice leverage trading with $1,000 virtual balance. Zero risk." }
                    ].map((feature, i) => (
                        <div key={i} className="feature-card">
                            <div style={{ marginBottom: '20px' }}>{feature.icon}</div>
                            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 6 — How It Works */}
            <section className="section how-it-works" style={{ padding: '80px 5%' }}>
                <h2 style={{ textAlign: 'center', fontSize: '48px', fontWeight: 800, marginBottom: '60px' }}>Three steps to smarter trading.</h2>

                <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                    <div className="timeline-line">
                        <div className="timeline-dot-anim" />
                    </div>

                    {[
                        { num: 1, title: 'Connect Wallet', desc: "MetaMask,\nTrust Wallet,\nany Web3 wallet." },
                        { num: 2, title: 'Ask Anything', desc: "Natural language.\nNo buttons.\nNo menus." },
                        { num: 3, title: 'AI Acts For You', desc: "Analyzes market.\nExecutes safely.\nExplains everything." }
                    ].map((s, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-panel)', padding: '30px 20px', borderRadius: '16px', border: '1px solid var(--border-subtle)', position: 'relative', zIndex: 10 }}>
                            <div className="mono" style={{ color: '#00ff88', fontSize: '14px', marginBottom: '16px', fontWeight: 700 }}>[{s.num}]</div>
                            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px', color: '#e8e8ff' }}>{s.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 7 — Live Demo Section */}
            <section className="section" style={{ padding: '80px 5%' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '56px', fontWeight: 800, marginBottom: '16px' }}>Watch it think.</h2>
                    <p style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>This is a live simulation. Everything you see uses real market data.</p>
                </div>

                <div className="terminal-window" style={{ maxWidth: '1000px', margin: '0 auto', background: '#090912' }}>
                    <div className="terminal-header">
                        <div className="terminal-dots">
                            <span className="red" />
                            <span className="yellow" />
                            <span className="green" />
                        </div>
                        <div className="mono" style={{ margin: '0 auto', color: 'var(--text-muted)', fontSize: '12px' }}>● Cryptoguru AI ━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    </div>
                    <div style={{ padding: '40px', minHeight: '400px', position: 'relative' }}>
                        <div className="scanline" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(0,255,136,0.3)', boxShadow: '0 0 10px #00ff88', animation: 'scanline 3s linear infinite' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="msg-user" style={{ alignSelf: 'flex-end', fontSize: '16px' }}>Analyze the market today.</div>
                            <div className="msg-ai" style={{ alignSelf: 'flex-start', fontSize: '16px' }}>
                                Fetching real-time indicators...<br /><br />
                                <span style={{ color: '#00d4ff' }}>BTC Dominance:</span> 54.2%<br />
                                <span style={{ color: '#00ff88' }}>Global Volume:</span> $74B (up 12%)<br />
                                <span style={{ color: '#ff3366' }}>Liquidations (24h):</span> $320M Longs rekt.<br /><br />
                                Market is highly volatile. Recommend holding stablecoins or maintaining tight stop-losses on altcoin positions.
                                <span className="mono" style={{ color: '#00ff88', animation: 'blink 1s step-end infinite' }}> █</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto', padding: '16px 40px', fontSize: '18px' }} onClick={onLaunch}>
                        Try it yourself <Rocket size={20} />
                    </button>
                </div>
            </section>

            {/* SECTION 8 — Pricing */}
            <section className="section" style={{ padding: '80px 5%' }}>
                <h2 style={{ textAlign: 'center', fontSize: '48px', fontWeight: 800, marginBottom: '24px' }}>Start free. Scale when ready.</h2>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '60px' }}>
                    <span style={{ color: !yearly ? '#00ff88' : 'var(--text-muted)', fontWeight: !yearly ? 700 : 400 }}>Monthly</span>
                    <div
                        style={{ width: '50px', height: '26px', background: 'var(--bg-panel-2)', borderRadius: '13px', position: 'relative', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
                        onClick={() => setYearly(!yearly)}
                    >
                        <div style={{ position: 'absolute', top: '2px', left: yearly ? '26px' : '2px', width: '20px', height: '20px', background: '#00ff88', borderRadius: '50%', transition: 'left 0.2s' }} />
                    </div>
                    <span style={{ color: yearly ? '#00ff88' : 'var(--text-muted)', fontWeight: yearly ? 700 : 400 }}>Yearly (20% off)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto', alignItems: 'center' }}>

                    <div className="pricing-card">
                        <h3 style={{ fontSize: '24px', color: '#e8e8ff' }}>FREE</h3>
                        <div style={{ fontSize: '42px', fontWeight: 800, margin: '20px 0' }}>₹0<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/mo</span></div>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 2, marginBottom: '40px', listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> 5 AI prompts/day</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Basic portfolio</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Watchlist</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Paper trading</li>
                        </ul>
                        <button className="btn-outline" style={{ marginTop: 'auto', width: '100%' }} onClick={onLaunch}>Get Started</button>
                    </div>

                    <div className="pricing-card popular" style={{ position: 'relative', minHeight: '520px' }}>
                        <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: '#00ff88', color: '#050508', padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Star size={14} fill="#050508" strokeWidth={0} /> POPULAR
                        </div>
                        <h3 style={{ fontSize: '24px', color: '#00ff88' }}>PRO</h3>
                        <div style={{ fontSize: '48px', fontWeight: 800, margin: '20px 0' }}>₹{yearly ? '799' : '999'}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/mo</span></div>
                        <ul style={{ color: 'var(--text-primary)', lineHeight: 2, marginBottom: '40px', listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Unlimited AI</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Whale alerts</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Personalized brief</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Full sentiment</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Signal feed access</li>
                        </ul>
                        <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => openPaymentPage('pro')}>Start Pro →</button>
                    </div>

                    <div className="pricing-card">
                        <h3 style={{ fontSize: '24px', color: '#7000ff' }}>PRO+</h3>
                        <div style={{ fontSize: '42px', fontWeight: 800, margin: '20px 0' }}>₹{yearly ? '1599' : '1999'}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/mo</span></div>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 2, marginBottom: '40px', listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Everything in Pro</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Advanced charts</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Voice brief</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Priority compute</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#00ff88" /> Backtesting</li>
                        </ul>
                        <button className="btn-outline" style={{ marginTop: 'auto', width: '100%' }} onClick={() => openPaymentPage('pro-plus')}>Go Pro+ →</button>
                    </div>

                </div>
            </section>

            {/* SECTION 9 — Social Proof */}
            <section className="section social-proof" style={{ padding: '80px 5%', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 700, marginBottom: '60px' }}>Built on trust. Powered by transparency.</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <div>
                        <div className="mono" style={{ fontSize: '48px', color: '#00ff88', fontWeight: 800, marginBottom: '10px' }}><AnimatedNumber value={stats.uptime} format={n => `${Math.floor(n)}%`} /></div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>Open Source Ready</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>Full transparency</p>
                    </div>
                    <div>
                        <div className="mono" style={{ fontSize: '48px', color: '#00d4ff', fontWeight: 800, marginBottom: '10px' }}>&lt;<AnimatedNumber value={stats.latency} format={n => Math.floor(n).toString()} />ms</div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>Real-time Market Data</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>Prices refresh instantly</p>
                    </div>
                    <div>
                        <div className="mono" style={{ fontSize: '48px', color: '#7000ff', fontWeight: 800, marginBottom: '10px' }}><AnimatedNumber value={stats.fees} format={n => `${Math.floor(n)}`} /></div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>Zero Hidden Fees</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>No surprise charges</p>
                    </div>
                    <div>
                        <div className="mono" style={{ fontSize: '48px', color: '#00ff88', fontWeight: 800, marginBottom: '10px' }}><AnimatedNumber value={stats.signals} format={n => `${(n / 1000).toFixed(0)}k+`} /></div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>AI-Verified Signals</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>Every signal is tracked</p>
                    </div>
                </div>
            </section>

            {/* SECTION 10 — Final CTA */}
            <section className="section cta-section" style={{ padding: '100px 5%', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, marginBottom: '40px', maxWidth: '900px', margin: '0 auto 40px', lineHeight: 1.1 }}>
                    Ready to trade with an AI that actually thinks?
                </h2>
                <button className="btn-primary" style={{ padding: '20px 48px', fontSize: '20px', borderRadius: '12px', boxShadow: '0 0 40px rgba(0, 255, 136, 0.4)' }} onClick={onLaunch}>
                    Launch Cryptoguru — It's Free →
                </button>
                <p style={{ color: '#888', marginTop: '24px', fontSize: '15px' }}>
                    No credit card required · Connect wallet in seconds
                </p>
            </section>

            {/* SECTION 11 — Footer */}
            <footer className="section" style={{ padding: '60px 5% 40px', background: '#020204', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto', marginBottom: '80px' }}>
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#e8e8ff', marginBottom: '16px' }}>Cryptoguru AI</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Bloomberg × ChatGPT Terminal</p>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            <strong>Powered by:</strong><br />
                            Groq · CoinGecko · BNB Chain
                        </div>
                    </div>

                    <div>
                        <h4 style={{ color: '#e8e8ff', fontWeight: 700, marginBottom: '20px' }}>Product</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                            <li style={{ cursor: 'pointer' }}>Features</li>
                            <li style={{ cursor: 'pointer' }}>Pricing</li>
                            <li style={{ cursor: 'pointer' }}>Signal Feed</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: '#e8e8ff', fontWeight: 700, marginBottom: '20px' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                            <li style={{ cursor: 'pointer' }}>About</li>
                            <li style={{ cursor: 'pointer' }}>Contact</li>
                        </ul>
                    </div>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', paddingTop: '40px', borderTop: '1px solid var(--border-subtle)' }}>
                    © 2026 Cryptoguru. Built for the future of trading.
                </div>
            </footer>
        </div>
    );
}
