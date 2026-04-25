# -*- coding: utf-8 -*-
import pygame
import random
import copy
import os
import sys

pygame.init()

SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 800
FPS = 60

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (128, 128, 128)
LIGHT_GRAY = (200, 200, 200)
RED = (255, 80, 80)
GREEN = (80, 200, 80)
BLUE = (80, 150, 255)
GOLD = (255, 215, 0)
DARK_BLUE = (15, 25, 50)
DARK_GREEN = (10, 50, 30)
DARK_RED = (60, 10, 10)
ORANGE = (255, 165, 0)
PURPLE = (180, 100, 220)

screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("回合制卡牌对战游戏")
clock = pygame.time.Clock()

CARD_WIDTH = 140
CARD_HEIGHT = 200
MAX_HAND_SIZE = 5
MAX_ENERGY = 3

class FontManager:
    def __init__(self):
        self.fonts = {}
        self.chinese_font_paths = [
            "C:/Windows/Fonts/msyh.ttc",
            "C:/Windows/Fonts/simhei.ttf",
            "C:/Windows/Fonts/simsun.ttc",
            "C:/Windows/Fonts/msyhbd.ttc",
        ]
        self.chinese_font = None
        
        for font_path in self.chinese_font_paths:
            if os.path.exists(font_path):
                try:
                    self.chinese_font = font_path
                    break
                except:
                    continue
        
        if self.chinese_font is None:
            print("警告: 未找到中文字体，中文可能无法显示")
    
    def get_font(self, size):
        if size in self.fonts:
            return self.fonts[size]
        
        try:
            if self.chinese_font:
                font = pygame.font.Font(self.chinese_font, size)
            else:
                font = pygame.font.Font(None, size)
        except:
            font = pygame.font.Font(None, size)
        
        self.fonts[size] = font
        return font
    
    def render(self, text, size, color, bold=False):
        font = self.get_font(size)
        if bold and self.chinese_font:
            try:
                bold_path = self.chinese_font.replace("msyh.ttc", "msyhbd.ttc")
                if os.path.exists(bold_path):
                    font = pygame.font.Font(bold_path, size)
            except:
                pass
        
        try:
            return font.render(text, True, color)
        except:
            return font.render(str(text), True, color)

font_manager = FontManager()

class CardType:
    ATTACK = "attack"
    DEFENSE = "defense"
    SKILL = "skill"

class Card:
    def __init__(self, card_id, name, card_type, cost, value, description, special=None):
        self.id = card_id
        self.name = name
        self.type = card_type
        self.cost = cost
        self.value = value
        self.description = description
        self.special = special or {}
        self.rect = pygame.Rect(0, 0, CARD_WIDTH, CARD_HEIGHT)
        self.selected = False

    def get_color(self):
        if self.type == CardType.ATTACK:
            return (180, 40, 40)
        elif self.type == CardType.DEFENSE:
            return (40, 80, 160)
        elif self.type == CardType.SKILL:
            return (40, 120, 80)
        return GRAY

    def get_border_color(self):
        if self.type == CardType.ATTACK:
            return (255, 100, 100)
        elif self.type == CardType.DEFENSE:
            return (100, 180, 255)
        elif self.type == CardType.SKILL:
            return (100, 220, 140)
        return WHITE

    def get_type_name(self):
        if self.type == CardType.ATTACK:
            return "攻击"
        elif self.type == CardType.DEFENSE:
            return "防御"
        elif self.type == CardType.SKILL:
            return "技能"
        return "未知"

    def is_piercing(self):
        return self.special.get("piercing", False)

    def is_heal(self):
        return self.special.get("heal", False)

    def is_draw(self):
        return self.special.get("draw", False)

    def get_draw_count(self):
        return self.special.get("draw_count", 0)

    def is_energy_boost(self):
        return self.special.get("energy_boost", False)

    def get_energy_boost(self):
        return self.special.get("energy_boost_count", 0)

    def draw(self, surface, x, y, enlarged=False, show_cost=True, can_play=True):
        if enlarged:
            w, h = CARD_WIDTH * 1.3, CARD_HEIGHT * 1.3
        else:
            w, h = CARD_WIDTH, CARD_HEIGHT
        
        self.rect = pygame.Rect(x, y, w, h)
        
        pygame.draw.rect(surface, self.get_color(), self.rect, border_radius=12)
        border_width = 4 if self.selected else 2
        pygame.draw.rect(surface, GOLD if self.selected else self.get_border_color(), self.rect, border_width, border_radius=12)
        
        if not can_play:
            overlay = pygame.Surface((int(w), int(h)), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 120))
            surface.blit(overlay, (x, y))
        
        title_size = 22 if enlarged else 18
        text_size = 18 if enlarged else 14
        
        name_surf = font_manager.render(self.name, title_size, WHITE, bold=True)
        name_rect = name_surf.get_rect(centerx=x + w/2, y=y + 15)
        surface.blit(name_surf, name_rect)
        
        type_color = (255, 180, 180) if self.type == CardType.ATTACK else \
                     (180, 220, 255) if self.type == CardType.DEFENSE else \
                     (180, 255, 200)
        type_surf = font_manager.render(self.get_type_name(), text_size, type_color)
        type_rect = type_surf.get_rect(centerx=x + w/2, y=y + 50)
        surface.blit(type_surf, type_rect)
        
        icon_y = y + 75
        icon_size = int(w * 0.6)
        icon_x = x + (w - icon_size) / 2
        
        if self.type == CardType.ATTACK:
            pygame.draw.polygon(surface, (255, 150, 150), 
                [(icon_x + icon_size/2, icon_y), 
                 (icon_x + icon_size, icon_y + icon_size/2),
                 (icon_x + icon_size/2, icon_y + icon_size),
                 (icon_x, icon_y + icon_size/2)])
        elif self.type == CardType.DEFENSE:
            pygame.draw.rect(surface, (150, 200, 255), 
                (icon_x, icon_y, icon_size, icon_size), border_radius=8)
        else:
            pygame.draw.circle(surface, (150, 255, 180), 
                (int(icon_x + icon_size/2), int(icon_y + icon_size/2)), int(icon_size/2))
        
        if show_cost:
            cost_bg = pygame.Rect(x + w - 35, y + 5, 30, 30)
            pygame.draw.ellipse(surface, GOLD, cost_bg)
            pygame.draw.ellipse(surface, (180, 150, 0), cost_bg, 2)
            cost_surf = font_manager.render(str(self.cost), 18, BLACK, bold=True)
            cost_rect = cost_surf.get_rect(centerx=cost_bg.centerx, centery=cost_bg.centery)
            surface.blit(cost_surf, cost_rect)
        
        value_y = y + h - 50
        if self.type == CardType.ATTACK:
            value_text = f"伤害: {self.value}"
        elif self.type == CardType.DEFENSE:
            value_text = f"护盾: {self.value}"
        else:
            if self.is_heal():
                value_text = f"治疗: {self.value}"
            else:
                value_text = f"效果: {self.value}"
        
        value_surf = font_manager.render(value_text, text_size, WHITE)
        value_rect = value_surf.get_rect(centerx=x + w/2, y=value_y)
        surface.blit(value_surf, value_rect)
        
        special_y = value_y + 20
        special_texts = []
        if self.is_piercing():
            special_texts.append("穿透")
        if self.is_draw():
            special_texts.append(f"抽{self.get_draw_count()}")
        if self.is_energy_boost():
            special_texts.append(f"+{self.get_energy_boost()}能量")
        
        if special_texts:
            special_surf = font_manager.render(" ".join(special_texts), 12, GOLD)
            special_rect = special_surf.get_rect(centerx=x + w/2, y=special_y)
            surface.blit(special_surf, special_rect)

