import React from 'react';
import { Crown, Medal, Award } from 'lucide-react';

const DEMO_DONORS = [
  { rank: 1, donorName: 'Hotel Taj Mahal Palace', city: 'Mumbai', totalKg: 2840 },
  { rank: 2, donorName: 'Pune Grand Hotel', city: 'Pune', totalKg: 2150 },
  { rank: 3, donorName: 'Nagpur Residency', city: 'Nagpur', totalKg: 1720 },
  { rank: 4, donorName: 'Nashik Valley Resort', city: 'Nashik', totalKg: 1340 },
  { rank: 5, donorName: 'Aurangabad Heritage Inn', city: 'Aurangabad', totalKg: 980 },
  { rank: 6, donorName: 'Kolhapur Palace Hotel', city: 'Kolhapur', totalKg: 760 },
  { rank: 7, donorName: 'Bandra Food Court', city: 'Mumbai', totalKg: 640 },
  { rank: 8, donorName: 'FC Road Dhaba', city: 'Pune', totalKg: 520 },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
}

export default function LeaderboardTable() {
  return (
    <div className="glass-card rounded-2xl border border-primary/20 bg-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-bold text-lg text-foreground">🏆 Top Donors Leaderboard</h3>
        <p className="text-sm text-muted-foreground">Maharashtra's most impactful food donors</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rank</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Donor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">City</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Donated</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_DONORS.map((donor, i) => (
              <tr
                key={donor.rank}
                className={`border-t border-border/50 hover:bg-muted/30 transition-colors ${
                  i < 3 ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center w-8">
                    <RankBadge rank={donor.rank} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${i < 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {donor.donorName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{donor.city}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-bold ${i === 0 ? 'text-primary text-lg' : i < 3 ? 'text-primary' : 'text-foreground'}`}>
                    {donor.totalKg.toLocaleString()} kg
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
