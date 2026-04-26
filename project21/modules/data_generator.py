import pandas as pd
import numpy as np
from typing import Tuple, List, Dict
from dataclasses import dataclass
import random


@dataclass
class Team:
    name: str
    abbreviation: str
    conference: str
    strength: float


@dataclass
class Player:
    name: str
    team: str
    position: str
    overall: float
    three_point_rating: float
    mid_range_rating: float
    paint_rating: float
    defense_rating: float


NBATEAMS = [
    Team("Atlanta Hawks", "ATL", "East", 0.55),
    Team("Boston Celtics", "BOS", "East", 0.70),
    Team("Brooklyn Nets", "BKN", "East", 0.45),
    Team("Charlotte Hornets", "CHA", "East", 0.40),
    Team("Chicago Bulls", "CHI", "East", 0.50),
    Team("Cleveland Cavaliers", "CLE", "East", 0.60),
    Team("Dallas Mavericks", "DAL", "West", 0.55),
    Team("Denver Nuggets", "DEN", "West", 0.65),
    Team("Detroit Pistons", "DET", "East", 0.35),
    Team("Golden State Warriors", "GSW", "West", 0.60),
    Team("Houston Rockets", "HOU", "West", 0.40),
    Team("Indiana Pacers", "IND", "East", 0.50),
    Team("Los Angeles Clippers", "LAC", "West", 0.55),
    Team("Los Angeles Lakers", "LAL", "West", 0.50),
    Team("Memphis Grizzlies", "MEM", "West", 0.50),
    Team("Miami Heat", "MIA", "East", 0.55),
    Team("Milwaukee Bucks", "MIL", "East", 0.65),
    Team("Minnesota Timberwolves", "MIN", "West", 0.55),
    Team("New Orleans Pelicans", "NOP", "West", 0.50),
    Team("New York Knicks", "NYK", "East", 0.50),
    Team("Oklahoma City Thunder", "OKC", "West", 0.45),
    Team("Orlando Magic", "ORL", "East", 0.45),
    Team("Philadelphia 76ers", "PHI", "East", 0.60),
    Team("Phoenix Suns", "PHX", "West", 0.60),
    Team("Portland Trail Blazers", "POR", "West", 0.50),
    Team("Sacramento Kings", "SAC", "West", 0.45),
    Team("San Antonio Spurs", "SAS", "West", 0.40),
    Team("Toronto Raptors", "TOR", "East", 0.50),
    Team("Utah Jazz", "UTA", "West", 0.45),
    Team("Washington Wizards", "WAS", "East", 0.40),
]

FIRST_NAMES = [
    "LeBron", "Stephen", "Kevin", "Giannis", "Nikola", "Luka", "Jayson",
    "Joel", "Devin", "Damian", "Kyrie", "James", "Anthony", "Chris",
    "Paul", "Jimmy", "Donovan", "Trae", "Jaylen", "Bam", "Karl-Anthony",
    "Rudy", "Draymond", "Klay", "Andrew", "Darius", "Jaren", "Desmond",
    "LaMelo", "Tyrese", "Scottie", "Cade", "Evan", "Paolo", "Victor"
]

LAST_NAMES = [
    "James", "Curry", "Durant", "Antetokounmpo", "Jokic", "Doncic", "Tatum",
    "Embiid", "Booker", "Lillard", "Irving", "Harden", "Davis", "Paul",
    "George", "Butler", "Mitchell", "Young", "Brown", "Adebayo", "Towns",
    "Gobert", "Green", "Thompson", "Wiggins", "Garland", "Jackson Jr.", "Bane",
    "Ball", "Haliburton", "Barnes", "Cunningham", "Mobley", "Banchero", "Wembanyama"
]

POSITIONS = ["PG", "SG", "SF", "PF", "C"]


