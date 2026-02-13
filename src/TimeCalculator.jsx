import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Clock, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Converts "1W 5H 20M" → total minutes
 */
const parseTimeToMinutes = (value) => {
    const regex = /^(?:(\d+)w)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?$/i;
    const match = value.trim().match(regex);

    if (!match) return null;

    const weeks = Number(match[1] || 0);
    const hours = Number(match[2] || 0);
    const minutes = Number(match[3] || 0);

    // Reject empty input like ""
    if (weeks === 0 && hours === 0 && minutes === 0) return null;

    return weeks * 40 * 60 + hours * 60 + minutes;
};



/**
 * Converts total minutes → "XW YH ZM"
 */
const formatMinutes = (totalMinutes) => {
    const weekMinutes = 40 * 60;

    const weeks = Math.floor(totalMinutes / weekMinutes);
    const remainingAfterWeeks = totalMinutes % weekMinutes;

    const hours = Math.floor(remainingAfterWeeks / 60);
    const minutes = remainingAfterWeeks % 60;

    return `${weeks}W ${hours}H ${minutes}M`;
};

export default function JiraTimeCalculator() {
    const [tickets, setTickets] = useState([]);
    const [link, setLink] = useState("");
    const [time, setTime] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const addTicket = () => {
        const minutes = parseTimeToMinutes(time);

        if (!link || !time) {
            setError("All fields are required");
            return;
        }

        if (minutes === null) {
            setError("Invalid format. Examples: 20M, 1H, 1H 30M, 1W 5H 20M");
            return;
        }

        setTickets([...tickets, { link, minutes }]);
        setLink("");
        setTime("");
        setError("");
    };

    const removeTicket = (index) => {
        setTickets(tickets.filter((_, i) => i !== index));
    };

    const totalMinutes = tickets.reduce((sum, t) => sum + t.minutes, 0);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
            >

                <h1 className="text-3xl font-bold text-blue mb-6 flex items-center justify-center gap-3">
                    <Clock className="w-8 h-8" />
                    Jira Time Calculator
                </h1>

                <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <input
                        type="text"
                        placeholder="Jira ticket link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="md:col-span-2 rounded-2xl px-4 py-3 bg-white/20 text-white placeholder-white/60 focus:outline-none"
                    />

                    <input
                        type="text"
                        placeholder="1W 5H 20M"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="rounded-2xl px-4 py-3 bg-white/20 text-white placeholder-white/60 focus:outline-none"
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={addTicket}
                        className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-white/20 hover:bg-white/30 transition shadow-xl"
                    >
                        <PlusCircle className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold">Add Entry</span>
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
                    >
                        <ArrowLeft className="text-white font-semibold" /> Back
                    </button>
                </div>

                <div className="mt-8 space-y-3 max-h-72 overflow-y-auto">
                    {tickets.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/10 rounded-2xl p-4 flex justify-between items-center border border-white/10"
                        >
                            <div>
                                <a
                                    href={t.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-300 underline break-all"
                                >
                                    {t.link}
                                </a>
                                <p className="text-white/80 text-sm mt-1">
                                    Time spent: {formatMinutes(t.minutes)}
                                </p>
                            </div>
                            <button
                                onClick={() => removeTicket(i)}
                                className="p-2 rounded-full hover:bg-white/20"
                            >
                                <Trash2 className="w-5 h-5 text-white" />
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 bg-black rounded-2xl p-6 border border-white/30 text-center">
                    <p className="text-xl text-white">Total time spent</p>
                    <p className="text-xl text-white">
                        {formatMinutes(totalMinutes)}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