CARD_TEMPLATES = [
    {"id": 1, "name": "普通攻击", "type": CardType.ATTACK, "cost": 1, "value": 5, "desc": "造成5点伤害"},
    {"id": 2, "name": "重击", "type": CardType.ATTACK, "cost": 2, "value": 10, "desc": "造成10点伤害"},
    {"id": 3, "name": "穿透斩", "type": CardType.ATTACK, "cost": 2, "value": 6, "desc": "造成6点穿透伤害，无视护盾", "special": {"piercing": True}},
    {"id": 4, "name": "连斩", "type": CardType.ATTACK, "cost": 1, "value": 3, "desc": "造成3点伤害并抽1张牌", "special": {"draw": True, "draw_count": 1}},
    {"id": 5, "name": "基本防御", "type": CardType.DEFENSE, "cost": 1, "value": 5, "desc": "获得5点护盾"},
    {"id": 6, "name": "铁壁", "type": CardType.DEFENSE, "cost": 2, "value": 12, "desc": "获得12点护盾"},
    {"id": 7, "name": "反击姿态", "type": CardType.DEFENSE, "cost": 2, "value": 6, "desc": "获得6护盾并抽1张", "special": {"draw": True, "draw_count": 1}},
    {"id": 8, "name": "治疗术", "type": CardType.SKILL, "cost": 2, "value": 8, "desc": "恢复8点生命值", "special": {"heal": True}},
    {"id": 9, "name": "能量涌流", "type": CardType.SKILL, "cost": 0, "value": 0, "desc": "获得2点能量", "special": {"energy_boost": True, "energy_boost_count": 2}},
    {"id": 10, "name": "战术抽卡", "type": CardType.SKILL, "cost": 1, "value": 0, "desc": "抽2张牌", "special": {"draw": True, "draw_count": 2}},
    {"id": 11, "name": "狂怒一击", "type": CardType.ATTACK, "cost": 3, "value": 15, "desc": "造成15点伤害"},
    {"id": 12, "name": "生命汲取", "type": CardType.SKILL, "cost": 2, "value": 4, "desc": "造成4伤害并治疗等量", "special": {"lifesteal": True}},
]

def create_deck():
    deck = []
    card_ids = [1, 1, 1, 2, 2, 3, 4, 5, 5, 5, 6, 7, 8, 9, 10]
    for cid in card_ids:
        template = [t for t in CARD_TEMPLATES if t["id"] == cid][0]
        card = Card(
            card_id=template["id"],
            name=template["name"],
            card_type=template["type"],
            cost=template["cost"],
            value=template["value"],
            description=template["desc"],
            special=template.get("special", {})
        )
        deck.append(card)
    random.shuffle(deck)
    return deck

