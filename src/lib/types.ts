export type Standing = {
  id: number;
  name: string;
  owner: string;
  total_points: number | string;
};

export type TeamPlayerPoints = {
  team_id: number;
  player_id: number;
  name: string;
  total_points: number | string;
  games: number;
  is_current: boolean;
};

export type Transaction = {
  id: number;
  created_at: string;
  kind: 'free_agent' | 'trade';
  effective_date: string;
  description: string;
};

export type FantasyTeam = {
  id: number;
  name: string;
  owner: string;
};

export type BoxScore = {
  game_date: string;
};

export type Announcement = {
  id: number;
  created_at: string;
  title: string;
  body: string;
  pinned: boolean;
};

export type PlayerGameLog = {
  player_id: number;
  game_id: number;
  game_date: string;
  team_abbr: string;
  min: number | string;
  pts: number | string;
  reb: number | string;
  ast: number | string;
  stl: number | string;
  blk: number | string;
  tov: number | string;
  fg3m: number | string;
  fantasy_points: number | string;
};

export type FreeAgent = {
  player_id: number;
  name: string;
  total_points: number | string;
  games: number;
};

export type Player = {
  player_id: number;
  name: string;
};

export type CurrentRoster = {
  team_id: number;
  player_id: number;
  name: string;
  start_date: string;
};

export type TeamPlayerStats = {
  team_id: number;
  player_id: number;
  name: string;
  is_current: boolean;
  games: number;
  total_points: number | string;
  sum_min: number | string;
  sum_pts: number | string;
  sum_reb: number | string;
  sum_ast: number | string;
  sum_stl: number | string;
  sum_blk: number | string;
  sum_tov: number | string;
  sum_fg3m: number | string;
};