import React, { useState, useRef, useEffect } from 'react';
import { 
    ArrowLeft, Play, Info, CheckCircle2, XCircle, Target, 
    BookOpen, Quote, ShieldCheck, BarChart3, ChevronRight, 
    Lightbulb, MessageSquare, Brain
} from 'lucide-react';
import { LearningChart } from './LearningChart';
import type { AcademyLesson } from '../types';

interface LearnSimulatorProps {
    lesson: AcademyLesson;
    onBack: () => void;
    onComplete: () => void;
}

type SimulationPhase = 'preview' | 'concept' | 'task' | 'decision' | 'simulation' | 'result';

export const LearnSimulator: React.FC<LearnSimulatorProps & { onNextLesson?: () => void }> = ({ lesson, onBack, onComplete, onNextLesson }) => {
    const [phase, setPhase] = useState<SimulationPhase>('concept');
    const [taskSuccess, setTaskSuccess] = useState(false);
    const [simAction, setSimAction] = useState<'buy' | 'sell' | 'wait' | null>(null);
    const [showFuture, setShowFuture] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [revealAnswer, setRevealAnswer] = useState(false);
    const [userFeedback, setUserFeedback] = useState<string | null>(null);

    const handleTaskComplete = (success: boolean) => {
        if (success) {
            setTaskSuccess(true);
            setUserFeedback(lesson.chartTasks[0].successMessage);
            // Auto-transition to decision after a delay or let user click
        } else {
            const nextAttempts = attempts + 1;
            setAttempts(nextAttempts);
            
            if (nextAttempts >= 2) {
                setRevealAnswer(true);
                setTaskSuccess(true); // Allow proceeding
                setUserFeedback("Analyst Guidance: We've highlighted the correct zone. Study the pattern before making your tactical decision.");
            } else {
                setUserFeedback(`Pattern Missed. Refine your analysis (1 attempt remaining).`);
            }
        }
    };

    const handleDecision = (action: 'buy' | 'sell' | 'wait') => {
        setSimAction(action);
        setPhase('simulation');
        setShowFuture(true);
        setTimeout(() => setPhase('result'), 2000); // Transition to result after animation
        
        if (action === lesson.simulation.correctAction) {
            // Success logic if needed
        }
    };

    const isCorrect = simAction === lesson.simulation.correctAction;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0b14', color: '#e2e8f0' }}>
            {/* Professional Header */}
            <div style={{ 
                padding: '16px 24px', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: '#07070c',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <ArrowLeft size={16} /> EXIT SIMULATOR
                    </button>
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                        {lesson.category} <ChevronRight size={14} style={{ opacity: 0.3 }} /> {lesson.title}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['concept', 'task', 'decision', 'result'].map((p, idx) => (
                        <div key={p} style={{ 
                            width: '40px', 
                            height: '4px', 
                            background: phase === p || (idx < ['concept', 'task', 'decision', 'result'].indexOf(phase)) ? '#00d4ff' : 'rgba(255,255,255,0.1)',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease'
                        }} />
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Fixed Control Sidebar (40%) */}
                <div style={{ 
                    width: '400px', 
                    padding: '32px', 
                    overflowY: 'auto', 
                    borderRight: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '24px',
                    background: '#0b0b14',
                    boxShadow: '20px 0 50px rgba(0,0,0,0.3)'
                }}>
                    
                    {/* Phase 1: The Concept */}
                    <section style={{ opacity: phase === 'concept' ? 1 : 0.4, transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#8b5cf6', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                            <Brain size={14} /> 01. The Concept
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>Mastering {lesson.title}</h2>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '14px', marginBottom: '20px' }}>{lesson.theory}</p>
                        
                        {phase === 'concept' && (
                            <button 
                                onClick={() => setPhase('task')}
                                style={{ width: '100%', padding: '14px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                <Target size={16} /> Enter Technical Task
                            </button>
                        )}
                    </section>

                    {/* Phase 2: Technical Task */}
                    <section style={{ opacity: phase === 'task' ? 1 : 0.4, transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#00d4ff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                            <ShieldCheck size={14} /> 02. Technical Task
                        </div>
                        <div style={{ padding: '20px', background: 'rgba(0, 212, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.1)', position: 'relative' }}>
                            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, lineHeight: 1.5, marginBottom: '16px' }}>{lesson.chartTasks[0].instruction}</p>
                            
                            {taskSuccess ? (
                                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '8px' }}>
                                    <CheckCircle2 size={16} /> {userFeedback}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#64748b' }}>
                                    <Info size={16} style={{ flexShrink: 0 }} />
                                    <span>{lesson.chartTasks[0].hint}</span>
                                </div>
                            )}

                            {taskSuccess && phase === 'task' && (
                                <button 
                                    onClick={() => setPhase('decision')}
                                    style={{ marginTop: '20px', width: '100%', padding: '14px', background: '#00d4ff', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                                >
                                    Confirm Analysis
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Phase 3: Tactical Decision */}
                    <section style={{ opacity: (phase === 'decision' || phase === 'simulation') ? 1 : 0.4, transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#f59e0b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                            <Play size={14} /> 03. Tactical Decision
                        </div>
                        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>Based on your analysis, how will you execute this trade?</p>
                        
                        {(phase === 'decision' || phase === 'simulation') && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button 
                                    disabled={phase === 'simulation'}
                                    onClick={() => handleDecision('buy')} 
                                    style={{ padding: '14px', background: simAction === 'buy' ? '#10b981' : 'rgba(16, 185, 129, 0.1)', color: simAction === 'buy' ? '#000' : '#10b981', border: '1px solid #10b981', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    BUY (Long)
                                </button>
                                <button 
                                    disabled={phase === 'simulation'}
                                    onClick={() => handleDecision('sell')} 
                                    style={{ padding: '14px', background: simAction === 'sell' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)', color: simAction === 'sell' ? '#000' : '#ef4444', border: '1px solid #ef4444', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    SELL (Short)
                                </button>
                                <button 
                                    disabled={phase === 'simulation'}
                                    onClick={() => handleDecision('wait')} 
                                    style={{ padding: '14px', background: simAction === 'wait' ? '#64748b' : 'rgba(100, 116, 139, 0.1)', color: simAction === 'wait' ? '#fff' : '#64748b', border: '1px solid #64748b', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    WAIT (Sidelines)
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Phase 4: Feedback & Reasoning */}
                    <section style={{ opacity: phase === 'result' ? 1 : 0.4, transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#fff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                            <MessageSquare size={14} /> 04. Mentor Feedback
                        </div>
                        
                        {phase === 'result' && (
                            <div className="fade-in">
                                <div style={{ 
                                    padding: '20px', 
                                    background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
                                    borderRadius: '16px', 
                                    border: `1px solid ${isCorrect ? '#10b98133' : '#ef444433'}`,
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontWeight: 800, fontSize: '15px', color: isCorrect ? '#10b981' : '#ef4444' }}>
                                        {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                        {isCorrect ? 'Professional Analysis' : 'Lessons Learned'}
                                    </div>
                                    <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '16px' }}>{lesson.simulation.feedback.analysis}</p>
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Market Reasoning</div>
                                        <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#94a3b8' }}>{lesson.simulation.feedback.reasoning}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        onComplete();
                                        if (onNextLesson) {
                                            onNextLesson();
                                        } else {
                                            onBack();
                                        }
                                    }} 
                                    style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 30px rgba(0, 212, 255, 0.2)' }}
                                >
                                    Proceed to Next Lesson
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Professional Chart Hub (60%) */}
                <div style={{ flex: 1, background: '#07070c', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
                        {/* Simulation Overlay */}
                        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, display: 'flex', gap: '12px' }}>
                            <div style={{ background: 'rgba(11, 11, 20, 0.8)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Simulation Mode</div>
                                <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    BTC/USDT <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #10b981' }} />
                                </div>
                            </div>
                            
                            {simAction && (
                                <div className="fade-in" style={{ 
                                    background: simAction === 'buy' ? 'rgba(16, 185, 129, 0.2)' : simAction === 'sell' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)', 
                                    padding: '10px 20px', 
                                    borderRadius: '12px', 
                                    border: `1px solid ${simAction === 'buy' ? '#10b981' : simAction === 'sell' ? '#ef4444' : '#64748b'}`,
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{ fontSize: '10px', color: '#fff', fontWeight: 800, textTransform: 'uppercase' }}>Position</div>
                                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{simAction.toUpperCase()}</div>
                                </div>
                            )}
                        </div>

                        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '95%', height: '85%' }}>
                                <LearningChart 
                                    data={lesson.simulation.snapshotData} 
                                    task={(phase === 'task' || phase === 'concept') && !revealAnswer ? lesson.chartTasks[0] : undefined}
                                    onTaskComplete={handleTaskComplete}
                                    showSimulation={showFuture}
                                    futureData={lesson.simulation.futureData}
                                    showAnswer={revealAnswer}
                                    answerRange={lesson.chartTasks[0].targetPriceRange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
