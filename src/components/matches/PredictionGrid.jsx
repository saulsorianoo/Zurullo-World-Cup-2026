import React from 'react';
import { calcMatchPoints, calcQualifierBonus, getColorClass } from '../../lib/scoring';
import { getTeamById } from '../../data/teams';

export default function PredictionGrid({ predictions, allProfiles, hasResult, realResult, isKnockout, realQualifierId }) {
  const userIds = Object.keys(predictions);
  
  if (userIds.length === 0) {
    return (
      <div className="text-center text-white/30 text-sm py-3">
        Nadie ha pronosticado aún
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {userIds.map(uid => {
        const pred = predictions[uid];
        const userProfile = allProfiles?.[uid];
        const username = userProfile?.username || pred?.username || 'Usuario';
        
        let colorClass = 'cell-pending';
        let points = null;
        
        if (hasResult && realResult && pred.home !== undefined) {
          const { points: pts, color } = calcMatchPoints(
            { home: pred.home, away: pred.away },
            { home: realResult.home, away: realResult.away }
          );
          const bonus = isKnockout ? calcQualifierBonus(pred.qualifierId, realQualifierId) : 0;
          points = pts + bonus;
          colorClass = getColorClass(color);
        }

        return (
          <div
            key={uid}
            className={`rounded-lg p-2.5 border text-center transition-all duration-200 ${colorClass}`}
          >
            <div className="font-semibold text-xs truncate mb-1 opacity-90">
              {username}
            </div>
            {pred.home !== undefined ? (
              <>
                <div className="font-display text-lg leading-tight">
                  {pred.home} - {pred.away}
                </div>
                {isKnockout && pred.qualifierId && (
                  <div className="text-xs mt-1 opacity-70">
                    {getTeamById(pred.qualifierId)?.flag} clasifica
                  </div>
                )}
                {points !== null && (
                  <div className="text-xs font-bold mt-1">
                    {points} pt{points !== 1 ? 's' : ''}
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs opacity-40">Sin pronóstico</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
