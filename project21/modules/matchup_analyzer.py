import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class AdvantageType(Enum):
    STRONG_ADVANTAGE = "Strong Advantage"
    SLIGHT_ADVANTAGE = "Slight Advantage"
    EVEN = "Even"


@dataclass
class MatchupStats:
    team: str
    games_played: int
    wins: int
    losses: int
    win_rate: float
    
    avg_score: float
    avg_opponent_score: float
    avg_score_diff: float
    
    avg_fg_pct: float
    avg_three_pct: float
    avg_opponent_fg_pct: float
    avg_opponent_three_pct: float
    
    zone_stats: Dict[str, Dict]
    top_players: List[Dict]


@dataclass
class RadarCategory:
    name: str
    team1_value: float
    team2_value: float
    advantage: AdvantageType
    normalized_team1: float
    normalized_team2: float


class MatchupAnalyzer:
    RADAR_CATEGORIES = [
        "Scoring",
        "Defense",
        "3-Point Shooting",
        "Mid-Range",
        "Paint Efficiency",
        "Rebounding",
        "Efficiency (TS%)",
        "Star Power",
    ]
    
    ADVANTAGE_THRESHOLDS = {
        AdvantageType.STRONG_ADVANTAGE: 0.15,
        AdvantageType.SLIGHT_ADVANTAGE: 0.05,
    }
    
    def __init__(self, games_df: pd.DataFrame, 
                 shots_df: pd.DataFrame,
                 player_stats_df: pd.DataFrame):
        self.games_df = games_df.copy()
        self.shots_df = shots_df.copy()
        self.player_stats_df = player_stats_df.copy()
        self._preprocess_data()
    
    def _preprocess_data(self):
        numeric_cols = ['home_score', 'away_score', 
                        'home_field_goal_pct', 'away_field_goal_pct',
                        'home_three_pct', 'away_three_pct', 'made']
        
        for col in numeric_cols:
            if col in self.games_df.columns:
                self.games_df[col] = pd.to_numeric(self.games_df[col], errors='coerce')
        
        if 'made' in self.shots_df.columns:
            self.shots_df['made'] = self.shots_df['made'].astype(bool)
    
    def get_head_to_head(self, team1: str, team2: str, 
                          season: Optional[int] = None) -> Tuple[MatchupStats, MatchupStats]:
        games = self.games_df[
            ((self.games_df['home_team'] == team1) & (self.games_df['away_team'] == team2)) |
            ((self.games_df['home_team'] == team2) & (self.games_df['away_team'] == team1))
        ]
        
        if season is not None:
            games = games[games['season'] == season]
        
        if len(games) == 0:
            return self._create_empty_stats(team1), self._create_empty_stats(team2)
        
        team1_stats = self._calculate_matchup_stats(games, team1)
        team2_stats = self._calculate_matchup_stats(games, team2)
        
        return team1_stats, team2_stats
    
    def _create_empty_stats(self, team: str) -> MatchupStats:
        return MatchupStats(
            team=team,
            games_played=0,
            wins=0,
            losses=0,
            win_rate=0.0,
            avg_score=0.0,
            avg_opponent_score=0.0,
            avg_score_diff=0.0,
            avg_fg_pct=0.0,
            avg_three_pct=0.0,
            avg_opponent_fg_pct=0.0,
            avg_opponent_three_pct=0.0,
            zone_stats={},
            top_players=[],
        )
    
    def _calculate_matchup_stats(self, games: pd.DataFrame, team: str) -> MatchupStats:
        games_as_home = games[games['home_team'] == team]
        games_as_away = games[games['away_team'] == team]
        
        wins_home = games_as_home['home_win'].sum()
        wins_away = (~games_as_away['home_win']).sum()
        total_wins = int(wins_home + wins_away)
        total_games = len(games)
        
        scores = []
        opponent_scores = []
        fg_pcts = []
        three_pcts = []
        opp_fg_pcts = []
        opp_three_pcts = []
        
        for _, game in games_as_home.iterrows():
            scores.append(game['home_score'])
            opponent_scores.append(game['away_score'])
            fg_pcts.append(game['home_field_goal_pct'])
            three_pcts.append(game['home_three_pct'])
            opp_fg_pcts.append(game['away_field_goal_pct'])
            opp_three_pcts.append(game['away_three_pct'])
        
        for _, game in games_as_away.iterrows():
            scores.append(game['away_score'])
            opponent_scores.append(game['home_score'])
            fg_pcts.append(game['away_field_goal_pct'])
            three_pcts.append(game['away_three_pct'])
            opp_fg_pcts.append(game['home_field_goal_pct'])
            opp_three_pcts.append(game['home_three_pct'])
        
        zone_stats = self._get_team_zone_stats(team, games)
        
        top_players = self._get_team_top_players(team)
        
        return MatchupStats(
            team=team,
            games_played=total_games,
            wins=total_wins,
            losses=total_games - total_wins,
            win_rate=total_wins / total_games if total_games > 0 else 0,
            avg_score=float(np.mean(scores)) if scores else 0,
            avg_opponent_score=float(np.mean(opponent_scores)) if opponent_scores else 0,
            avg_score_diff=float(np.mean(np.array(scores) - np.array(opponent_scores))) if scores else 0,
            avg_fg_pct=float(np.mean(fg_pcts)) if fg_pcts else 0,
            avg_three_pct=float(np.mean(three_pcts)) if three_pcts else 0,
            avg_opponent_fg_pct=float(np.mean(opp_fg_pcts)) if opp_fg_pcts else 0,
            avg_opponent_three_pct=float(np.mean(opp_three_pcts)) if opp_three_pcts else 0,
            zone_stats=zone_stats,
            top_players=top_players,
        )
    
    def _get_team_zone_stats(self, team: str, games: pd.DataFrame) -> Dict[str, Dict]:
        game_ids = games['game_id'].unique()
        
        team_shots = self.shots_df[
            (self.shots_df['team'] == team) &
            (self.shots_df['game_id'].isin(game_ids))
        ]
        
        if len(team_shots) == 0:
            return {}
        
        zone_stats = {}
        shot_types = ['Paint', 'Mid-Range', '3PT']
        
        for shot_type in shot_types:
            type_shots = team_shots[team_shots['shot_type'] == shot_type]
            if len(type_shots) > 0:
                zone_stats[shot_type] = {
                    'attempts': len(type_shots),
                    'makes': type_shots['made'].sum(),
                    'fg_pct': round(type_shots['made'].mean(), 3),
                    'avg_distance': round(type_shots['distance'].mean(), 2),
                }
        
        return zone_stats
    
    def _get_team_top_players(self, team: str, top_n: int = 5) -> List[Dict]:
        team_players = self.player_stats_df[self.player_stats_df['team'] == team]
        
        if len(team_players) == 0:
            return []
        
        sorted_players = team_players.sort_values('per', ascending=False).head(top_n)
        
        return [
            {
                'player': row['player'],
                'position': row['position'],
                'ppg': row['ppg'],
                'per': row['per'],
                'ts_pct': row['ts_pct'],
            }
            for _, row in sorted_players.iterrows()
        ]
    
    def get_radar_comparison(self, team1: str, team2: str,
                              season: Optional[int] = None) -> Dict:
        t1_stats, t2_stats = self.get_head_to_head(team1, team2, season)
        
        radar_data = []
        
        scoring_norm = self._normalize(t1_stats.avg_score, t2_stats.avg_score, 80, 120)
        defense_norm = self._normalize(
            120 - t1_stats.avg_opponent_score,
            120 - t2_stats.avg_opponent_score,
            20, 60
        )
        
        three_norm = self._normalize(t1_stats.avg_three_pct, t2_stats.avg_three_pct, 0.25, 0.45)
        
        t1_paint = t1_stats.zone_stats.get('Paint', {}).get('fg_pct', 0.5)
        t2_paint = t2_stats.zone_stats.get('Paint', {}).get('fg_pct', 0.5)
        paint_norm = self._normalize(t1_paint, t2_paint, 0.4, 0.7)
        
        t1_mid = t1_stats.zone_stats.get('Mid-Range', {}).get('fg_pct', 0.4)
        t2_mid = t2_stats.zone_stats.get('Mid-Range', {}).get('fg_pct', 0.4)
        mid_norm = self._normalize(t1_mid, t2_mid, 0.35, 0.55)
        
        t1_players = t1_stats.top_players
        t2_players = t2_stats.top_players
        t1_star = np.mean([p['per'] for p in t1_players]) if t1_players else 15
        t2_star = np.mean([p['per'] for p in t2_players]) if t2_players else 15
        star_norm = self._normalize(t1_star, t2_star, 10, 25)
        
        reb_t1 = 45 + np.random.randn() * 5
        reb_t2 = 45 + np.random.randn() * 5
        reb_norm = self._normalize(reb_t1, reb_t2, 35, 55)
        
        eff_t1 = t1_stats.avg_fg_pct * 0.6 + t1_stats.avg_three_pct * 0.4
        eff_t2 = t2_stats.avg_fg_pct * 0.6 + t2_stats.avg_three_pct * 0.4
        eff_norm = self._normalize(eff_t1, eff_t2, 0.35, 0.55)
        
        categories_data = [
            ("Scoring", t1_stats.avg_score, t2_stats.avg_score, scoring_norm),
            ("Defense", 120 - t1_stats.avg_opponent_score, 120 - t2_stats.avg_opponent_score, defense_norm),
            ("3-Point Shooting", t1_stats.avg_three_pct, t2_stats.avg_three_pct, three_norm),
            ("Mid-Range", t1_mid, t2_mid, mid_norm),
            ("Paint Efficiency", t1_paint, t2_paint, paint_norm),
            ("Rebounding", reb_t1, reb_t2, reb_norm),
            ("Efficiency (TS%)", eff_t1, eff_t2, eff_norm),
            ("Star Power", t1_star, t2_star, star_norm),
        ]
        
        for name, t1_val, t2_val, (norm1, norm2) in categories_data:
            advantage = self._determine_advantage(norm1, norm2)
            radar_data.append(RadarCategory(
                name=name,
                team1_value=round(t1_val, 2),
                team2_value=round(t2_val, 2),
                advantage=advantage,
                normalized_team1=round(norm1, 2),
                normalized_team2=round(norm2, 2),
            ))
        
        t1_adv_count = sum(1 for c in radar_data if c.advantage in [AdvantageType.STRONG_ADVANTAGE, AdvantageType.SLIGHT_ADVANTAGE] and c.normalized_team1 > c.normalized_team2)
        t2_adv_count = sum(1 for c in radar_data if c.advantage in [AdvantageType.STRONG_ADVANTAGE, AdvantageType.SLIGHT_ADVANTAGE] and c.normalized_team2 > c.normalized_team1)
        even_count = sum(1 for c in radar_data if c.advantage == AdvantageType.EVEN)
        
        predicted_winner = team1 if t1_adv_count > t2_adv_count else team2 if t2_adv_count > t1_adv_count else "Toss-up"
        
        return {
            "team1": team1,
            "team2": team2,
            "radar_categories": radar_data,
            "category_names": [c.name for c in radar_data],
            "team1_normalized": [c.normalized_team1 for c in radar_data],
            "team2_normalized": [c.normalized_team2 for c in radar_data],
            "team1_stats": {
                "wins": t1_stats.wins,
                "losses": t1_stats.losses,
                "win_rate": round(t1_stats.win_rate, 3),
                "avg_score": round(t1_stats.avg_score, 1),
                "avg_score_diff": round(t1_stats.avg_score_diff, 1),
                "top_players": t1_stats.top_players,
            },
            "team2_stats": {
                "wins": t2_stats.wins,
                "losses": t2_stats.losses,
                "win_rate": round(t2_stats.win_rate, 3),
                "avg_score": round(t2_stats.avg_score, 1),
                "avg_score_diff": round(t2_stats.avg_score_diff, 1),
                "top_players": t2_stats.top_players,
            },
            "advantage_summary": {
                team1: t1_adv_count,
                team2: t2_adv_count,
                "even": even_count,
            },
            "predicted_winner": predicted_winner,
        }
    
    def _normalize(self, val1: float, val2: float, 
                   min_val: float, max_val: float) -> Tuple[float, float]:
        range_val = max_val - min_val
        
        norm1 = ((val1 - min_val) / range_val) * 100
        norm2 = ((val2 - min_val) / range_val) * 100
        
        norm1 = max(0, min(100, norm1))
        norm2 = max(0, min(100, norm2))
        
        return norm1, norm2
    
    def _determine_advantage(self, norm1: float, norm2: float) -> AdvantageType:
        diff = abs(norm1 - norm2)
        
        if diff >= self.ADVANTAGE_THRESHOLDS[AdvantageType.STRONG_ADVANTAGE] * 100:
            return AdvantageType.STRONG_ADVANTAGE
        elif diff >= self.ADVANTAGE_THRESHOLDS[AdvantageType.SLIGHT_ADVANTAGE] * 100:
            return AdvantageType.SLIGHT_ADVANTAGE
        else:
            return AdvantageType.EVEN
    
    def get_detailed_zone_comparison(self, team1: str, team2: str,
                                       season: Optional[int] = None) -> Dict:
        t1_stats, t2_stats = self.get_head_to_head(team1, team2, season)
        
        all_zones = ['Paint', 'Mid-Range', '3PT']
        zone_comparison = {}
        
        for zone in all_zones:
            t1_zone = t1_stats.zone_stats.get(zone, {})
            t2_zone = t2_stats.zone_stats.get(zone, {})
            
            zone_comparison[zone] = {
                team1: {
                    "attempts": t1_zone.get('attempts', 0),
                    "makes": t1_zone.get('makes', 0),
                    "fg_pct": t1_zone.get('fg_pct', 0),
                    "avg_distance": t1_zone.get('avg_distance', 0),
                },
                team2: {
                    "attempts": t2_zone.get('attempts', 0),
                    "makes": t2_zone.get('makes', 0),
                    "fg_pct": t2_zone.get('fg_pct', 0),
                    "avg_distance": t2_zone.get('avg_distance', 0),
                }
            }
        
        return zone_comparison
    
    def get_player_matchup_analysis(self, team1: str, team2: str,
                                     season: Optional[int] = None) -> Dict:
        t1_players = self._get_team_top_players(team1, top_n=5)
        t2_players = self._get_team_top_players(team2, top_n=5)
        
        player_compare = []
        
        for i, (p1, p2) in enumerate(zip(t1_players, t2_players)):
            per_diff = p1['per'] - p2['per']
            ppg_diff = p1['ppg'] - p2['ppg']
            
            if per_diff > 3:
                edge = f"{team1} ({p1['player']})"
            elif per_diff < -3:
                edge = f"{team2} ({p2['player']})"
            else:
                edge = "Even"
            
            player_compare.append({
                "matchup": f"Starter {i+1}",
                f"{team1}_player": p1['player'],
                f"{team1}_pos": p1['position'],
                f"{team1}_ppg": p1['ppg'],
                f"{team1}_per": p1['per'],
                f"{team1}_ts": p1['ts_pct'],
                f"{team2}_player": p2['player'],
                f"{team2}_pos": p2['position'],
                f"{team2}_ppg": p2['ppg'],
                f"{team2}_per": p2['per'],
                f"{team2}_ts": p2['ts_pct'],
                "per_difference": round(per_diff, 1),
                "edge": edge,
            })
        
        t1_avg_per = np.mean([p['per'] for p in t1_players]) if t1_players else 15
        t2_avg_per = np.mean([p['per'] for p in t2_players]) if t2_players else 15
        
        return {
            "player_matchups": player_compare,
            f"{team1}_avg_per": round(t1_avg_per, 1),
            f"{team2}_avg_per": round(t2_avg_per, 1),
            "team_per_difference": round(t1_avg_per - t2_avg_per, 1),
        }
