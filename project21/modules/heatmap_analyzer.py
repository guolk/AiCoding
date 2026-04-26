import pandas as pd
import numpy as np
from typing import Dict, Tuple, Optional, List
from dataclasses import dataclass


@dataclass
class ZoneData:
    zone_name: str
    attempts: int
    makes: int
    fg_pct: float
    avg_distance: float


class HeatmapAnalyzer:
    COURT_ZONES = {
        "Restricted Area": {"x_range": (-4, 4), "y_range": (0, 4)},
        "Paint (Non-RA)": {"x_range": (-8, 8), "y_range": (4, 14), "exclude": "Restricted Area"},
        "Left Short Mid-Range": {"x_range": (-14, -8), "y_range": (4, 14)},
        "Right Short Mid-Range": {"x_range": (8, 14), "y_range": (4, 14)},
        "Left Corner 3PT": {"x_range": (-25, -14), "y_range": (0, 14)},
        "Right Corner 3PT": {"x_range": (14, 25), "y_range": (0, 14)},
        "Left Break 3PT": {"x_range": (-25, -14), "y_range": (14, 30)},
        "Right Break 3PT": {"x_range": (14, 25), "y_range": (14, 30)},
        "Above the Break 3PT": {"x_range": (-14, 14), "y_range": (23, 35)},
        "Left Deep Mid-Range": {"x_range": (-14, -8), "y_range": (14, 23)},
        "Right Deep Mid-Range": {"x_range": (8, 14), "y_range": (14, 23)},
        "Deep 3PT": {"x_range": (-30, 30), "y_range": (30, 45)},
    }
    
    def __init__(self, shots_df: pd.DataFrame):
        self.shots_df = shots_df.copy()
        self.shots_df['x'] = pd.to_numeric(self.shots_df['x'], errors='coerce')
        self.shots_df['y'] = pd.to_numeric(self.shots_df['y'], errors='coerce')
        
    def _is_in_zone(self, x: float, y: float, zone_def: Dict) -> bool:
        x_min, x_max = zone_def['x_range']
        y_min, y_max = zone_def['y_range']
        
        in_bounds = (x_min <= x <= x_max) and (y_min <= y <= y_max)
        
        if 'exclude' in zone_def and zone_def['exclude'] == 'Restricted Area':
            ra_x_min, ra_x_max = self.COURT_ZONES['Restricted Area']['x_range']
            ra_y_min, ra_y_max = self.COURT_ZONES['Restricted Area']['y_range']
            in_ra = (ra_x_min <= x <= ra_x_max) and (ra_y_min <= y <= ra_y_max)
            return in_bounds and not in_ra
        
        return in_bounds
    
    def _assign_zone(self, row: pd.Series) -> str:
        x, y = row['x'], row['y']
        
        for zone_name, zone_def in self.COURT_ZONES.items():
            if self._is_in_zone(x, y, zone_def):
                return zone_name
        
        return "Other"
    
    def analyze_zones(self, team: Optional[str] = None, 
                       player: Optional[str] = None,
                       season: Optional[int] = None) -> Dict[str, ZoneData]:
        filtered = self.shots_df
        
        if team is not None:
            filtered = filtered[filtered['team'] == team]
        if player is not None:
            filtered = filtered[filtered['shooter'] == player]
        if season is not None:
            filtered = filtered[filtered['season'] == season]
        
        if len(filtered) == 0:
            return {}
        
        filtered = filtered.copy()
        filtered['zone'] = filtered.apply(self._assign_zone, axis=1)
        
        zone_stats = {}
        
        for zone_name in self.COURT_ZONES.keys():
            zone_shots = filtered[filtered['zone'] == zone_name]
            
            if len(zone_shots) == 0:
                continue
            
            attempts = len(zone_shots)
            makes = zone_shots['made'].sum()
            fg_pct = makes / attempts if attempts > 0 else 0
            avg_distance = zone_shots['distance'].mean()
            
            zone_stats[zone_name] = ZoneData(
                zone_name=zone_name,
                attempts=attempts,
                makes=makes,
                fg_pct=round(fg_pct, 3),
                avg_distance=round(avg_distance, 2)
            )
        
        return zone_stats
    
    def get_heatmap_data(self, team: Optional[str] = None,
                          player: Optional[str] = None,
                          season: Optional[int] = None,
                          grid_size: int = 30) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        filtered = self.shots_df
        
        if team is not None:
            filtered = filtered[filtered['team'] == team]
        if player is not None:
            filtered = filtered[filtered['shooter'] == player]
        if season is not None:
            filtered = filtered[filtered['season'] == season]
        
        if len(filtered) == 0:
            return np.array([]), np.array([]), np.zeros((grid_size, grid_size))
        
        x = filtered['x'].values
        y = filtered['y'].values
        made = filtered['made'].values.astype(int)
        
        x_bins = np.linspace(-30, 30, grid_size + 1)
        y_bins = np.linspace(0, 45, grid_size + 1)
        
        make_counts = np.zeros((grid_size, grid_size))
        total_counts = np.zeros((grid_size, grid_size))
        
        for xi, yi, mi in zip(x, y, made):
            x_idx = np.clip(np.digitize(xi, x_bins) - 1, 0, grid_size - 1)
            y_idx = np.clip(np.digitize(yi, y_bins) - 1, 0, grid_size - 1)
            
            total_counts[y_idx, x_idx] += 1
            if mi:
                make_counts[y_idx, x_idx] += 1
        
        fg_pct_grid = np.divide(make_counts, total_counts, 
                                 out=np.zeros_like(make_counts), 
                                 where=total_counts > 0)
        
        return x_bins, y_bins, fg_pct_grid, total_counts
    
    def get_team_comparison(self, team1: str, team2: str, 
                             season: Optional[int] = None) -> Dict:
        zones1 = self.analyze_zones(team=team1, season=season)
        zones2 = self.analyze_zones(team=team2, season=season)
        
        comparison = {}
        all_zones = set(zones1.keys()).union(set(zones2.keys()))
        
        for zone in all_zones:
            z1 = zones1.get(zone)
            z2 = zones2.get(zone)
            
            comparison[zone] = {
                team1: {
                    "fg_pct": z1.fg_pct if z1 else 0,
                    "attempts": z1.attempts if z1 else 0,
                    "makes": z1.makes if z1 else 0
                },
                team2: {
                    "fg_pct": z2.fg_pct if z2 else 0,
                    "attempts": z2.attempts if z2 else 0,
                    "makes": z2.makes if z2 else 0
                }
            }
        
        return comparison
    
    def get_shot_distribution_summary(self, team: Optional[str] = None,
                                       season: Optional[int] = None) -> Dict:
        filtered = self.shots_df
        
        if team is not None:
            filtered = filtered[filtered['team'] == team]
        if season is not None:
            filtered = filtered[filtered['season'] == season]
        
        if len(filtered) == 0:
            return {}
        
        total_shots = len(filtered)
        
        shot_type_dist = filtered['shot_type'].value_counts().to_dict()
        
        made_by_type = filtered.groupby('shot_type')['made'].mean()
        attempts_by_type = filtered['shot_type'].value_counts()
        
        return {
            "total_shots": total_shots,
            "shot_type_distribution": {
                st: {
                    "count": int(attempts_by_type.get(st, 0)),
                    "percentage": round(attempts_by_type.get(st, 0) / total_shots * 100, 1),
                    "fg_pct": round(made_by_type.get(st, 0), 3)
                }
                for st in ['Paint', 'Mid-Range', '3PT']
            },
            "overall_fg_pct": round(filtered['made'].mean(), 3),
            "avg_shot_distance": round(filtered['distance'].mean(), 2)
        }
    
    def draw_court_figure(self):
        court_shapes = [
            {"type": "circle", "x0": -6, "y0": -6, "x1": 6, "y1": 6, 
             "xref": "x", "yref": "y", "line_color": "black", "fill_color": "rgba(0,0,0,0)"},
            {"type": "rect", "x0": -8, "y0": 0, "x1": 8, "y1": 19,
             "xref": "x", "yref": "y", "line_color": "black", "fill_color": "rgba(0,0,0,0)"},
            {"type": "rect", "x0": -6, "y0": 0, "x1": 6, "y1": 4,
             "xref": "x", "yref": "y", "line_color": "red", "fill_color": "rgba(255,0,0,0.1)"},
        ]
        
        three_pt_arc_xy = []
        for angle in np.linspace(-np.pi/2, np.pi/2, 50):
            x = 23.75 * np.sin(angle)
            y = 23.75 * np.cos(angle)
            if y > 14:
                three_pt_arc_xy.append((x, y))
        
        three_pt_arc_xy.append((-22, 14))
        three_pt_arc_xy.append((22, 14))
        
        return court_shapes, three_pt_arc_xy
