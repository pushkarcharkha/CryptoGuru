import React, { useState } from 'react';
import { ArrowLeft, Play, Info, CheckCircle2, XCircle, Target, BookOpen, Quote, ShieldCheck, BarChart3 } from 'lucide-react';
import { LearningChart } from './LearningChart';
import type { AcademyLesson } from '../types';

interface LearnSimulatorProps {
    lesson: AcademyLesson;
    onBack: () => void;
    onComplete: () => void;
}

export const LearnSimulator: React.FC<LearnSimulatorProps> = ({ lesson, onBack, onComplete }) => {
    const [step, setStep] = useState<'learn' | 'task' | 'simulation' | 'result'>('learn');
    const [taskSuccess, setTaskSuccess] = useState(false);
    const [simAction, setSimAction] = useState<'buy' | 'sell' | 'wait' | null>(null);
    const [showFuture, setShowFuture] = useState(false);
    const [userFeedback, setUserFeedback] = useState<string | null>(null);

    const handleTaskComplete = (success: boolean) => {
        if (success) {
            setTaskSuccess(true);
            setUserFeedback(lesson.chartTasks[0].successMessage);
        }
    };

    const handleSimulation = (action: 'buy' | 'sell' | 'wait') => {
        setSimAction(action);
        setShowFuture(true);
        setStep('result');
        
        if (action === lesson.simulation.correctAction) {
            onComplete();
        }
    };

    const isCorrect = simAction === lesson.simulation.correctAction;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0b14' }}>
            {/* Academy Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#07070c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        <ArrowLeft size={16} /> EXIT STUDY
                    </button>
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>{lesson.title}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ padding: '6px 12px', background: 'rgba(0, 212, 255, 0.05)', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
                        SIMULATION ACTIVE
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Study Sidebar */}
                <div style={{ width: '420px', padding: '32px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '32px', background: '#0b0b14' }}>
                    
                    {/* Phase 1: Institutional Theory */}
                    <div style={{ opacity: step === 'learn' ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#8b5cf6', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                            <BookOpen size={14} /> Phase 1: Institutional Logic
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', color: '#fff', lineHeight: 1.2 }}>{lesson.title}</h2>
                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid #8b5cf6', marginBottom: '24px' }}>
                            <Quote size={16} color="#475569" style={{ marginBottom: '8px' }} />
                            <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '14px', fontStyle: 'italic' }}>{lesson.explanation}</p>
                        </div>
                        {step === 'learn' && (
                            <button 
                                onClick={() => setStep('task')}
                                style={{ width: '100%', padding: '14px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                <Play size={16} fill="white" /> Proceed to Technical Task
                            </button>
                        )}
                    </div>

                    {/* Phase 2: Technical Validation */}
                    {(step === 'task' || step === 'simulation' || step === 'result') && (
                        <div style={{ opacity: step === 'task' ? 1 : 0.5, transition: 'opacity 0.3s', padding: '24px', background: 'rgba(0, 212, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#00d4ff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                                <Target size={14} /> Phase 2: Technical Task
                            </div>
                            <p style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, lineHeight: 1.5, marginBottom: '20px' }}>{lesson.chartTasks[0].instruction}</p>
                            
                            {taskSuccess ? (
                                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '8px' }}>
                                    <CheckCircle2 size={18} /> {userFeedback}
                                </div>
                            ) : (
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '13px', color: '#94a3b8', display: 'flex', gap: '10px', lineHeight: 1.5 }}>
                                    <Info size={18} color="#64748b" style={{ flexShrink: 0 }} /> 
                                    <span><strong>Analyst Hint:</strong> {lesson.chartTasks[0].hint}</span>
                                </div>
                            )}

                            {taskSuccess && step === 'task' && (
                                <button 
                                    onClick={() => setStep('simulation')}
                                    style={{ marginTop: '20px', width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Engage Market Simulation
                                </button>
                            )}
                        </div>
                    )}

                    {/* Phase 3: Trade Execution & Analysis */}
                    {(step === 'simulation' || step === 'result') && (
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#fff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                                <BarChart3 size={14} /> Phase 3: Live Execution
                            </div>
                            
                            {step === 'simulation' ? (
                                <>
                                    <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.6 }}>Market is currently testing the identified zone. Institutional flows are shifting. Define your position:</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button onClick={() => handleSimulation('buy')} style={{ padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>BUY (Market Long)</button>
                                        <button onClick={() => handleSimulation('sell')} style={{ padding: '14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>SELL (Market Short)</button>
                                        <button onClick={() => handleSimulation('wait')} style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>NO TRADE (Sidelines)</button>
                                    </div>
                                </>
                            ) : (
                                <div className="fade-in">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontWeight: 800, fontSize: '16px', color: isCorrect ? '#10b981' : '#ef4444' }}>
                                        {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                        {isCorrect ? 'SUCCESSFUL ANALYSIS' : 'LEARNING OPPORTUNITY'}
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Trade Analysis</div>
                                            <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1' }}>{lesson.simulation.feedback.analysis}</p>
                                        </div>
                                        
                                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#00d4ff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                                                <ShieldCheck size={14} /> Correct Approach
                                            </div>
                                            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#e2e8f0' }}>{lesson.simulation.feedback.correctApproach}</p>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Market Reasoning</div>
                                            <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#94a3b8' }}>{lesson.simulation.feedback.reasoning}</p>
                                        </div>
                                    </div>

                                    <button onClick={onBack} style={{ marginTop: '32px', width: '100%', padding: '14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                                        Complete & Continue
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Professional Chart Hub */}
                <div style={{ flex: 1, background: '#07070c', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, pointerEvents: 'none' }}>
                        <div style={{ background: 'rgba(15, 15, 27, 0.9)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Terminal Environment</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>BTC/USDT <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600, marginLeft: '8px' }}>HIKIN-ASHI READOUT</span></div>
                        </div>
                    </div>

                    <div style={{ height: '100%', width: '100%', padding: '40px', paddingTop: '100px' }}>
                        <LearningChart 
                            data={lesson.simulation.snapshotData} 
                            task={step === 'task' ? lesson.chartTasks[0] : undefined}
                            onTaskComplete={handleTaskComplete}
                            showSimulation={showFuture}
                            futureData={lesson.simulation.futureData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
