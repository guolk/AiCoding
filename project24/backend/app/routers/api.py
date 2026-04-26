from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse, Response
from typing import Dict, Any
from ..schemas import (
    SimulationRequest, SimulationResult,
    ExportRequest
)
from ..simulation_service import SimulationService
from ..netlist_generator import NetlistGenerator
from ..svg_exporter import SVGExporter

router = APIRouter()
simulation_service = SimulationService()
netlist_generator = NetlistGenerator()
svg_exporter = SVGExporter()


@router.post("/simulate", response_model=SimulationResult)
async def simulate_circuit(request: SimulationRequest) -> SimulationResult:
    try:
        result = simulation_service.run_simulation(
            components=request.components,
            wires=request.wires,
            config=request.config
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.post("/export/netlist", response_class=PlainTextResponse)
async def export_netlist(request: ExportRequest) -> PlainTextResponse:
    try:
        netlist = netlist_generator.generate_netlist(
            components=request.components,
            wires=request.wires,
            title="Circuit Export"
        )
        
        control_lines = ""
        if request.components:
            control_lines = "\n.end\n"
        
        full_netlist = netlist + control_lines
        
        return PlainTextResponse(
            content=full_netlist,
            media_type="text/plain"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Netlist export failed: {str(e)}")


@router.post("/export/svg")
async def export_svg(request: ExportRequest) -> Response:
    try:
        svg_content = svg_exporter.export_svg(
            components=request.components,
            wires=request.wires,
            title="Circuit Diagram"
        )
        
        return Response(
            content=svg_content,
            media_type="image/svg+xml"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SVG export failed: {str(e)}")


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "circuit-simulator-backend"
    }