class Player:
    def __init__(self, name, is_ai=False):
        self.name = name
        self.is_ai = is_ai
        self.health = 30
        self.max_health = 30
        self.shield = 0
        self.energy = MAX_ENERGY
        self.max_energy = MAX_ENERGY
        self.deck = create_deck()
        self.hand = []
        self.discard = []

    def draw_cards(self, count=3):
        drawn = []
        for _ in range(count):
            if len(self.hand) >= MAX_HAND_SIZE:
                break
            if not self.deck:
                self.deck = self.discard
                self.discard = []
                random.shuffle(self.deck)
            if self.deck:
                card = self.deck.pop()
                self.hand.append(card)
                drawn.append(card)
        return drawn

    def start_turn(self):
        self.energy = self.max_energy
        self.shield = 0
        self.draw_cards(3)

    def can_play_card(self, card):
        return self.energy >= card.cost and card in self.hand

    def play_card(self, card, target):
        if not self.can_play_card(card):
            return False, None
        
        self.energy -= card.cost
        self.hand.remove(card)
        self.discard.append(card)
        
        action_log = {
            "player": self.name,
            "card_name": card.name,
            "card_type": card.type,
            "value": card.value,
            "special": copy.deepcopy(card.special),
            "effects": []
        }
        
        if card.type == CardType.ATTACK:
            damage = card.value
            actual_damage = damage
            if card.is_piercing():
                target.health = max(0, target.health - damage)
                action_log["effects"].append({"type": "piercing_damage", "value": damage})
            else:
                if target.shield > 0:
                    shield_absorbed = min(target.shield, damage)
                    target.shield -= shield_absorbed
                    actual_damage = damage - shield_absorbed
                    if shield_absorbed > 0:
                        action_log["effects"].append({"type": "shield_absorbed", "value": shield_absorbed})
                if actual_damage > 0:
                    target.health = max(0, target.health - actual_damage)
                    action_log["effects"].append({"type": "damage", "value": actual_damage})
            
            if card.special.get("lifesteal", False):
                heal_amount = damage
                self.health = min(self.max_health, self.health + heal_amount)
                action_log["effects"].append({"type": "lifesteal_heal", "value": heal_amount})
        
        elif card.type == CardType.DEFENSE:
            self.shield += card.value
            action_log["effects"].append({"type": "shield_gain", "value": card.value})
        
        elif card.type == CardType.SKILL:
            if card.is_heal():
                heal_amount = card.value
                self.health = min(self.max_health, self.health + heal_amount)
                action_log["effects"].append({"type": "heal", "value": heal_amount})
            
            if card.special.get("lifesteal", False):
                damage = card.value
                actual_damage = damage
                if target.shield > 0:
                    shield_absorbed = min(target.shield, damage)
                    target.shield -= shield_absorbed
                    actual_damage = damage - shield_absorbed
                    if shield_absorbed > 0:
                        action_log["effects"].append({"type": "shield_absorbed", "value": shield_absorbed})
                if actual_damage > 0:
                    target.health = max(0, target.health - actual_damage)
                    action_log["effects"].append({"type": "damage", "value": actual_damage})
                
                heal_amount = damage
                self.health = min(self.max_health, self.health + heal_amount)
                action_log["effects"].append({"type": "lifesteal_heal", "value": heal_amount})
        
        if card.is_energy_boost():
            boost = card.get_energy_boost()
            self.energy += boost
            action_log["effects"].append({"type": "energy_boost", "value": boost})
        
        if card.is_draw():
            draw_count = card.get_draw_count()
            drawn_cards = self.draw_cards(draw_count)
            action_log["effects"].append({"type": "draw", "value": len(drawn_cards)})
        
        return True, action_log

class AIStrategy:
    @staticmethod
    def select_card(ai_player, human_player):
        playable_cards = [c for c in ai_player.hand if ai_player.can_play_card(c)]
        if not playable_cards:
            return None
        
        health_ratio = ai_player.health / ai_player.max_health
        target_health_ratio = human_player.health / human_player.max_health
        
        if health_ratio < 0.4:
            heal_cards = [c for c in playable_cards if c.is_heal() or c.type == CardType.DEFENSE]
            if heal_cards:
                return sorted(heal_cards, key=lambda x: x.value, reverse=True)[0]
        
        if ai_player.energy < 2:
            energy_cards = [c for c in playable_cards if c.is_energy_boost()]
            if energy_cards:
                return energy_cards[0]
        
        if human_player.shield > 0:
            piercing_cards = [c for c in playable_cards if c.type == CardType.ATTACK and c.is_piercing()]
            if piercing_cards:
                return sorted(piercing_cards, key=lambda x: x.value, reverse=True)[0]
        
        attack_cards = [c for c in playable_cards if c.type == CardType.ATTACK]
        if attack_cards:
            return sorted(attack_cards, key=lambda x: x.value / (x.cost + 0.1), reverse=True)[0]
        
        defense_cards = [c for c in playable_cards if c.type == CardType.DEFENSE]
        if defense_cards:
            return sorted(defense_cards, key=lambda x: x.value, reverse=True)[0]
        
        return playable_cards[0]

    @staticmethod
    def play_turn(ai_player, human_player):
        actions = []
        while True:
            card = AIStrategy.select_card(ai_player, human_player)
            if card is None:
                break
            success, log = ai_player.play_card(card, human_player)
            if success and log:
                actions.append(log)
        return actions

class GameState:
    PLAYER_TURN = "player_turn"
    AI_TURN = "ai_turn"
    GAME_OVER = "game_over"
    REPLAY = "replay"

class BattleLog:
    def __init__(self):
        self.turn_logs = []
        self.current_turn = 0
    
    def start_new_turn(self, turn_number, is_player_turn):
        self.current_turn = turn_number
        self.turn_logs.append({
            "turn_number": turn_number,
            "is_player_turn": is_player_turn,
            "actions": [],
            "player_state": None,
            "ai_state": None
        })
    
    def add_action(self, action_log):
        if self.turn_logs:
            self.turn_logs[-1]["actions"].append(action_log)
    
    def record_states(self, player, ai):
        if self.turn_logs:
            self.turn_logs[-1]["player_state"] = {
                "health": player.health,
                "shield": player.shield,
                "energy": player.energy
            }
            self.turn_logs[-1]["ai_state"] = {
                "health": ai.health,
                "shield": ai.shield,
                "energy": ai.energy
            }
    
    def get_all_logs(self):
        return copy.deepcopy(self.turn_logs)

