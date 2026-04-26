import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class EfficiencyTier(Enum):
    ELITE = "Elite"
    VERY_GOOD = "Very Good"
    GOOD = "Good"
    AVERAGE = "Average"
    BELOW_AVERAGE = "Below Average"
    POOR = "Poor"


@dataclass
class PlayerEfficiency:
    player: str
    team: str
    position: str
    games_played: int
    
    points: float
    ppg: float
    
    fga: int
    fgm: int
    fg_pct: float
    
    three_att: int
    three_made: int
    three_pct: float
    
    ts_pct: float
    efg_pct: float
    usg_pct: float
    per: float
    
    paint_pct: float
    mid_pct: float
    three_pct_detail: float
    
    overall_rating: float
    efficiency_tier: EfficiencyTier
    
    efficiency_rank: int
    per_rank: int
    ts_pct_rank: int


class PlayerEfficiencyAnalyzer:
    LEAGUE_AVERAGES = {
        "ts_pct": 0.560,
        "efg_pct": 0.530,
        "usg_pct": 0.200,
        "per": 15.0,
        "fg_pct": 0.460,
        "three_pct": 0.355,
    }
    
    TIER_THRESHOLDS = {
        "per": {
            EfficiencyTier.ELITE: 25.0,
            EfficiencyTier.VERY_GOOD: 20.0,
            EfficiencyTier.GOOD: 17.0,
            EfficiencyTier.AVERAGE: 13.0,
            EfficiencyTier.BELOW_AVERAGE: 10.0,
        },
        "ts_pct": {
            EfficiencyTier.ELITE: 0.620,
            EfficiencyTier.VERY_GOOD: 0.580,
            EfficiencyTier.GOOD: 0.550,
            EfficiencyTier.AVERAGE: 0.520,
            EfficiencyTier.BELOW_AVERAGE: 0.490,
        },
        "efg_pct": {
            EfficiencyTier.ELITE: 0.580,
            EfficiencyTier.VERY_GOOD: 0.540,
            EfficiencyTier.GOOD: 0.510,
            EfficiencyTier.AVERAGE: 0.480,
            EfficiencyTier.BELOW_AVERAGE: 0.450,
        }
    }
    
    def __init__(self, player_stats_df: pd.DataFrame):
        self.player_stats_df = player_stats_df.copy()
        self._preprocess_data()
    
    def _preprocess_data(self):
        numeric_cols = ['ts_pct', 'efg_pct', 'usg_pct', 'per', 'fg_pct', 
                        'three_pct', 'ppg', 'overall_rating']
        for col in numeric_cols:
            if col in self.player_stats_df.columns:
                self.player_stats_df[col] = pd.to_numeric(
                    self.player_stats_df[col], errors='coerce'
                )
        
        self.player_stats_df = self.player_stats_df[
            self.player_stats_df['games_played'] >= 10
        ].copy()
    
    def _calculate_tier(self, per: float, ts_pct: float, efg_pct: float) -> EfficiencyTier:
        per_tier = self._get_tier_from_value(per, "per")
        ts_tier = self._get_tier_from_value(ts_pct, "ts_pct")
        efg_tier = self._get_tier_from_value(efg_pct, "efg_pct")
        
        tiers = [per_tier, ts_tier, efg_tier]
        
        tier_order = [
            EfficiencyTier.ELITE, EfficiencyTier.VERY_GOOD, EfficiencyTier.GOOD,
            EfficiencyTier.AVERAGE, EfficiencyTier.BELOW_AVERAGE, EfficiencyTier.POOR
        ]
        
        tier_counts = {t: tiers.count(t) for t in tier_order}
        
        for tier in tier_order:
            if tier_counts[tier] >= 2:
                return tier
            elif tier_counts[tier] >= 1 and tier_counts.get(tier_order[tier_order.index(tier)+1] if tier_order.index(tier)+1 < len(tier_order) else None, 0) >= 1:
                return tier
        
        return max(tiers, key=lambda t: tier_order.index(t))
    
    def _get_tier_from_value(self, value: float, metric: str) -> EfficiencyTier:
        thresholds = self.TIER_THRESHOLDS.get(metric, self.TIER_THRESHOLDS["per"])
        
        if pd.isna(value):
            return EfficiencyTier.AVERAGE
        
        if value >= thresholds[EfficiencyTier.ELITE]:
            return EfficiencyTier.ELITE
        elif value >= thresholds[EfficiencyTier.VERY_GOOD]:
            return EfficiencyTier.VERY_GOOD
        elif value >= thresholds[EfficiencyTier.GOOD]:
            return EfficiencyTier.GOOD
        elif value >= thresholds[EfficiencyTier.AVERAGE]:
            return EfficiencyTier.AVERAGE
        elif value >= thresholds[EfficiencyTier.BELOW_AVERAGE]:
            return EfficiencyTier.BELOW_AVERAGE
        else:
            return EfficiencyTier.POOR
    
    def get_player_efficiency(self, player_name: str, 
                               season: Optional[int] = None) -> Optional[PlayerEfficiency]:
        filtered = self.player_stats_df[self.player_stats_df['player'] == player_name]
        
        if season is not None:
            filtered = filtered[filtered['season'] == season]
        
        if len(filtered) == 0:
            return None
        
        row = filtered.iloc[0]
        
        efficiency_tier = self._calculate_tier(row['per'], row['ts_pct'], row['efg_pct'])
        
        season_df = self.player_stats_df[
            (self.player_stats_df['season'] == row['season']) &
            (self.player_stats_df['games_played'] >= 20)
        ]
        
        eff_rank = (season_df['per'] >= row['per']).sum()
        per_rank = (season_df['per'] >= row['per']).sum()
        ts_rank = (season_df['ts_pct'] >= row['ts_pct']).sum()
        
        return PlayerEfficiency(
            player=row['player'],
            team=row['team'],
            position=row['position'],
            games_played=row['games_played'],
            points=row['points'],
            ppg=row['ppg'],
            fga=row['fga'],
            fgm=row['fgm'],
            fg_pct=row['fg_pct'],
            three_att=row['three_att'],
            three_made=row['three_made'],
            three_pct=row['three_pct'],
            ts_pct=row['ts_pct'],
            efg_pct=row['efg_pct'],
            usg_pct=row['usg_pct'],
            per=row['per'],
            paint_pct=row['paint_pct'],
            mid_pct=row['mid_pct'],
            three_pct_detail=row['three_pct_detail'],
            overall_rating=row['overall_rating'],
            efficiency_tier=efficiency_tier,
            efficiency_rank=eff_rank,
            per_rank=per_rank,
            ts_pct_rank=ts_rank
        )
    
    def get_team_players_efficiency(self, team: str, 
                                     season: Optional[int] = None,
                                     min_games: int = 10) -> List[PlayerEfficiency]:
        filtered = self.player_stats_df[self.player_stats_df['team'] == team]
        
        if season is not None:
            filtered = filtered[filtered['season'] == season]
        
        filtered = filtered[filtered['games_played'] >= min_games]
        
        efficiencies = []
        for _, row in filtered.iterrows():
            efficiency = self.get_player_efficiency(row['player'], season)
            if efficiency:
                efficiencies.append(efficiency)
        
        return sorted(efficiencies, key=lambda x: x.per, reverse=True)
    
    def get_leaders(self, metric: str = 'per', 
                    season: Optional[int] = None,
                    top_n: int = 10,
                    min_games: int = 20) -> pd.DataFrame:
        filtered = self.player_stats_df[
            self.player_stats_df['games_played'] >= min_games
        ]
        
        if season is not None:
            filtered = filtered[filtered['season'] == season]
        
        if metric not in filtered.columns:
            metric = 'per'
        
        sorted_df = filtered.sort_values(by=metric, ascending=False).head(top_n)
        
        return sorted_df[[
            'player', 'team', 'position', 'games_played',
            'ppg', 'fg_pct', 'three_pct', 'ts_pct', 'efg_pct', 'per', 'usg_pct'
        ]]
    
    def compare_players(self, player_names: List[str], 
                        season: Optional[int] = None) -> Dict:
        comparison = {}
        
        for name in player_names:
            eff = self.get_player_efficiency(name, season)
            if eff:
                comparison[name] = {
                    "team": eff.team,
                    "position": eff.position,
                    "ppg": eff.ppg,
                    "fg_pct": eff.fg_pct,
                    "three_pct": eff.three_pct,
                    "ts_pct": eff.ts_pct,
                    "efg_pct": eff.efg_pct,
                    "per": eff.per,
                    "usg_pct": eff.usg_pct,
                    "efficiency_tier": eff.efficiency_tier.value,
                    "paint_pct": eff.paint_pct,
                    "mid_pct": eff.mid_pct,
                    "three_pct_detail": eff.three_pct_detail,
                }
        
        return comparison
    
    def get_radar_chart_data(self, player_name: str, 
                              season: Optional[int] = None) -> Optional[Dict]:
        eff = self.get_player_efficiency(player_name, season)
        
        if not eff:
            return None
        
        league_avg = self.LEAGUE_AVERAGES
        
        metrics = {
            "Scoring (PPG)": min(100, eff.ppg / 35 * 100),
            "True Shooting %": min(100, eff.ts_pct / league_avg['ts_pct'] * 100),
            "Effective FG%": min(100, eff.efg_pct / league_avg['efg_pct'] * 100),
            "Usage Rate": min(100, eff.usg_pct / 0.35 * 100),
            "PER": min(100, eff.per / 30 * 100),
            "3PT Efficiency": min(100, eff.three_pct / league_avg['three_pct'] * 100),
        }
        
        paint_score = eff.paint_pct / 0.65 * 100 if eff.paint_pct > 0 else 50
        mid_score = eff.mid_pct / 0.45 * 100 if eff.mid_pct > 0 else 50
        three_score = eff.three_pct_detail / 0.40 * 100 if eff.three_pct_detail > 0 else 50
        
        zone_scores = {
            "Paint": paint_score,
            "Mid-Range": mid_score,
            "3PT": three_score,
        }
        
        return {
            "player": eff.player,
            "team": eff.team,
            "position": eff.position,
            "efficiency_tier": eff.efficiency_tier.value,
            "overall_metrics": metrics,
            "zone_scores": zone_scores,
            "raw_values": {
                "ppg": eff.ppg,
                "ts_pct": eff.ts_pct,
                "efg_pct": eff.efg_pct,
                "usg_pct": eff.usg_pct,
                "per": eff.per,
                "three_pct": eff.three_pct,
            }
        }
    
    def get_team_efficiency_summary(self, team: str, 
                                     season: Optional[int] = None) -> Dict:
        players = self.get_team_players_efficiency(team, season)
        
        if not players:
            return {}
        
        tiers_count = {}
        for p in players:
            tier = p.efficiency_tier.value
            tiers_count[tier] = tiers_count.get(tier, 0) + 1
        
        avg_per = np.mean([p.per for p in players])
        avg_ts_pct = np.mean([p.ts_pct for p in players])
        avg_ppg = np.mean([p.ppg for p in players])
        
        top_player = players[0] if players else None
        
        return {
            "team": team,
            "num_qualified_players": len(players),
            "efficiency_tier_distribution": tiers_count,
            "average_per": round(avg_per, 2),
            "average_ts_pct": round(avg_ts_pct, 3),
            "average_ppg": round(avg_ppg, 1),
            "top_player": top_player.player if top_player else None,
            "top_player_per": top_player.per if top_player else None,
        }
    
    def get_all_teams_summary(self, season: Optional[int] = None) -> pd.DataFrame:
        teams = self.player_stats_df['team'].unique()
        
        team_data = []
        for team in teams:
            summary = self.get_team_efficiency_summary(team, season)
            if summary:
                team_data.append(summary)
        
        return pd.DataFrame(team_data).sort_values('average_per', ascending=False)
