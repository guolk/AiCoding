from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.api import router as api_router

app = FastAPI(
    title="Circuit Simulator Backend",
    description="FastAPI backend for circuit simulation using ngspice/PySpice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "Circuit Simulator Backend",
        "version": "1.0.0",
        "endpoints": {
            "simulation": "/api/simulate",
            "export_netlist": "/api/export/netlist",
            "export_svg": "/api/export/svg",
            "health": "/api/health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
