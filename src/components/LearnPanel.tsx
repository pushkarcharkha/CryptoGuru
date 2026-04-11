import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, Play, Book, ShieldCheck, Presentation, Lightbulb, ListChecks } from 'lucide-react';
import type { AcademyLesson, UserProgress } from '../types';
import { ACADEMY_CURRICULUM } from '../data/academyCurriculum';
import { LearnSimulator } from './LearnSimulator';

interface LearnPanelProps {
    onOpenAssistant: (lesson: AcademyLesson) => void;
    onTryOnMarket: (lesson: AcademyLesson) => void;
}

const INITIAL_PROGRESS: UserProgress = {
    completedLessonIds: []
};

const LearnPanel: React.FC<LearnPanelProps> = ({ onOpenAssistant }) => {
    const [progress, setProgress] = useState<UserProgress>(() => {
        const saved = localStorage.getItem('cryptoguru_academy_progress');
        return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
    });

    const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [simulatorMode, setSimulatorMode] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ 'mod-1': true });

    useEffect(() => {
        localStorage.setItem('cryptoguru_academy_progress', JSON.stringify(progress));
    }, [progress]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const handleLessonSelect = (lesson: AcademyLesson) => {
        setActiveLesson(lesson);
        setPreviewMode(true);
        setSimulatorMode(false);
        onOpenAssistant(lesson);
    };

    const handleStartSimulation = () => {
        setPreviewMode(false);
        setSimulatorMode(true);
    };

    const handleProgressUpdate = (lessonId: string) => {
        setProgress(prev => {
            if (prev.completedLessonIds.includes(lessonId)) return prev;
            return {
                ...prev,
                completedLessonIds: [...prev.completedLessonIds, lessonId]
            };
        });
    };

    const getNextLesson = (currentId: string): AcademyLesson | null => {
        const allLessons: AcademyLesson[] = ACADEMY_CURRICULUM.flatMap(m => 
            m.subsections.flatMap(s => s.lessons)
        );
        const currentIndex = allLessons.findIndex(l => l.id === currentId);
        if (currentIndex === -1 || currentIndex === allLessons.length - 1) return null;
        return allLessons[currentIndex + 1];
    };

    const handleNextLesson = () => {
        if (!activeLesson) return;
        const next = getNextLesson(activeLesson.id);
        if (next) {
            setActiveLesson(next);
            setPreviewMode(true);
            setSimulatorMode(false);
            onOpenAssistant(next);
        } else {
            setSimulatorMode(false);
            setPreviewMode(false);
            setActiveLesson(null);
        }
    };

    if (simulatorMode && activeLesson) {
        return (
            <LearnSimulator 
                lesson={activeLesson} 
                onBack={() => setSimulatorMode(false)}
                onComplete={() => handleProgressUpdate(activeLesson.id)}
                onNextLesson={handleNextLesson}
            />
        );
    }

    const totalLessons = ACADEMY_CURRICULUM.reduce((acc, mod) => 
        acc + mod.subsections.reduce((sAcc, sub) => sAcc + sub.lessons.length, 0), 0
    );
    const completedCount = progress.completedLessonIds.length;
    const completionRate = Math.round((completedCount / totalLessons) * 100);

    return (
        <div style={{ display: 'flex', height: '100%', background: '#07070c', color: '#e2e8f0' }}>
            {/* 3-Level Academy Sidebar */}
            <div style={{ width: '340px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px', overflowY: 'auto', flexShrink: 0, background: '#0b0b14' }}>
                
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Academy Progress</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                        <span>{completionRate}% Complete</span>
                        <span style={{ color: 'var(--text-muted)' }}>{completedCount}/{totalLessons}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${completionRate}%`, height: '100%', background: 'linear-gradient(90deg, #00d4ff, #8b5cf6)', transition: 'width 0.5s ease' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {ACADEMY_CURRICULUM.map(module => (
                        <div key={module.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
                            <button 
                                onClick={() => toggleModule(module.id)}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', textAlign: 'left' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Book size={16} color="#8b5cf6" />
                                    <span style={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>{module.title}</span>
                                </div>
                                {expandedModules[module.id] ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
                            </button>

                            {expandedModules[module.id] && (
                                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '8px' }}>
                                    {module.subsections.map(sub => (
                                        <div key={sub.id}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px', paddingLeft: '8px' }}>{sub.title}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {sub.lessons.map(lesson => (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleLessonSelect(lesson)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            background: activeLesson?.id === lesson.id ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                                                            border: 'none',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            width: '100%',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ 
                                                            width: '16px', 
                                                            height: '16px', 
                                                            borderRadius: '4px', 
                                                            background: progress.completedLessonIds.includes(lesson.id) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {progress.completedLessonIds.includes(lesson.id) ? <CheckCircle2 size={10} color="#10b981" /> : <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: activeLesson?.id === lesson.id ? '#00d4ff' : '#1e293b' }} />}
                                                        </div>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: activeLesson?.id === lesson.id ? '#fff' : '#94a3b8' }}>{lesson.title}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Display Area */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#07070c' }}>
                {!activeLesson ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                            <Presentation size={40} color="#8b5cf6" />
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', color: '#fff' }}>Trading Academy Portal</h2>
                        <p style={{ color: '#64748b', maxWidth: '440px', lineHeight: 1.6, fontSize: '16px' }}>Select a specialized module from the curriculum to begin your path to market mastery.</p>
                    </div>
                ) : previewMode ? (
                    <div className="fade-in" style={{ padding: '80px 100px', maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#00d4ff', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <ShieldCheck size={16} /> Decision-Making Simulation
                        </div>
                        <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#fff', marginBottom: '24px', lineHeight: 1, letterSpacing: '-0.02em' }}>{activeLesson.title}</h1>
                        <p style={{ fontSize: '22px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '40px', maxWidth: '800px' }}>{activeLesson.hook}</p>
                        
                        {activeLesson.explanation && (
                            <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '60px', maxWidth: '800px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                                {activeLesson.explanation}
                            </p>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
                            <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#fff', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
                                    <Lightbulb size={18} color="#f59e0b" /> Learning Outcome
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {activeLesson.learningGoals?.map((goal: string, i: number) => (
                                        <li key={i} style={{ fontSize: '14px', color: '#cbd5e1', display: 'flex', gap: '12px', lineHeight: 1.5 }}>
                                            <div style={{ marginTop: '8px', width: '5px', height: '5px', borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                                            {goal}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#fff', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
                                    <ListChecks size={18} color="#00d4ff" /> Practical Activity
                                </div>
                                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>{activeLesson.activityOverview}</p>
                                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                    <div style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>TECHNICAL TASK</div>
                                    <div style={{ padding: '6px 14px', background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', borderRadius: '8px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>TRADING SIM</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleStartSimulation}
                            style={{ 
                                width: '100%', 
                                padding: '24px', 
                                background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '16px', 
                                fontWeight: 900, 
                                fontSize: '18px', 
                                cursor: 'pointer', 
                                boxShadow: '0 10px 40px rgba(0, 212, 255, 0.2)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '16px',
                                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Play size={24} fill="currentColor" /> Enter Simulation Environment
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default LearnPanel;
