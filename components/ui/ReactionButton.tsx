import React, { useState, useRef } from 'react';
import { ThumbsUp, Rocket, Brain, Star, AlertTriangle, Heart } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { ReactionPicker } from './ReactionPicker';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { Button } from './Shared';

interface ReactionButtonProps {
    post: Post;
    currentUser: any;
    onReactionUpdate: (newReactions: Record<ReactionType, number>, userReaction: ReactionType | null) => void;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({ post, currentUser, onReactionUpdate }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const { showToast } = useToast();

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (!isLoading) setIsHovering(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsHovering(false);
        }, 500);
    };

    // Mapping icons for display button
    const getReactionIcon = (type: ReactionType) => {
        switch (type) {
            case 'LIKE': return <ThumbsUp size={16} className="text-blue-400" />;
            case 'ROCKET': return <Rocket size={16} className="text-orange-500" />;
            case 'INTEL': return <Brain size={16} className="text-purple-400" />;
            case 'STAR': return <Star size={16} className="text-yellow-400" />;
            case 'WARNING': return <AlertTriangle size={16} className="text-red-500" />;
            default: return <Heart size={16} className="text-space-muted" />;
        }
    };

    const handleReactionSelect = async (type: ReactionType) => {
        if (!currentUser) {
            showToast("Faça login para reagir.", "error");
            return;
        }

        setIsLoading(true);
        // Optimistic Update
        const oldUserReaction = post.userReaction;
        const oldReactions = { ...post.reactions };

        // Calculate new optimistic state
        const newReactions = { ...post.reactions };

        // If unreacting (clicking same type)
        if (oldUserReaction === type) {
            newReactions[type] = Math.max(0, (newReactions[type] || 0) - 1);
            onReactionUpdate(newReactions, null);
        } else {
            // Remove old reaction if exists
            if (oldUserReaction) {
                newReactions[oldUserReaction] = Math.max(0, (newReactions[oldUserReaction] || 0) - 1);
            }
            // Add new reaction
            newReactions[type] = (newReactions[type] || 0) + 1;
            onReactionUpdate(newReactions, type);
        }

        setIsHovering(false); // Close picker immediately

        try {
            // If checking same type, it's a removal
            if (oldUserReaction === type) {
                const { error } = await supabase
                    .from('post_reactions')
                    .delete()
                    .eq('post_id', post.id)
                    .eq('user_id', currentUser.id);
                if (error) throw error;
            } else {
                // Upsert handles both insert new and update existing due to UNIQUE constraint
                const { error } = await supabase
                    .from('post_reactions')
                    .upsert({
                        post_id: post.id,
                        user_id: currentUser.id,
                        reaction_type: type
                    }, { onConflict: 'post_reactions_post_id_user_id_key' });
                if (error) throw error;
            }
        } catch (error: any) {
            console.error("Error updating reaction:", error);
            showToast("Erro ao reagir. Tente novamente.", "error");
            // Revert state
            onReactionUpdate(oldReactions as Record<ReactionType, number>, oldUserReaction as ReactionType);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate total reactions for display
    const totalReactions = post.reactions
        ? Object.values(post.reactions).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0)
        : (post.likes || 0);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {isHovering && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 z-50"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <ReactionPicker
                        onSelect={handleReactionSelect}
                        currentReaction={post.userReaction || undefined}
                    />
                </div>
            )}

            <Button
                variant="ghost"
                size="sm"
                className={`gap-2 transition-colors duration-300 ${post.userReaction ? 'bg-space-dark border border-space-neon/20' : 'text-space-muted hover:text-white'}`}
                onClick={() => !post.userReaction ? handleReactionSelect('LIKE') : handleReactionSelect(post.userReaction)} // Default click is LIKE or Remove
            >
                {post.userReaction ? getReactionIcon(post.userReaction) : <ThumbsUp size={16} />}
                <span className="font-mono text-xs">
                    {totalReactions > 0 ? totalReactions : 'Reagir'}
                </span>
            </Button>
        </div>
    );
};
