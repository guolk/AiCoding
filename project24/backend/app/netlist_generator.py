import re
from typing import Dict, List, Tuple, Set
from .schemas import CircuitComponent, Wire, Pin


def _get_type_str(obj):
    try:
        if hasattr(obj, 'value'):
            return obj.value
        return str(obj)
    except:
        return str(obj)


class NetlistGenerator:
    def __init__(self):
        self.node_counter = 0
        self.component_counter = {}
        self.pin_to_node = {}
        self.node_names = {}
        
    def parse_value(self, value):
        units = {
            'p': 1e-12, 'n': 1e-9, 'u': 1e-6, 'm': 1e-3,
            'k': 1e3, 'K': 1e3, 'M': 1e6, 'G': 1e9
        }
        
        match = re.match(r'^(-?[\d.]+)([a-zA-Z]*)$', value.strip())
        if not match:
            return float(value) if value else 0
        
        num = float(match.group(1))
        unit = match.group(2)
        
        if unit and unit in units:
            return num * units[unit]
        
        return num
    
    def format_value(self, value):
        if abs(value) >= 1e9:
            return '{0}G'.format(value/1e9)
        elif abs(value) >= 1e6:
            return '{0}Meg'.format(value/1e6)
        elif abs(value) >= 1e3:
            return '{0}k'.format(value/1e3)
        elif abs(value) >= 1:
            return '{0}'.format(value)
        elif abs(value) >= 1e-3:
            return '{0}m'.format(value*1e3)
        elif abs(value) >= 1e-6:
            return '{0}u'.format(value*1e6)
        elif abs(value) >= 1e-9:
            return '{0}n'.format(value*1e9)
        else:
            return '{0}p'.format(value*1e12)
    
    def get_next_node(self):
        self.node_counter += 1
        return str(self.node_counter)
    
    def find_connected_pins(self, components, wires):
        connections = {}
        
        for comp in components:
            for pin in comp.pins:
                pin_key = '{0}:{1}'.format(comp.id, pin.id)
                connections[pin_key] = [(comp.id, pin.id)]
        
        for wire in wires:
            start_key = '{0}:{1}'.format(wire.startComponentId, wire.startPinId)
            end_key = '{0}:{1}'.format(wire.endComponentId, wire.endPinId)
            
            if start_key in connections and end_key in connections:
                start_list = connections[start_key]
                end_list = connections[end_key]
                merged = start_list + end_list
                
                for item in merged:
                    item_key = '{0}:{1}'.format(item[0], item[1])
                    connections[item_key] = merged
        
        return connections
    
    def assign_nodes(self, components, wires):
        connections = self.find_connected_pins(components, wires)
        pin_to_node = {}
        node_names = {}
        
        for comp in components:
            comp_type = _get_type_str(comp.type)
            if comp_type == 'ground':
                for pin in comp.pins:
                    pin_key = '{0}:{1}'.format(comp.id, pin.id)
                    if pin_key in connections:
                        for connected_comp_id, connected_pin_id in connections[pin_key]:
                            connected_key = '{0}:{1}'.format(connected_comp_id, connected_pin_id)
                            pin_to_node[connected_key] = '0'
                node_names['0'] = 'ground'
        
        for comp in components:
            for pin in comp.pins:
                pin_key = '{0}:{1}'.format(comp.id, pin.id)
                
                if pin_key in pin_to_node:
                    continue
                
                if pin_key in connections:
                    connected_pins = connections[pin_key]
                    
                    all_assigned = False
                    assigned_node = None
                    for connected_comp_id, connected_pin_id in connected_pins:
                        connected_key = '{0}:{1}'.format(connected_comp_id, connected_pin_id)
                        if connected_key in pin_to_node:
                            assigned_node = pin_to_node[connected_key]
                            all_assigned = True
                            break
                    
                    if not all_assigned:
                        assigned_node = self.get_next_node()
                        node_names[assigned_node] = 'n{0}'.format(assigned_node)
                    
                    for connected_comp_id, connected_pin_id in connected_pins:
                        connected_key = '{0}:{1}'.format(connected_comp_id, connected_pin_id)
                        pin_to_node[connected_key] = assigned_node
        
        return pin_to_node, node_names
    
    def get_component_netlist_lines(self, component, pin_to_node):
        lines = []
        name = component.name.upper()
        comp_type = _get_type_str(component.type)
        
        if comp_type == 'resistor':
            if len(component.pins) >= 2:
                pin1_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                pin2_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                node1 = pin_to_node.get(pin1_key, '0')
                node2 = pin_to_node.get(pin2_key, '0')
                value = self.parse_value(component.value) if component.value else 1000
                lines.append('{0} {1} {2} {3}'.format(name, node1, node2, self.format_value(value)))
        
        elif comp_type == 'capacitor':
            if len(component.pins) >= 2:
                pin1_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                pin2_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                node1 = pin_to_node.get(pin1_key, '0')
                node2 = pin_to_node.get(pin2_key, '0')
                value = self.parse_value(component.value) if component.value else 1e-6
                lines.append('{0} {1} {2} {3}'.format(name, node1, node2, self.format_value(value)))
        
        elif comp_type == 'inductor':
            if len(component.pins) >= 2:
                pin1_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                pin2_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                node1 = pin_to_node.get(pin1_key, '0')
                node2 = pin_to_node.get(pin2_key, '0')
                value = self.parse_value(component.value) if component.value else 1e-3
                lines.append('{0} {1} {2} {3}'.format(name, node1, node2, self.format_value(value)))
        
        elif comp_type == 'voltage_source':
            if len(component.pins) >= 2:
                pin1_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                pin2_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                node1 = pin_to_node.get(pin1_key, '0')
                node2 = pin_to_node.get(pin2_key, '0')
                value = self.parse_value(component.value) if component.value else 5
                source_type = component.properties.get('type', 'dc')
                
                if source_type == 'dc':
                    lines.append('{0} {1} {2} DC {3}'.format(name, node1, node2, self.format_value(value)))
                elif source_type == 'ac':
                    lines.append('{0} {1} {2} AC {3} 0'.format(name, node1, node2, self.format_value(value)))
                else:
                    lines.append('{0} {1} {2} DC {3}'.format(name, node1, node2, self.format_value(value)))
        
        elif comp_type == 'current_source':
            if len(component.pins) >= 2:
                pin1_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                pin2_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                node1 = pin_to_node.get(pin1_key, '0')
                node2 = pin_to_node.get(pin2_key, '0')
                value = self.parse_value(component.value) if component.value else 1e-3
                source_type = component.properties.get('type', 'dc')
                
                if source_type == 'dc':
                    lines.append('{0} {1} {2} DC {3}'.format(name, node1, node2, self.format_value(value)))
                elif source_type == 'ac':
                    lines.append('{0} {1} {2} AC {3} 0'.format(name, node1, node2, self.format_value(value)))
                else:
                    lines.append('{0} {1} {2} DC {3}'.format(name, node1, node2, self.format_value(value)))
        
        elif comp_type == 'diode':
            if len(component.pins) >= 2:
                pin1_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                pin2_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                node1 = pin_to_node.get(pin1_key, '0')
                node2 = pin_to_node.get(pin2_key, '0')
                model = component.properties.get('model', 'D1N4148')
                lines.append('{0} {1} {2} {3}'.format(name, node1, node2, model))
                lines.append('.model {0} D IS=1e-15 RS=100'.format(model))
        
        elif comp_type == 'transistor':
            if len(component.pins) >= 3:
                trans_type = component.properties.get('type', 'npn').lower()
                model = component.properties.get('model', 'QNPN' if trans_type == 'npn' else 'QPNP')
                
                b_pin_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                c_pin_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                e_pin_key = '{0}:{1}'.format(component.id, component.pins[2].id)
                
                node_b = pin_to_node.get(b_pin_key, '0')
                node_c = pin_to_node.get(c_pin_key, '0')
                node_e = pin_to_node.get(e_pin_key, '0')
                
                lines.append('{0} {1} {2} {3} {4}'.format(name, node_c, node_b, node_e, model))
                if trans_type == 'npn':
                    lines.append('.model {0} NPN IS=1e-16 BF=100'.format(model))
                else:
                    lines.append('.model {0} PNP IS=1e-16 BF=100'.format(model))
        
        elif comp_type == 'opamp':
            if len(component.pins) >= 3:
                model = component.properties.get('model', 'LM741')
                
                if len(component.pins) >= 5:
                    in_neg_pin_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                    in_pos_pin_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                    out_pin_key = '{0}:{1}'.format(component.id, component.pins[2].id)
                    vcc_pos_pin_key = '{0}:{1}'.format(component.id, component.pins[3].id)
                    vcc_neg_pin_key = '{0}:{1}'.format(component.id, component.pins[4].id)
                    
                    in_neg = pin_to_node.get(in_neg_pin_key, '0')
                    in_pos = pin_to_node.get(in_pos_pin_key, '0')
                    out = pin_to_node.get(out_pin_key, '0')
                    vcc_pos = pin_to_node.get(vcc_pos_pin_key, '0')
                    vcc_neg = pin_to_node.get(vcc_neg_pin_key, '0')
                    
                    lines.append('X{0} {1} {2} {3} {4} {5} {6}'.format(name, in_neg, in_pos, vcc_pos, vcc_neg, out, model))
                else:
                    in_neg_pin_key = '{0}:{1}'.format(component.id, component.pins[0].id)
                    in_pos_pin_key = '{0}:{1}'.format(component.id, component.pins[1].id)
                    out_pin_key = '{0}:{1}'.format(component.id, component.pins[2].id)
                    
                    in_neg = pin_to_node.get(in_neg_pin_key, '0')
                    in_pos = pin_to_node.get(in_pos_pin_key, '0')
                    out = pin_to_node.get(out_pin_key, '0')
                    
                    lines.append('X{0} {1} {2} {3} {4}'.format(name, in_neg, in_pos, out, model))
                
                lines.append('.subckt {0} IN+ IN- OUT'.format(model))
                lines.append('RIN IN+ IN- 1Meg')
                lines.append('EGAIN OUT 0 IN+ IN- 100k')
                lines.append('.ends {0}'.format(model))
        
        return lines
    
    def generate_netlist(self, components, wires, title='Circuit'):
        self.node_counter = 0
        self.pin_to_node, self.node_names = self.assign_nodes(components, wires)
        
        netlist_lines = []
        
        netlist_lines.append('* {0}'.format(title))
        netlist_lines.append('')
        
        for comp in components:
            lines = self.get_component_netlist_lines(comp, self.pin_to_node)
            netlist_lines.extend(lines)
        
        netlist_lines.append('')
        
        return '\n'.join(netlist_lines)
    
    def get_pin_node_map(self):
        return self.pin_to_node
