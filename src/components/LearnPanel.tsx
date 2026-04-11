import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, Play, Book, Target, ShieldCheck, TrendingUp, Presentation, Lightbulb, ListChecks } from 'lucide-react';
import type { AcademyLesson, AcademyModule, UserProgress } from '../types';
import { ACADEMY_CURRICULUM } from '../data/academyCurriculum';
import { LearnSimulator } from './LearnSimulator';

interface LearnPanelProps {
    onOpenAssistant: (lesson: any) => void;
    onTryOnMarket: (lesson: any) => void;
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

    if (simulatorMode && activeLesson) {
        return (
            <LearnSimulator 
                lesson={activeLesson} 
                onBack={() => setSimulatorMode(false)}
                onComplete={() => handleProgressUpdate(activeLesson.id)}
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
                                                            padding: '10px 12px',
                                                            borderRadius: '8px',
                                                            background: activeLesson?.id === lesson.id ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                                                            border: 'none',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <div style={{ 
                                                            width: '18px', 
                                                            height: '18px', 
                                                            borderRadius: '4px', 
                                                            background: progress.completedLessonIds.includes(lesson.id) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {progress.completedLessonIds.includes(lesson.id) ? <CheckCircle2 size={12} color="#10b981" /> : <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: activeLesson?.id === lesson.id ? '#00d4ff' : '#334155' }} />}
                                                        </div>
                                                        <span style={{ fontSize: '13px', fontWeight: 500, color: activeLesson?.id === lesson.id ? '#fff' : '#94a3b8' }}>{lesson.title}</span>
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
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {!activeLesson ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Presentation size={32} color="#8b5cf6" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Welcome to the Trading Academy</h2>
                        <p style={{ color: '#64748b', maxWidth: '400px', lineHeight: 1.6 }}>Select a lesson from the curriculum to start your professional trading simulation.</p>
                    </div>
                ) : previewMode ? (
                    <div className="fade-in" style={{ padding: '60px 80px', maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#00d4ff', fontSize: '13px', fontWeight: 700 }}>
                            <ShieldCheck size={16} /> PROFESSIONAL MODULE
                        </div>
                        <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#fff', marginBottom: '24px', lineHeight: 1.1 }}>{activeLesson.title}</h1>
                        <p style={{ fontSize: '20px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '48px' }}>{activeLesson.hook}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
                            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#fff', fontWeight: 700 }}>
                                    <Lightbulb size={18} color="#ffd700" /> Educational Goals
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {activeLesson.learningGoals.map((goal, i) => (
                                        <li key={i} style={{ fontSize: '14px', color: '#cbd5e1', display: 'flex', gap: '8px' }}>
                                            <div style={{ marginTop: '6px', width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                                            {goal}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#fff', fontWeight: 700 }}>
                                    <ListChecks size={18} color="#00d4ff" /> Activity Overview
                                </div>
                                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>{activeLesson.activityOverview}</p>
                                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                    <div style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>CHART TASK</div>
                                    <div style={{ padding: '4px 10px', background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>TRADE SIM</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleStartSimulation}
                            style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', color: '#000', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0, 212, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                        >
                            <Play size={20} fill="currentColor" /> Initialize Training Environment
                        </button>
                    </div>
                ) : (
                    <div style={{ height: '100%' }}>
                        {/* Static lesson view or content here if needed, but we go to simulatorMode */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearnPanel;
