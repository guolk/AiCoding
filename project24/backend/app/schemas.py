from pydantic import BaseModel
from typing import List, Dict, Optional, Union, Any
from enum import Enum


class ComponentType(str, Enum):
    RESISTOR = 'resistor'
    CAPACITOR = 'capacitor'
    INDUCTOR = 'inductor'
    DIODE = 'diode'
    TRANSISTOR = 'transistor'
    OPAMP = 'opamp'
    VOLTAGE_SOURCE = 'voltage_source'
    CURRENT_SOURCE = 'current_source'
    GROUND = 'ground'


class SimulationMode(str, Enum):
    TRANSIENT = 'transient'
    AC = 'ac'

class Point(BaseModel):
    x: float
    y: float

class Pin(BaseModel):
    id: str
    label: str
    offset: Point
    nodeId: Optional[str] = None

class CircuitComponent(BaseModel):
    id: str
    type: ComponentType
    name: str
    x: float
    y: float
    rotation: float
    value: str
    pins: List[Pin]
    properties: Dict[str, str]

class Wire(BaseModel):
    id: str
    startComponentId: str
    startPinId: str
    endComponentId: str
    endPinId: str
    points: List[Point]

class TransientConfig(BaseModel):
    startTime: float
    endTime: float
    timeStep: float

class ACConfig(BaseModel):
    startFreq: float
    endFreq: float
    pointsPerDecade: int

class SimulationConfig(BaseModel):
    mode: SimulationMode
    transient: Optional[TransientConfig] = None
    ac: Optional[ACConfig] = None

class SimulationRequest(BaseModel):
    components: List[CircuitComponent]
    wires: List[Wire]
    config: SimulationConfig

class NodeVoltage(BaseModel):
    nodeName: str
    values: List[float]

class BranchCurrent(BaseModel):
    componentName: str
    values: List[float]

class TransientResult(BaseModel):
    timePoints: List[float]
    nodeVoltages: List[NodeVoltage]
    branchCurrents: List[BranchCurrent]

class ACNodeVoltage(BaseModel):
    nodeName: str
    magnitudes: List[float]
    phases: List[float]

class ACResult(BaseModel):
    frequencies: List[float]
    nodeVoltages: List[ACNodeVoltage]

class SimulationResult(BaseModel):
    mode: SimulationMode
    transient: Optional[TransientResult] = None
    ac: Optional[ACResult] = None

class ExportRequest(BaseModel):
    components: List[CircuitComponent]
    wires: List[Wire]
