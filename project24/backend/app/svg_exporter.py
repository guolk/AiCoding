from typing import List
import math
from .schemas import CircuitComponent, Wire, Point

class SVGExporter:
    def __init__(self):
        self.component_symbols = {
            'resistor': self._draw_resistor,
            'capacitor': self._draw_capacitor,
            'inductor': self._draw_inductor,
            'diode': self._draw_diode,
            'transistor': self._draw_transistor,
            'opamp': self._draw_opamp,
            'voltage_source': self._draw_voltage_source,
            'current_source': self._draw_current_source,
            'ground': self._draw_ground
        }
    
    def _rotate_point(self, point: Point, angle_deg: float) -> Point:
        angle_rad = math.radians(angle_deg)
        cos_val = math.cos(angle_rad)
        sin_val = math.sin(angle_rad)
        return Point(
            x=point.x * cos_val - point.y * sin_val,
            y=point.x * sin_val + point.y * cos_val
        )
    
    def _get_pin_world_position(self, component: CircuitComponent, pin_index: int) -> Point:
        pin = component.pins[pin_index]
        rotated_offset = self._rotate_point(pin.offset, component.rotation)
        return Point(
            x=component.x + rotated_offset.x,
            y=component.y + rotated_offset.y
        )
    
    def _draw_resistor(self) -> str:
        return '<path d="M-40,0 L-30,0 L-25,-8 L-15,8 L-5,-8 L5,8 L15,-8 L25,8 L30,0 L40,0" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_capacitor(self) -> str:
        return '<path d="M-30,0 L-10,0 M-10,-12 L-10,12 M10,-12 L10,12 M10,0 L30,0" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_inductor(self) -> str:
        return '<path d="M-40,0 L-30,0 Q-25,-12 -20,0 Q-15,-12 -10,0 Q-5,-12 0,0 Q5,-12 10,0 Q15,-12 20,0 Q25,-12 30,0 L40,0" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_diode(self) -> str:
        return '<path d="M-30,0 L-10,0 L10,0 L30,0 M-10,-8 L-10,8 L10,0 Z" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_transistor(self) -> str:
        return '<path d="M-30,0 L-5,0 M-5,0 L15,-20 M-5,0 L15,20 M-5,-8 L-5,8 M12,-17 L15,-20 L12,-23 M12,17 L15,20 L12,23" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_opamp(self) -> str:
        return '<path d="M-30,-25 L30,0 L-30,25 Z M-30,-15 L-10,-15 M-30,15 L-10,15 M30,0 L45,0 M-25,-22 L-25,22" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_voltage_source(self) -> str:
        return '<path d="M0,-25 L0,-15 M0,-15 A10,10 0 1,0 0,5 A10,10 0 1,0 0,-15 M0,5 L0,25 M-3,-5 L3,-5 M0,-8 L0,-2" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_current_source(self) -> str:
        return '<path d="M0,-25 L0,-15 M0,-15 A10,10 0 1,0 0,5 A10,10 0 1,0 0,-15 M0,5 L0,25 M0,-8 L0,2 M-4,-3 L0,-7 L4,-3" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_ground(self) -> str:
        return '<path d="M0,-15 L0,0 M-20,0 L20,0 M-15,6 L15,6 M-10,12 L10,12" fill="none" stroke="#2c3e50" stroke-width="2"/>'
    
    def _draw_wire(self, components: List[CircuitComponent], wire: Wire) -> str:
        start_comp = next((c for c in components if c.id == wire.startComponentId), None)
        end_comp = next((c for c in components if c.id == wire.endComponentId), None)
        
        if not start_comp or not end_comp:
            return ''
        
        start_pin_index = next((i for i, p in enumerate(start_comp.pins) if p.id == wire.startPinId), -1)
        end_pin_index = next((i for i, p in enumerate(end_comp.pins) if p.id == wire.endPinId), -1)
        
        if start_pin_index == -1 or end_pin_index == -1:
            return ''
        
        start_pos = self._get_pin_world_position(start_comp, start_pin_index)
        end_pos = self._get_pin_world_position(end_comp, end_pin_index)
        
        dx = end_pos.x - start_pos.x
        dy = end_pos.y - start_pos.y
        
        if abs(dx) < 10 or abs(dy) < 10:
            path = f'M {start_pos.x} {start_pos.y} L {end_pos.x} {end_pos.y}'
        else:
            mid_x = (start_pos.x + end_pos.x) / 2
            mid_y = (start_pos.y + end_pos.y) / 2
            
            if abs(dx) > abs(dy):
                path = f'M {start_pos.x} {start_pos.y} H {mid_x} V {end_pos.y} H {end_pos.x}'
            else:
                path = f'M {start_pos.x} {start_pos.y} V {mid_y} H {end_pos.x} V {end_pos.y}'
        
        return f'<path d="{path}" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
    
    def _draw_component_label(self, component: CircuitComponent) -> str:
        label_positions = {
            'resistor': (0, -25),
            'capacitor': (0, -25),
            'inductor': (0, -25),
            'diode': (0, -25),
            'transistor': (-20, -25),
            'opamp': (-20, -35),
            'voltage_source': (30, 0),
            'current_source': (30, 0),
            'ground': (0, -25)
        }
        
        x, y = label_positions.get(component.type, (0, -20))
        
        if component.value:
            label_text = f'{component.name}\n{component.value}'
            return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="monospace" font-size="12" fill="#7f8c8d">{component.name}<tspan dx="0" dy="14" font-weight="bold">{component.value}</tspan></text>'
        else:
            return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="monospace" font-size="12" fill="#7f8c8d">{component.name}</text>'
    
    def export_svg(self, components: List[CircuitComponent], wires: List[Wire], title: str = 'Circuit') -> str:
        if not components and not wires:
            return self._create_empty_svg(title)
        
        all_x: List[float] = []
        all_y: List[float] = []
        
        for comp in components:
            all_x.append(comp.x - 60)
            all_x.append(comp.x + 60)
            all_y.append(comp.y - 60)
            all_y.append(comp.y + 60)
        
        if not all_x:
            all_x = [0, 800]
            all_y = [0, 600]
        
        min_x = min(all_x)
        max_x = max(all_x)
        min_y = min(all_y)
        max_y = max(all_y)
        
        padding = 50
        min_x -= padding
        max_x += padding
        min_y -= padding
        max_y += padding
        
        width = max_x - min_x
        height = max_y - min_y
        
        svg_parts: List[str] = []
        
        svg_parts.append(f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{width}" 
     height="{height}" 
     viewBox="{min_x} {min_y} {width} {height}">''')
        
        svg_parts.append(f'''  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
    </pattern>
  </defs>''')
        
        svg_parts.append(f'  <rect x="{min_x}" y="{min_y}" width="{width}" height="{height}" fill="url(#grid)"/>')
        
        svg_parts.append(f'''  <text x="{min_x + 20}" y="{min_y + 30}" 
        font-family="Arial, sans-serif" 
        font-size="16" 
        font-weight="bold" 
        fill="#2c3e50">{title}</text>''')
        
        svg_parts.append('  <g id="wires">')
        for wire in wires:
            wire_path = self._draw_wire(components, wire)
            if wire_path:
                svg_parts.append(f'    {wire_path}')
        svg_parts.append('  </g>')
        
        svg_parts.append('  <g id="components">')
        for comp in components:
            transform = f'translate({comp.x}, {comp.y}) rotate({comp.rotation})'
            svg_parts.append(f'    <g id="comp-{comp.id}" transform="{transform}">')
            
            draw_func = self.component_symbols.get(comp.type)
            if draw_func:
                svg_parts.append(f'      {draw_func()}')
            
            label = self._draw_component_label(comp)
            svg_parts.append(f'      {label}')
            
            svg_parts.append('    </g>')
        svg_parts.append('  </g>')
        
        svg_parts.append('</svg>')
        
        return '\n'.join(svg_parts)
    
    def _create_empty_svg(self, title: str) -> str:
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="800" 
     height="600" 
     viewBox="0 0 800 600">
  <rect x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <text x="400" y="300" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="18" 
        fill="#7f8c8d">No circuit elements to export</text>
</svg>'''