class NBAGenerator:
    def __init__(self, season: int = 2023, random_seed: int = 42):
        self.season = season
        self.random_seed = random_seed
        np.random.seed(random_seed)
        random.seed(random_seed)
        
        self.teams = NBATEAMS.copy()
        self.players = self._generate_players()
        self.games_df = None
        self.shots_df = None
        self.player_stats_df = None
        
    def _generate_players(self) -> List[Player]:
        players = []
        for team in self.teams:
            base_skill = team.strength * 80 + 20
            for i in range(12):
                position = random.choice(POSITIONS)
                name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
                
                three_point = np.random.normal(base_skill, 10)
                mid_range = np.random.normal(base_skill, 8)
                paint = np.random.normal(base_skill, 12)
                defense = np.random.normal(base_skill, 8)
                
                if position == "PG":
                    mid_range += 5
                elif position == "SG":
                    three_point += 8
                elif position == "SF":
                    three_point += 3
                    mid_range += 3
                elif position == "PF":
                    paint += 5
                elif position == "C":
                    paint += 10
                    three_point -= 5
                
                players.append(Player(
                    name=name,
                    team=team.abbreviation,
                    position=position,
                    overall=np.mean([three_point, mid_range, paint, defense]),
                    three_point_rating=np.clip(three_point, 40, 99),
                    mid_range_rating=np.clip(mid_range, 40, 99),
                    paint_rating=np.clip(paint, 40, 99),
                    defense_rating=np.clip(defense, 40, 99)
                ))
        return players
    
    def _get_team_players(self, team_abbr: str) -> List[Player]:
        return [p for p in self.players if p.team == team_abbr]
    
    def _generate_shot_location(self, shot_type: str) -> Tuple[float, float, float]:
        if shot_type == "3PT":
            angle = np.random.uniform(-np.pi/2, np.pi/2)
            distance = np.random.uniform(23, 30)
            x = distance * np.sin(angle)
            y = distance * np.cos(angle)
        elif shot_type == "Mid-Range":
            angle = np.random.uniform(-np.pi/2, np.pi/2)
            distance = np.random.uniform(8, 23)
            x = distance * np.sin(angle)
            y = distance * np.cos(angle)
        else:
            x = np.random.uniform(-8, 8)
            y = np.random.uniform(0, 8)
            distance = np.sqrt(x**2 + y**2)
        
        return x, y, distance
    
    def _calculate_shot_probability(self, shooter: Player, defender: Player, 
                                     shot_type: str, distance: float) -> float:
        base_prob = {
            "3PT": 0.35,
            "Mid-Range": 0.42,
            "Paint": 0.55
        }.get(shot_type, 0.45)
        
        skill_factor = {
            "3PT": shooter.three_point_rating / 100,
            "Mid-Range": shooter.mid_range_rating / 100,
            "Paint": shooter.paint_rating / 100
        }.get(shot_type, 0.6)
        
        defense_factor = (100 - defender.defense_rating) / 100
        
        distance_penalty = max(0, 1 - (distance / 40))
        
        shot_prob = base_prob * skill_factor * (0.7 + 0.3 * defense_factor) * (0.8 + 0.2 * distance_penalty)
        
        return np.clip(shot_prob, 0.15, 0.75)
    
    def _simulate_game(self, home_team: Team, away_team: Team) -> Tuple[Dict, List]:
        home_players = self._get_team_players(home_team.abbreviation)
        away_players = self._get_team_players(away_team.abbreviation)
        
        home_players = sorted(home_players, key=lambda p: p.overall, reverse=True)[:8]
        away_players = sorted(away_players, key=lambda p: p.overall, reverse=True)[:8]
        
        shots = []
        home_score = 0
        away_score = 0
        
        shot_types = ["3PT", "Mid-Range", "Paint"]
        type_weights = [0.35, 0.35, 0.30]
        
        num_shots = np.random.randint(160, 200)
        
        for shot_id in range(num_shots):
            is_home = random.random() < 0.52
            
            if is_home:
                shooter = random.choices(home_players, 
                                         weights=[p.overall/100 for p in home_players])[0]
                defender = random.choice(away_players)
                team = home_team.abbreviation
                opponent = away_team.abbreviation
            else:
                shooter = random.choices(away_players, 
                                         weights=[p.overall/100 for p in away_players])[0]
                defender = random.choice(home_players)
                team = away_team.abbreviation
                opponent = home_team.abbreviation
            
            shot_type = random.choices(shot_types, weights=type_weights)[0]
            x, y, distance = self._generate_shot_location(shot_type)
            
            make_prob = self._calculate_shot_probability(shooter, defender, shot_type, distance)
            made = random.random() < make_prob
            
            points = 3 if shot_type == "3PT" else 2 if made else 0
            
            if made:
                if is_home:
                    home_score += points
                else:
                    away_score += points
            
            shots.append({
                "season": self.season,
                "game_id": f"{self.season}_{home_team.abbreviation}_{away_team.abbreviation}",
                "shot_id": shot_id,
                "team": team,
                "opponent": opponent,
                "shooter": shooter.name,
                "shooter_pos": shooter.position,
                "defender": defender.name,
                "defender_pos": defender.position,
                "shot_type": shot_type,
                "x": round(x, 2),
                "y": round(y, 2),
                "distance": round(distance, 2),
                "made": made,
                "points": points if made else 0,
                "is_home": is_home
            })
        
        home_win = home_score > away_score
        
        game_stats = {
            "season": self.season,
            "game_id": f"{self.season}_{home_team.abbreviation}_{away_team.abbreviation}",
            "home_team": home_team.abbreviation,
            "away_team": away_team.abbreviation,
            "home_score": home_score,
            "away_score": away_score,
            "home_win": home_win,
            "home_field_goal_pct": sum(1 for s in shots if s["team"] == home_team.abbreviation and s["made"]) / 
                                   max(1, sum(1 for s in shots if s["team"] == home_team.abbreviation)),
            "away_field_goal_pct": sum(1 for s in shots if s["team"] == away_team.abbreviation and s["made"]) / 
                                   max(1, sum(1 for s in shots if s["team"] == away_team.abbreviation)),
            "home_three_pct": sum(1 for s in shots if s["team"] == home_team.abbreviation and s["shot_type"] == "3PT" and s["made"]) / 
                              max(1, sum(1 for s in shots if s["team"] == home_team.abbreviation and s["shot_type"] == "3PT")),
            "away_three_pct": sum(1 for s in shots if s["team"] == away_team.abbreviation and s["shot_type"] == "3PT" and s["made"]) / 
                              max(1, sum(1 for s in shots if s["team"] == away_team.abbreviation and s["shot_type"] == "3PT")),
            "total_shots": num_shots
        }
        
        return game_stats, shots
    
    def generate_season(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        print(f"Generating {self.season} season data...")
        
        all_games = []
        all_shots = []
        
        game_count = 0
        total_games = (30 * 82) // 2
        
        for i, home_team in enumerate(self.teams):
            for away_team in self.teams[i+1:]:
                for _ in range(2):
                    game_stats, shots = self._simulate_game(home_team, away_team)
                    all_games.append(game_stats)
                    all_shots.extend(shots)
                    game_count += 1
                    
                    if game_count % 100 == 0:
                        print(f"Generated {game_count}/{total_games} games...")
        
        self.games_df = pd.DataFrame(all_games)
        self.shots_df = pd.DataFrame(all_shots)
        
        print(f"Generated {len(self.games_df)} games and {len(self.shots_df)} shots")
        
        return self.games_df, self.shots_df
    
    def generate_player_stats(self) -> pd.DataFrame:
        if self.shots_df is None:
            raise ValueError("Shots data not generated. Call generate_season() first.")
        
        player_stats = []
        
        for player in self.players:
            player_shots = self.shots_df[self.shots_df["shooter"] == player.name]
            
            if len(player_shots) == 0:
                continue
            
            fga = len(player_shots)
            fgm = player_shots["made"].sum()
            
            three_att = (player_shots["shot_type"] == "3PT").sum()
            three_made = ((player_shots["shot_type"] == "3PT") & player_shots["made"]).sum()
            
            two_att = fga - three_att
            two_made = fgm - three_made
            
            points = player_shots["points"].sum()
            
            fg_pct = fgm / fga if fga > 0 else 0
            three_pct = three_made / three_att if three_att > 0 else 0
            two_pct = two_made / two_att if two_att > 0 else 0
            
            league_avg_ts = 0.56
            ts_pct = points / (2 * (fga + 0.44 * three_att)) if fga > 0 else 0
            
            usg_pct = min(0.35, len(player_shots) / 1000)
            
            per = 15 + (ts_pct - league_avg_ts) * 20 + (usg_pct - 0.20) * 10
            per += (player.overall - 60) * 0.15
            
            efg_pct = (fgm + 0.5 * three_made) / fga if fga > 0 else 0
            
            games_played = player_shots["game_id"].nunique()
            
            paint_shots = player_shots[player_shots["shot_type"] == "Paint"]
            mid_shots = player_shots[player_shots["shot_type"] == "Mid-Range"]
            three_shots = player_shots[player_shots["shot_type"] == "3PT"]
            
            player_stats.append({
                "season": self.season,
                "player": player.name,
                "team": player.team,
                "position": player.position,
                "games_played": games_played,
                "minutes_played": games_played * 25 + np.random.randint(-100, 100),
                "fga": fga,
                "fgm": fgm,
                "fg_pct": round(fg_pct, 3),
                "three_att": three_att,
                "three_made": three_made,
                "three_pct": round(three_pct, 3),
                "two_att": two_att,
                "two_made": two_made,
                "two_pct": round(two_pct, 3),
                "points": points,
                "ppg": round(points / max(1, games_played), 1),
                "ts_pct": round(ts_pct, 3),
                "efg_pct": round(efg_pct, 3),
                "usg_pct": round(usg_pct, 3),
                "per": round(per, 1),
                "paint_attempts": len(paint_shots),
                "paint_makes": paint_shots["made"].sum(),
                "paint_pct": round(paint_shots["made"].mean() if len(paint_shots) > 0 else 0, 3),
                "mid_attempts": len(mid_shots),
                "mid_makes": mid_shots["made"].sum(),
                "mid_pct": round(mid_shots["made"].mean() if len(mid_shots) > 0 else 0, 3),
                "three_attempts": len(three_shots),
                "three_makes": three_shots["made"].sum(),
                "three_pct_detail": round(three_shots["made"].mean() if len(three_shots) > 0 else 0, 3),
                "overall_rating": round(player.overall, 1),
            })
        
        self.player_stats_df = pd.DataFrame(player_stats)
        return self.player_stats_df
    
    def save_all(self, output_dir: str = "."):
        if self.games_df is not None:
            self.games_df.to_csv(f"{output_dir}/games_{self.season}.csv", index=False)
        if self.shots_df is not None:
            self.shots_df.to_csv(f"{output_dir}/shots_{self.season}.csv", index=False)
        if self.player_stats_df is not None:
            self.player_stats_df.to_csv(f"{output_dir}/player_stats_{self.season}.csv", index=False)


def generate_multiple_seasons(start_season: int = 2021, end_season: int = 2023, 
                               output_dir: str = ".") -> Dict[int, Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]]:
    all_data = {}
    
    for season in range(start_season, end_season + 1):
        generator = NBAGenerator(season=season, random_seed=season * 100)
        games_df, shots_df = generator.generate_season()
        player_stats_df = generator.generate_player_stats()
        generator.save_all(output_dir)
        all_data[season] = (games_df, shots_df, player_stats_df)
    
    return all_data


if __name__ == "__main__":
    data = generate_multiple_seasons(start_season=2022, end_season=2024, output_dir="data")
    print("Data generation complete!")
