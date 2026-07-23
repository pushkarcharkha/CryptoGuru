import React, { useState } from 'react';
import type { ChangeEvent, FormEvent, CSSProperties } from 'react';
import { supabase, getUserSafe } from '../lib/supabase';

interface ApplicationFormData {
    fullName: string;
    twitter: string;
    telegram: string;
    discord: string;
    youtube: string;
    reason: string;
}

const TraderApplicationForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ApplicationFormData>({
        fullName: '',
        twitter: '',
        telegram: '',
        discord: '',
        youtube: '',
        reason: '',
    });

    const [error, setError] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when the user starts typing in the required field
        if (name === 'fullName' && value.trim() !== '') {
            setError('');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.fullName.trim()) {
            setError("Full Name is required to process your application.");
            return;
        }

        try {
            setLoading(true);

            // Get logged in user
            const {
                data: { user },
                error: userError
            } = await getUserSafe();

            if (userError || !user) {
                throw new Error("User not authenticated");
            }

            // Insert into trader_applications table
            const { error: insertError } = await supabase
                .from("trader_applications")
                .insert([
                    {
                        user_id: user.id,
                        full_name: formData.fullName,
                        twitter_handle: formData.twitter,
                        telegram_handle: formData.telegram,
                        discord_handle: formData.discord,
                        youtube_handle: formData.youtube,
                        why_join: formData.reason,
                        trader_applications_status: "pending"
                    }
                ]);

            if (insertError) {
                throw insertError;
            }

            setIsSubmitted(true);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // --- Styled Components Logic ---

    const inputStyle: CSSProperties = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        borderRadius: '8px',
        color: '#e2e8f0',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s ease',
    };

    const labelStyle: CSSProperties = {
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: '#cbd5e1',
        marginBottom: '8px',
        fontFamily: 'Space Grotesk, sans-serif',
    };

    if (isSubmitted) {
        return (
            <div style={{
                flex: 1, height: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#0f172a', padding: '24px'
            }}>
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                    <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#e2e8f0' }}>Application Received</h2>
                    <p style={{ color: '#94a3b8', marginTop: '12px', lineHeight: 1.6 }}>
                        Thank you, {formData.fullName}. Our team will manually review your profile and handles. We'll contact you via the provided social channels soon.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            marginTop: '24px', padding: '10px 24px', background: 'rgba(0, 212, 255, 0.1)',
                            border: '1px solid #00d4ff', borderRadius: '8px', color: '#00d4ff', cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            flex: 1, minHeight: '100vh', background: '#0f172a',
            padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            overflowY: 'auto'
        }}>
            <div style={{ maxWidth: '650px', width: '100%' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <h1 style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                        fontSize: '32px', color: '#e2e8f0', marginBottom: '8px'
                    }}>
                        Apply for Signal Program
                    </h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8' }}>
                        Submit your application to become a verified trader and share your signals with the community.
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-card" style={{
                    padding: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(12px)'
                }}>
                    <form onSubmit={handleSubmit}>

                        {/* Full Name */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Full Name <span style={{ color: '#ff3366' }}>*</span></label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                style={{
                                    ...inputStyle,
                                    borderColor: error ? '#ff3366' : 'rgba(255, 255, 255, 0.1)'
                                }}
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                            {error && <p style={{ color: '#ff3366', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
                        </div>

                        {/* Social Media Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>Twitter/X Handle</label>
                                <input
                                    type="text"
                                    name="twitter"
                                    placeholder="@yourtwitter"
                                    style={inputStyle}
                                    value={formData.twitter}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Telegram Handle</label>
                                <input
                                    type="text"
                                    name="telegram"
                                    placeholder="@yourtelegram"
                                    style={inputStyle}
                                    value={formData.telegram}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>Discord Handle</label>
                                <input
                                    type="text"
                                    name="discord"
                                    placeholder="Your Discord username"
                                    style={inputStyle}
                                    value={formData.discord}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>YouTube Handle / Channel</label>
                                <input
                                    type="text"
                                    name="youtube"
                                    placeholder="Your YouTube link/channel"
                                    style={inputStyle}
                                    value={formData.youtube}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Why Join */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Why do you want to join?</label>
                            <textarea
                                name="reason"
                                placeholder="Tell us why you want to become a verified trader..."
                                rows={4}
                                style={{ ...inputStyle, resize: 'none' }}
                                value={formData.reason}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Info Note */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            marginBottom: '24px', padding: '12px', background: 'rgba(139, 92, 246, 0.05)',
                            borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.1)'
                        }}>
                            <span style={{ fontSize: '14px' }}>ℹ️</span>
                            <p style={{ fontSize: '12px', color: '#a78bfa', margin: 0 }}>
                                Applications are manually reviewed by our team before approval.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#ffffff',
                                fontSize: '15px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, opacity 0.2s ease',
                                fontFamily: 'Inter, sans-serif'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {loading ? "Submitting..." : "Submit Application"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TraderApplicationForm;