import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { Feedback } from '../../../services/api';

interface FeedbackQueueProps {
  feedbackQueue: Feedback[];
  onResolveFeedback: (id: string) => void;
}

export const FeedbackQueue: React.FC<FeedbackQueueProps> = ({ feedbackQueue, onResolveFeedback }) => {
  const pendingFeedback = feedbackQueue.filter((f) => f.status === 'pending');

  return (
    <div
      className="rounded-xl border border-border overflow-hidden"
      style={{ background: 'var(--card)' }}
    >
      <div className="border-b border-border px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground">User Feedback Queue</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Triage and review feedback reports submitted by students.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
          {pendingFeedback.length} Pending
        </span>
      </div>

      <div className="divide-y divide-border">
        {feedbackQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs font-semibold text-foreground">Feedback Queue Clear</p>
            <p className="text-[10px] text-muted-foreground mt-1">No user feedback reports have been submitted yet.</p>
          </div>
        ) : pendingFeedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
            <p className="text-xs font-semibold text-foreground">All Feedback Reviewed</p>
            <p className="text-[10px] text-muted-foreground mt-1">All reports are marked reviewed. Good job keeping the queue clean!</p>
          </div>
        ) : (
          pendingFeedback.map((fb) => (
            <div key={fb.id} className="p-4 flex items-start justify-between gap-4 transition-colors hover:bg-white/[0.01]">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{fb.userName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(fb.date).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words">{fb.content}</p>
              </div>
              <button
                onClick={() => onResolveFeedback(fb.id)}
                className="flex-shrink-0 flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
              >
                <Check className="h-3 w-3" />
                Mark Reviewed
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
