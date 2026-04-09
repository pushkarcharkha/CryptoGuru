import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Application {
    id: string;
    created_at: string;
    user_id: string;
    full_name: string;
    twitter_handle: string | null;
    telegram_handle: string | null;
    discord_handle: string | null;
    youtube_handle: string | null;
    why_join: string | null;
    trader_applications_status: string;
}

const Applications: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        const { data, error } = await supabase
            .from("trader_applications")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setApplications(data);
        }

        setLoading(false);
    };

    const acceptApplication = async (appId: string, userId: string) => {
        try {
            // Update application status
            const { error: appError } = await supabase
                .from("trader_applications")
                .update({ trader_applications_status: "accepted" })
                .eq("id", appId);

            if (appError) throw appError;

            // Update user verification
            const { error: userError } = await supabase
                .from("user_data")
                .update({ is_verified: true })
                .eq("id", userId);

            if (userError) throw userError;

            alert("Application accepted successfully!");
            fetchApplications();
        } catch (err: any) {
            console.error("Error accepting application:", err);
            alert(`Failed to accept application: ${err.message || "Check console"}`);
        }
    };

    const rejectApplication = async (appId: string) => {
        try {
            await supabase
                .from("trader_applications")
                .update({ trader_applications_status: "rejected" })
                .eq("id", appId);

            alert("Application rejected successfully!");
            fetchApplications();
        } catch (err) {
            console.error(err);
            alert("Failed to reject application. Check console for details.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div
            style={{
                padding: "30px",
                background: "#0f172a",
                minHeight: "100vh",
                color: "white",
            }}
        >
            <h1 style={{ fontSize: "30px", marginBottom: "25px" }}>
                Trader Applications
            </h1>

            {applications
                .filter((app) => app.trader_applications_status === "pending")
                .map((app) => (
                    <div
                        key={app.id}
                        style={{
                            background: "#1e293b",
                            padding: "25px",
                            marginBottom: "20px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <h2>{app.full_name}</h2>

                        <p>Twitter: {app.twitter_handle || "N/A"}</p>
                        <p>Telegram: {app.telegram_handle || "N/A"}</p>
                        <p>Discord: {app.discord_handle || "N/A"}</p>
                        <p>YouTube: {app.youtube_handle || "N/A"}</p>
                        <p>Reason: {app.why_join || "N/A"}</p>
                        <p>Status: {app.trader_applications_status}</p>

                        <div
                            style={{
                                display: "flex",
                                gap: "15px",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                onClick={() =>
                                    acceptApplication(app.id, app.user_id)
                                }
                                style={{
                                    backgroundColor: "#22c55e",
                                    color: "white",
                                    padding: "12px 22px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                }}
                            >
                                Accept
                            </button>

                            <button
                                onClick={() =>
                                    rejectApplication(app.id)
                                }
                                style={{
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    padding: "12px 22px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                }}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                        ))}
        </div>
    );
};

export default Applications;