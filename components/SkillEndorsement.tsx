"use client";

import { useState, useEffect } from 'react';
import { ThumbsUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface SkillEndorsementProps {
    skill: string;
    initialCount?: number;
}

export function SkillEndorsement({ skill, initialCount = 0 }: SkillEndorsementProps) {
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [endorsed, setEndorsed] = useState(false);

    useEffect(() => {
        // Check if already endorsed (from localStorage)
        const endorsedSkills = JSON.parse(localStorage.getItem('endorsedSkills') || '[]');
        setEndorsed(endorsedSkills.includes(skill));
    }, [skill]);

    const handleEndorse = async () => {
        if (endorsed || loading) return;

        setLoading(true);

        try {
            const res = await fetch('/api/endorsements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill })
            });

            const data = await res.json();

            if (data.success) {
                setCount(data.data.count);
                setEndorsed(true);

                // Save to localStorage
                const endorsedSkills = JSON.parse(localStorage.getItem('endorsedSkills') || '[]');
                endorsedSkills.push(skill);
                localStorage.setItem('endorsedSkills', JSON.stringify(endorsedSkills));

                toast.success('Thanks for endorsing!');
            } else {
                toast.error(data.message || 'Failed to endorse');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: endorsed ? 1 : 1.05 }}
            whileTap={{ scale: endorsed ? 1 : 0.95 }}
            onClick={handleEndorse}
            disabled={endorsed || loading}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${endorsed
                ? 'bg-primary text-white cursor-default'
                : 'bg-muted/30 hover:bg-primary/10 text-muted-foreground hover:text-primary'
                }`}
        >
            {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <ThumbsUp className={`h-3 w-3 ${endorsed ? 'fill-current' : ''}`} />
            )}
            <span>{count}</span>
        </motion.button>
    );
}

interface SkillsWithEndorsementsProps {
    skills: { name: string; level: number }[];
}

export function SkillsWithEndorsements({ skills }: SkillsWithEndorsementsProps) {
    const [endorsements, setEndorsements] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEndorsements() {
            try {
                const res = await fetch('/api/endorsements');
                const data = await res.json();
                if (data.success) {
                    setEndorsements(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch endorsements', error);
            } finally {
                setLoading(false);
            }
        }
        fetchEndorsements();
    }, []);

    if (loading) {
        return <div>Loading skills...</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill, i) => (
                <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-lg border border-primary/20 bg-card/40"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{skill.name}</h3>
                        <SkillEndorsement
                            skill={skill.name}
                            initialCount={endorsements[skill.name] || 0}
                        />
                    </div>

                    {/* Skill level bar */}
                    <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                            style={{ width: `${skill.level}%` }}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                        {skill.level}%
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