class ReplayPlayer:
    def __init__(self, battle_logs):
        self.logs = battle_logs
        self.current_log_index = -1
        self.paused = False
        self.speed = 1.0
        self.timer = 0
        self.delay_per_action = 2.5
    
    def start(self):
        self.current_log_index = 0
        self.timer = 0
    
    def update(self, dt):
        if self.paused or self.is_finished():
            return
        
        self.timer += dt * self.speed
        if self.timer >= self.delay_per_action:
            self.timer = 0
            self.current_log_index += 1
    
    def is_finished(self):
        return self.current_log_index >= len(self.logs)
    
    def get_current_log(self):
        if 0 <= self.current_log_index < len(self.logs):
            return self.logs[self.current_log_index]
        return None
    
    def next(self):
        if not self.is_finished():
            self.current_log_index += 1
            self.timer = 0
    
    def prev(self):
        if self.current_log_index > 0:
            self.current_log_index -= 1
            self.timer = 0

class Button:
    def __init__(self, x, y, width, height, text, color, hover_color, text_color=WHITE):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.hover_color = hover_color
        self.text_color = text_color
        self.is_hovered = False
    
    def update(self, mouse_pos):
        self.is_hovered = self.rect.collidepoint(mouse_pos)
    
    def draw(self, surface):
        current_color = self.hover_color if self.is_hovered else self.color
        pygame.draw.rect(surface, current_color, self.rect, border_radius=15)
        pygame.draw.rect(surface, WHITE, self.rect, 3, border_radius=15)
        
        text_surf = font_manager.render(self.text, 22, self.text_color, bold=True)
        text_rect = text_surf.get_rect(center=self.rect.center)
        surface.blit(text_surf, text_rect)
    
    def is_clicked(self, mouse_pos, mouse_pressed):
        return self.rect.collidepoint(mouse_pos) and mouse_pressed

class Game:
    def __init__(self):
        self.state = GameState.PLAYER_TURN
        self.turn_number = 1
        self.player = Player("玩家", is_ai=False)
        self.ai = Player("AI", is_ai=True)
        self.battle_log = BattleLog()
        self.replay_player = None
        self.winner = None
        self.hovered_card = None
        self.selected_card = None
        self.message = ""
        self.message_timer = 0
        self.ai_playing = False
        self.ai_action_timer = 0
        self.ai_actions = []
        self.ai_action_index = 0
        
        self.end_turn_button = Button(
            SCREEN_WIDTH - 180, SCREEN_HEIGHT - 100, 
            150, 60, "结束回合",
            (50, 150, 50), (80, 200, 80)
        )
        
        self.replay_button = Button(
            SCREEN_WIDTH//2 - 180, SCREEN_HEIGHT//2 + 80,
            150, 50, "观看回放 (P)",
            (50, 100, 180), (80, 150, 220)
        )
        
        self.restart_button = Button(
            SCREEN_WIDTH//2 + 30, SCREEN_HEIGHT//2 + 80,
            150, 50, "重新开始 (R)",
            (180, 80, 50), (220, 120, 80)
        )
        
        self.player.start_turn()
        self.ai.start_turn()
        self.battle_log.start_new_turn(self.turn_number, is_player_turn=True)
        self.battle_log.record_states(self.player, self.ai)
        self.show_message("游戏开始！点击卡牌选中，再点击一次打出")
    
    def show_message(self, msg):
        self.message = msg
        self.message_timer = 4.0
    
    def update(self, dt):
        if self.message_timer > 0:
            self.message_timer -= dt
            if self.message_timer <= 0:
                self.message = ""
        
        mouse_pos = pygame.mouse.get_pos()
        if self.state == GameState.PLAYER_TURN:
            self.end_turn_button.update(mouse_pos)
        
        if self.state == GameState.GAME_OVER:
            self.replay_button.update(mouse_pos)
            self.restart_button.update(mouse_pos)
        
        if self.state == GameState.AI_TURN and self.ai_playing:
            self.ai_action_timer += dt
            if self.ai_action_timer >= 2.0:
                self.ai_action_timer = 0
                if self.ai_action_index < len(self.ai_actions):
                    action = self.ai_actions[self.ai_action_index]
                    self.battle_log.add_action(action)
                    self.ai_action_index += 1
                    card_name = action["card_name"]
                    self.show_message(f"AI 打出: {card_name}")
                    
                    if self.player.health <= 0 or self.ai.health <= 0:
                        self.end_game()
                        return
                else:
                    self.end_ai_turn()
        
        if self.state == GameState.REPLAY and self.replay_player:
            self.replay_player.update(dt)
    
    def play_player_card(self, card):
        if self.state != GameState.PLAYER_TURN:
            return False
        
        if not self.player.can_play_card(card):
            self.show_message(f"能量不足！需要 {card.cost} 点能量")
            return False
        
        success, log = self.player.play_card(card, self.ai)
        if success and log:
            self.battle_log.add_action(log)
            self.battle_log.record_states(self.player, self.ai)
            
            effects_text = []
            for effect in log["effects"]:
                if effect["type"] == "damage":
                    effects_text.append(f"造成{effect['value']}点伤害")
                elif effect["type"] == "piercing_damage":
                    effects_text.append(f"穿透{effect['value']}点伤害")
                elif effect["type"] == "shield_gain":
                    effects_text.append(f"获得{effect['value']}护盾")
                elif effect["type"] == "heal":
                    effects_text.append(f"恢复{effect['value']}生命")
                elif effect["type"] == "draw":
                    effects_text.append(f"抽{effect['value']}张牌")
            
            effect_str = "，".join(effects_text) if effects_text else ""
            self.show_message(f"你打出: {log['card_name']} {effect_str}")
            self.selected_card = None
            
            if self.ai.health <= 0 or self.player.health <= 0:
                self.end_game()
                return True
        
        return success
    
    def end_player_turn(self):
        if self.state != GameState.PLAYER_TURN:
            return
        
        self.state = GameState.AI_TURN
        self.ai_playing = True
        self.ai_action_index = 0
        self.selected_card = None
        
        for card in self.player.hand:
            self.player.discard.append(card)
        self.player.hand = []
        
        self.ai.start_turn()
        self.battle_log.start_new_turn(self.turn_number, is_player_turn=False)
        
        self.ai_actions = AIStrategy.play_turn(self.ai, self.player)
        self.battle_log.record_states(self.player, self.ai)
        
        if not self.ai_actions:
            self.show_message("AI 无法打出任何卡牌，跳过回合")
        else:
            self.show_message("AI 回合开始...")
    
    def end_ai_turn(self):
        self.ai_playing = False
        
        for card in self.ai.hand:
            self.ai.discard.append(card)
        self.ai.hand = []
        
        self.turn_number += 1
        self.state = GameState.PLAYER_TURN
        self.player.start_turn()
        self.battle_log.start_new_turn(self.turn_number, is_player_turn=True)
        self.battle_log.record_states(self.player, self.ai)
        self.show_message(f"回合 {self.turn_number} - 你的回合")
    
    def end_game(self):
        self.state = GameState.GAME_OVER
        if self.player.health <= 0:
            self.winner = "AI"
        else:
            self.winner = "玩家"
        self.show_message(f"游戏结束! {self.winner} 获胜!")
    
    def start_replay(self):
        self.replay_player = ReplayPlayer(self.battle_log.get_all_logs())
        self.replay_player.start()
        self.state = GameState.REPLAY
        self.show_message("开始回放 - 空格暂停/继续，←→翻页，ESC退出")
    
    def handle_click(self, pos):
        if self.state == GameState.REPLAY:
            return
        
        if self.state == GameState.GAME_OVER:
            if self.replay_button.rect.collidepoint(pos):
                self.start_replay()
                return
            if self.restart_button.rect.collidepoint(pos):
                return True
            return False
        
        if self.state == GameState.PLAYER_TURN:
            if self.end_turn_button.rect.collidepoint(pos):
                self.end_player_turn()
                return False
            
            for card in self.player.hand:
                if card.rect.collidepoint(pos):
                    if self.selected_card == card:
                        self.play_player_card(card)
                    else:
                        self.selected_card = card
                    return False
        
        return False
    
    def handle_key(self, key):
        if self.state == GameState.REPLAY:
            if key == pygame.K_SPACE:
                if self.replay_player:
                    self.replay_player.paused = not self.replay_player.paused
                    if self.replay_player.paused:
                        self.show_message("回放已暂停")
                    else:
                        self.show_message("回放继续")
            elif key == pygame.K_RIGHT:
                if self.replay_player:
                    self.replay_player.next()
            elif key == pygame.K_LEFT:
                if self.replay_player:
                    self.replay_player.prev()
            elif key == pygame.K_ESCAPE:
                self.state = GameState.GAME_OVER
                self.show_message("已退出回放")
        
        if self.state == GameState.GAME_OVER:
            if key == pygame.K_r:
                return True
            if key == pygame.K_p:
                self.start_replay()
        
        return False
    
    def draw(self, surface):
        bg_gradient = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        for y in range(SCREEN_HEIGHT):
            progress = y / SCREEN_HEIGHT
            r = int(20 + progress * 30)
            g = int(30 + progress * 20)
            b = int(60 + progress * 40)
            pygame.draw.line(bg_gradient, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        surface.blit(bg_gradient, (0, 0))
        
        self._draw_decorations(surface)
        
        ai_stats_y = 40
        self._draw_player_stats(surface, self.ai, SCREEN_WIDTH // 2, ai_stats_y, is_ai=True)
        
        self._draw_ai_hand(surface)
        
        divider_y = 360
        pygame.draw.line(surface, GOLD, (80, divider_y), (SCREEN_WIDTH - 80, divider_y), 3)
        
        turn_text = f"第 {self.turn_number} 回合"
        if self.state == GameState.PLAYER_TURN:
            turn_text += " - 你的回合"
        elif self.state == GameState.AI_TURN:
            turn_text += " - AI回合"
        elif self.state == GameState.REPLAY:
            turn_text = "【回放模式】"
        elif self.state == GameState.GAME_OVER:
            turn_text = f"游戏结束 - {self.winner}获胜!"
        
        turn_surf = font_manager.render(turn_text, 28, GOLD, bold=True)
        turn_rect = turn_surf.get_rect(centerx=SCREEN_WIDTH // 2, y=divider_y - 35)
        
        turn_bg = pygame.Rect(
            turn_rect.x - 20, 
            turn_rect.y - 10, 
            turn_rect.width + 40, 
            turn_rect.height + 20
        )
        pygame.draw.rect(surface, DARK_BLUE, turn_bg, border_radius=10)
        pygame.draw.rect(surface, GOLD, turn_bg, 2, border_radius=10)
        surface.blit(turn_surf, turn_rect)
        
        if self.state == GameState.PLAYER_TURN:
            hint_text = "点击卡牌选中，再点击一次打出 | 或点击【结束回合】"
            hint_surf = font_manager.render(hint_text, 16, LIGHT_GRAY)
            hint_rect = hint_surf.get_rect(centerx=SCREEN_WIDTH//2, y=divider_y + 20)
            surface.blit(hint_surf, hint_rect)
        
        player_stats_x = 60
        player_stats_y = divider_y + 25
        self._draw_player_stats(surface, self.player, player_stats_x, player_stats_y, is_ai=False, compact=True)
        
        self._draw_player_hand(surface)
        
        if self.state == GameState.PLAYER_TURN:
            self.end_turn_button.draw(surface)
        
        if self.state == GameState.GAME_OVER:
            self._draw_game_over(surface)
        
        if self.state == GameState.REPLAY:
            self._draw_replay_controls(surface)
        
        if self.message:
            self._draw_message(surface)
        
        if self.hovered_card:
            self._draw_card_tooltip(surface)
    
    def _draw_decorations(self, surface):
        for i in range(4):
            x = 150 + i * 300
            y = SCREEN_HEIGHT // 4
            pygame.draw.circle(surface, (40, 70, 120), (x, y), 60, 3)
        
        for i in range(4):
            x = 200 + i * 280
            y = SCREEN_HEIGHT * 3 // 4
            pygame.draw.circle(surface, (30, 100, 70), (x, y), 50, 2)
    
    def _draw_player_stats(self, surface, player, x, y, is_ai=False, compact=False):
        name_color = RED if is_ai else GREEN
        
        if compact:
            name_surf = font_manager.render(player.name, 24, name_color, bold=True)
            name_rect = name_surf.get_rect(x=x, y=y)
            surface.blit(name_surf, name_rect)
            
            current_y = y + 35
            
            health_bar_width = 180
            health_bar_height = 28
            health_x = x
            health_y = current_y
            
            pygame.draw.rect(surface, BLACK, (health_x, health_y, health_bar_width, health_bar_height), border_radius=6)
            
            health_ratio = player.health / player.max_health
            health_width = int(health_bar_width * health_ratio)
            
            if health_ratio > 0.6:
                health_color = (50, 200, 80)
            elif health_ratio > 0.3:
                health_color = (255, 180, 50)
            else:
                health_color = (255, 80, 80)
            
            if health_width > 0:
                pygame.draw.rect(surface, health_color, (health_x, health_y, health_width, health_bar_height), border_radius=6)
            
            pygame.draw.rect(surface, WHITE, (health_x, health_y, health_bar_width, health_bar_height), 2, border_radius=6)
            
            health_text = f"生命: {player.health}/{player.max_health}"
            health_surf = font_manager.render(health_text, 16, WHITE, bold=True)
            health_rect = health_surf.get_rect(centerx=health_x + health_bar_width//2, centery=health_y + health_bar_height//2)
            surface.blit(health_surf, health_rect)
            
            current_y = health_y + health_bar_height + 10
            
            if player.shield > 0:
                shield_bg = pygame.Rect(x, current_y, 130, 26)
                pygame.draw.rect(surface, (40, 100, 180), shield_bg, border_radius=6)
                pygame.draw.rect(surface, (100, 180, 255), shield_bg, 2, border_radius=6)
                shield_text = f"护盾: {player.shield}"
                shield_surf = font_manager.render(shield_text, 16, WHITE)
                shield_rect = shield_surf.get_rect(center=shield_bg.center)
                surface.blit(shield_surf, shield_rect)
                current_y += 35
            
            if not is_ai:
                energy_bg = pygame.Rect(x, current_y, 180, 28)
                pygame.draw.rect(surface, (80, 60, 20), energy_bg, border_radius=6)
                pygame.draw.rect(surface, GOLD, energy_bg, 2, border_radius=6)
                
                energy_icons = ""
                for i in range(player.max_energy):
                    if i < player.energy:
                        energy_icons += "◆"
                    else:
                        energy_icons += "◇"
                
                energy_text = f"能量: {energy_icons}"
                energy_surf = font_manager.render(energy_text, 16, GOLD)
                energy_rect = energy_surf.get_rect(center=energy_bg.center)
                surface.blit(energy_surf, energy_rect)
                current_y += 38
                
                deck_text = f"牌库: {len(player.deck)}  |  弃牌: {len(player.discard)}"
                deck_surf = font_manager.render(deck_text, 14, LIGHT_GRAY)
                surface.blit(deck_surf, (x, current_y))
        else:
            name_surf = font_manager.render(player.name, 32, name_color, bold=True)
            name_rect = name_surf.get_rect(centerx=x, y=y)
            surface.blit(name_surf, name_rect)
            
            health_bar_width = 280
            health_bar_height = 35
            health_x = x - health_bar_width // 2
            health_y = y + 50
            
            pygame.draw.rect(surface, BLACK, (health_x, health_y, health_bar_width, health_bar_height), border_radius=8)
            
            health_ratio = player.health / player.max_health
            health_width = int(health_bar_width * health_ratio)
            
            if health_ratio > 0.6:
                health_color = (50, 200, 80)
            elif health_ratio > 0.3:
                health_color = (255, 180, 50)
            else:
                health_color = (255, 80, 80)
            
            if health_width > 0:
                pygame.draw.rect(surface, health_color, (health_x, health_y, health_width, health_bar_height), border_radius=8)
            
            pygame.draw.rect(surface, WHITE, (health_x, health_y, health_bar_width, health_bar_height), 3, border_radius=8)
            
            health_text = f"生命: {player.health} / {player.max_health}"
            health_surf = font_manager.render(health_text, 20, WHITE, bold=True)
            health_rect = health_surf.get_rect(centerx=x, centery=health_y + health_bar_height//2)
            surface.blit(health_surf, health_rect)
            
            if player.shield > 0:
                shield_bg = pygame.Rect(x - 80, health_y + health_bar_height + 15, 160, 30)
                pygame.draw.rect(surface, (40, 100, 180), shield_bg, border_radius=8)
                pygame.draw.rect(surface, (100, 180, 255), shield_bg, 2, border_radius=8)
                shield_text = f"🛡 护盾: {player.shield}"
                shield_surf = font_manager.render(shield_text, 18, WHITE)
                shield_rect = shield_surf.get_rect(center=shield_bg.center)
                surface.blit(shield_surf, shield_rect)
    
    def _draw_ai_hand(self, surface):
        hand_size = len(self.ai.hand)
        if hand_size == 0:
            empty_surf = font_manager.render("(AI 手牌为空)", 16, LIGHT_GRAY)
            empty_rect = empty_surf.get_rect(centerx=SCREEN_WIDTH//2, y=160)
            surface.blit(empty_surf, empty_rect)
            return
        
        total_width = hand_size * 90 + (hand_size - 1) * 15
        start_x = (SCREEN_WIDTH - total_width) // 2
        y = 130
        
        for i in range(hand_size):
            x = start_x + i * 105
            card_rect = pygame.Rect(x, y, 90, 130)
            pygame.draw.rect(surface, (120, 30, 30), card_rect, border_radius=10)
            pygame.draw.rect(surface, (200, 80, 80), card_rect, 3, border_radius=10)
            
            q_surf = font_manager.render("?", 48, GOLD)
            q_rect = q_surf.get_rect(center=card_rect.center)
            surface.blit(q_surf, q_rect)
            
            back_pattern = pygame.Rect(x + 10, y + 10, 70, 110)
            pygame.draw.rect(surface, (80, 20, 20), back_pattern, 2, border_radius=6)
        
        count_text = f"AI 手牌: {hand_size} 张"
        count_surf = font_manager.render(count_text, 16, LIGHT_GRAY)
        count_rect = count_surf.get_rect(centerx=SCREEN_WIDTH//2, y=y + 140)
        surface.blit(count_surf, count_rect)
    
    def _draw_player_hand(self, surface):
        mouse_pos = pygame.mouse.get_pos()
        self.hovered_card = None
        
        hand_size = len(self.player.hand)
        if hand_size == 0:
            empty_surf = font_manager.render("(你的手牌为空，请结束回合)", 18, ORANGE)
            empty_rect = empty_surf.get_rect(centerx=SCREEN_WIDTH//2, y=SCREEN_HEIGHT - 180)
            surface.blit(empty_surf, empty_rect)
            return
        
        total_width = hand_size * CARD_WIDTH + (hand_size - 1) * 25
        start_x = (SCREEN_WIDTH - total_width) // 2
        y = SCREEN_HEIGHT - CARD_HEIGHT - 60
        
        for i, card in enumerate(self.player.hand):
            x = start_x + i * (CARD_WIDTH + 25)
            is_hovered = card.rect.collidepoint(mouse_pos)
            is_selected = card == self.selected_card
            can_play = self.player.can_play_card(card)
            
            display_y = y
            if is_hovered:
                display_y = y - 30
                self.hovered_card = card
            
            if is_selected:
                display_y = y - 50
            
            card.draw(surface, x, display_y, enlarged=is_hovered, show_cost=True, can_play=can_play)
    
    def _draw_message(self, surface):
        msg_surf = font_manager.render(self.message, 24, WHITE, bold=True)
        msg_rect = msg_surf.get_rect(centerx=SCREEN_WIDTH//2, centery=SCREEN_HEIGHT//2)
        
        padding = 30
        bg_rect = pygame.Rect(
            msg_rect.x - padding,
            msg_rect.y - padding,
            msg_rect.width + padding * 2,
            msg_rect.height + padding * 2
        )
        
        s = pygame.Surface((bg_rect.width, bg_rect.height), pygame.SRCALPHA)
        s.fill((10, 20, 50, 230))
        surface.blit(s, (bg_rect.x, bg_rect.y))
        
        pygame.draw.rect(surface, GOLD, bg_rect, 3, border_radius=15)
        surface.blit(msg_surf, msg_rect)
    
    def _draw_game_over(self, surface):
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        surface.blit(overlay, (0, 0))
        
        winner_color = RED if self.winner == "AI" else GREEN
        title_text = f"🎉 {self.winner} 获胜! 🎉"
        title_surf = font_manager.render(title_text, 56, winner_color, bold=True)
        title_rect = title_surf.get_rect(centerx=SCREEN_WIDTH//2, centery=SCREEN_HEIGHT//2 - 100)
        surface.blit(title_surf, title_rect)
        
        subtext = f"玩家生命: {self.player.health}  |  AI生命: {self.ai.health}  |  总回合: {self.turn_number}"
        subtext_surf = font_manager.render(subtext, 20, LIGHT_GRAY)
        subtext_rect = subtext_surf.get_rect(centerx=SCREEN_WIDTH//2, centery=SCREEN_HEIGHT//2 - 30)
        surface.blit(subtext_surf, subtext_rect)
        
        self.replay_button.draw(surface)
        self.restart_button.draw(surface)
    
    def _draw_replay_controls(self, surface):
        control_bg = pygame.Rect(10, 10, 280, 130)
        pygame.draw.rect(surface, (20, 30, 60), control_bg, border_radius=10)
        pygame.draw.rect(surface, GOLD, control_bg, 2, border_radius=10)
        
        title_surf = font_manager.render("回放控制", 20, GOLD, bold=True)
        surface.blit(title_surf, (20, 15))
        
        controls = [
            "空格键 : 暂停 / 继续",
            "← 键 : 上一回合",
            "→ 键 : 下一回合",
            "ESC键 : 退出回放"
        ]
        
        y = 45
        for control in controls:
            text_surf = font_manager.render(control, 16, WHITE)
            surface.blit(text_surf, (20, y))
            y += 22
        
        if self.replay_player and self.replay_player.paused:
            pause_surf = font_manager.render("⏸ 已暂停", 18, ORANGE)
            surface.blit(pause_surf, (20, y + 5))
        
        if self.replay_player:
            current_log = self.replay_player.get_current_log()
            if current_log:
                turn_info = f"回合 {current_log['turn_number']} - {'玩家' if current_log['is_player_turn'] else 'AI'}回合"
                turn_surf = font_manager.render(turn_info, 18, WHITE)
                turn_rect = turn_surf.get_rect(centerx=SCREEN_WIDTH//2, y=15)
                surface.blit(turn_surf, turn_rect)
    
    def _draw_card_tooltip(self, surface):
        if not self.hovered_card:
            return
        
        card = self.hovered_card
        tooltip_width = 320
        tooltip_height = 280
        
        mouse_pos = pygame.mouse.get_pos()
        x = mouse_pos[0] + 25
        y = mouse_pos[1] - tooltip_height // 2
        
        if x + tooltip_width > SCREEN_WIDTH - 10:
            x = mouse_pos[0] - tooltip_width - 25
        if y < 10:
            y = 10
        if y + tooltip_height > SCREEN_HEIGHT - 10:
            y = SCREEN_HEIGHT - tooltip_height - 10
        
        tooltip_rect = pygame.Rect(x, y, tooltip_width, tooltip_height)
        
        pygame.draw.rect(surface, (15, 25, 50), tooltip_rect, border_radius=12)
        pygame.draw.rect(surface, GOLD, tooltip_rect, 3, border_radius=12)
        
        pad_x = 20
        current_y = y + 15
        
        title_surf = font_manager.render(card.name, 26, GOLD, bold=True)
        surface.blit(title_surf, (x + pad_x, current_y))
        current_y += 40
        
        type_color = RED if card.type == CardType.ATTACK else \
                     BLUE if card.type == CardType.DEFENSE else GREEN
        type_surf = font_manager.render(f"类型: {card.get_type_name()}", 20, type_color)
        surface.blit(type_surf, (x + pad_x, current_y))
        current_y += 30
        
        cost_surf = font_manager.render(f"能量消耗: {card.cost} 点", 20, GOLD)
        surface.blit(cost_surf, (x + pad_x, current_y))
        current_y += 30
        
        if card.type == CardType.ATTACK:
            effect_text = f"效果: 造成 {card.value} 点伤害"
        elif card.type == CardType.DEFENSE:
            effect_text = f"效果: 获得 {card.value} 点护盾"
        else:
            if card.is_heal():
                effect_text = f"效果: 恢复 {card.value} 点生命"
            else:
                effect_text = f"效果: 特殊效果值 {card.value}"
        
        effect_surf = font_manager.render(effect_text, 20, WHITE)
        surface.blit(effect_surf, (x + pad_x, current_y))
        current_y += 35
        
        special_texts = []
        if card.is_piercing():
            special_texts.append("✦ 穿透: 完全无视敌方护盾")
        if card.is_draw():
            special_texts.append(f"✦ 抽牌: 额外抽取 {card.get_draw_count()} 张牌")
        if card.is_energy_boost():
            special_texts.append(f"✦ 能量: 获得 {card.get_energy_boost()} 点额外能量")
        
        if special_texts:
            special_title = font_manager.render("特殊效果:", 18, GREEN)
            surface.blit(special_title, (x + pad_x, current_y))
            current_y += 25
            
            for text in special_texts:
                text_surf = font_manager.render(text, 16, (150, 255, 180))
                surface.blit(text_surf, (x + pad_x + 15, current_y))
                current_y += 22
        
        current_y += 10
        desc_surf = font_manager.render(f"描述: {card.description}", 16, LIGHT_GRAY)
        surface.blit(desc_surf, (x + pad_x, current_y))

def main():
    game = Game()
    running = True
    
    while running:
        dt = clock.tick(FPS) / 1000.0
        
        mouse_pressed = pygame.mouse.get_pressed()[0]
        mouse_pos = pygame.mouse.get_pos()
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:
                    if game.handle_click(event.pos):
                        game = Game()
            
            elif event.type == pygame.KEYDOWN:
                if game.handle_key(event.key):
                    game = Game()
        
        game.update(dt)
        game.draw(screen)
        pygame.display.flip()
    
    pygame.quit()

if __name__ == "__main__":
    main()
