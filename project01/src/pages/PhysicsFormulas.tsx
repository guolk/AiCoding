import { useState, useEffect, useCallback } from 'react';
import { physicsFormulas } from '../data/physicsFormulas';
import { PhysicsFormula } from '../types';
import FormulaChart from '../components/FormulaChart';
import ParameterControl from '../components/ParameterControl';
import FormulaExplanation from '../components/FormulaExplanation';
import AnimationControl from '../components/AnimationControl';
import { useAnimation } from '../hooks/useAnimation';

function PhysicsFormulas() {
  const [selectedFormula, setSelectedFormula] = useState<PhysicsFormula>(physicsFormulas[0]);
  const [params, setParams] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [animationData, setAnimationData] = useState<{ x: number; y: number }[]>([]);
  const [currentSimulationResult, setCurrentSimulationResult] = useState<Record<string, number | string>>({});

  const SIMULATION_DURATION = 10;

  const {
    progress: animationProgress,
    isPlaying,
    isPaused,
    speed: animationSpeed,
    play,
    pause,
    reset,
    setProgress: setAnimationProgress,
    setSpeed: setAnimationSpeed
  } = useAnimation({
    duration: SIMULATION_DURATION,
    speed: 1
  });

  useEffect(() => {
    const initialParams: Record<string, number> = {};
    selectedFormula.parameters.forEach((param) => {
      initialParams[param.name] = param.defaultValue;
    });
    setParams(initialParams);
    reset();
  }, [selectedFormula, reset]);

  const generateChartData = useCallback(() => {
    const data: { x: number; y: number }[] = [];
    const steps = 200;
    const timeStep = SIMULATION_DURATION / steps;

    for (let i = 0; i <= steps; i++) {
      const time = i * timeStep;
      try {
        const result = selectedFormula.simulate(time, params);
        let yValue: number;
        
        if (selectedFormula.id === 'uniform-linear-motion') {
          yValue = result.position as number;
        } else if (selectedFormula.id === 'free-fall-motion') {
          yValue = result.height as number;
        } else if (selectedFormula.id === 'ohms-law') {
          yValue = result.current as number;
        } else if (selectedFormula.id === 'simple-harmonic-motion') {
          yValue = result.position as number;
        } else if (selectedFormula.id === 'projectile-motion') {
          yValue = result.y as number;
        } else {
          const firstKey = Object.keys(result)[0];
          yValue = (firstKey ? result[firstKey] : 0) as number;
        }

        if (isFinite(yValue)) {
          if (selectedFormula.id === 'projectile-motion') {
            const xValue = result.x as number;
            data.push({ x: xValue, y: yValue });
          } else {
            data.push({ x: time, y: yValue });
          }
        }
      } catch {
        continue;
      }
    }

    setChartData(data);
    setAnimationData(data);
  }, [selectedFormula, params]);

  useEffect(() => {
    generateChartData();
  }, [generateChartData]);

  useEffect(() => {
    const currentTime = animationProgress * SIMULATION_DURATION;
    const result = selectedFormula.simulate(currentTime, params);
    setCurrentSimulationResult({
      '时间': `${currentTime.toFixed(2)} s`,
      ...Object.fromEntries(
        Object.entries(result).map(([key, value]) => {
          let unit = '';
          if (key === 'position' || key === 'height' || key === 'distanceFallen' || key === 'x' || key === 'y') {
            unit = ' m';
          } else if (key === 'velocity' || key === 'vx' || key === 'vy') {
            unit = ' m/s';
          } else if (key === 'acceleration') {
            unit = ' m/s²';
          } else if (key === 'current') {
            unit = ' A';
          } else if (key === 'voltage') {
            unit = ' V';
          } else if (key === 'resistance') {
            unit = ' Ω';
          } else if (key === 'power') {
            unit = ' W';
          } else if (key === 'period') {
            unit = ' s';
          } else if (key === 'frequency') {
            unit = ' Hz';
          }
          return [key, typeof value === 'number' ? `${value.toFixed(4)}${unit}` : value];
        })
      )
    });
  }, [animationProgress, selectedFormula, params]);

  const handleParamChange = (name: string, value: number) => {
    setParams((prev) => ({ ...prev, [name]: value }));
    reset();
  };

  const handleFormulaSelect = (formula: PhysicsFormula) => {
    setSelectedFormula(formula);
  };

  const getXAxisLabel = () => {
    if (selectedFormula.id === 'projectile-motion') {
      return '水平位移 x (m)';
    }
    return '时间 t (s)';
  };

  const getYAxisLabel = () => {
    if (selectedFormula.id === 'uniform-linear-motion') {
      return '位置 s (m)';
    } else if (selectedFormula.id === 'free-fall-motion') {
      return '高度 h (m)';
    } else if (selectedFormula.id === 'ohms-law') {
      return '电流 I (A)';
    } else if (selectedFormula.id === 'simple-harmonic-motion') {
      return '位移 x (m)';
    } else if (selectedFormula.id === 'projectile-motion') {
      return '高度 y (m)';
    }
    return 'y';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>物理公式</h2>
        <p style={styles.pageSubtitle}>
          通过动态模拟理解物理规律，调整参数观察物理量变化
        </p>
      </div>

      <div style={styles.formulaSelector}>
        <h3 style={styles.selectorTitle}>选择公式：</h3>
        <div style={styles.formulaCards}>
          {physicsFormulas.map((formula) => (
            <div
              key={formula.id}
              onClick={() => handleFormulaSelect(formula)}
              style={{
                ...styles.formulaCard,
                ...(selectedFormula.id === formula.id ? styles.formulaCardActive : {})
              }}
            >
              <div style={styles.formulaCardName}>{formula.name}</div>
              <div style={styles.formulaCardFormula}>{formula.formula.split(',')[0]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.leftColumn}>
          <div style={styles.chartSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>物理模拟</h3>
            </div>
            <FormulaChart
              data={chartData}
              animationData={animationData}
              chartType={selectedFormula.chartType}
              xAxisLabel={getXAxisLabel()}
              yAxisLabel={getYAxisLabel()}
              showAnimation={isPlaying || animationProgress > 0}
              animationProgress={animationProgress}
              height={450}
            />
          </div>

          {selectedFormula.animationType && (
            <div style={styles.animationSection}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>动画演示</h3>
              </div>
              <AnimationControl
                isPlaying={isPlaying}
                isPaused={isPaused}
                progress={animationProgress}
                speed={animationSpeed}
                onPlay={play}
                onPause={pause}
                onReset={reset}
                onProgressChange={setAnimationProgress}
                onSpeedChange={setAnimationSpeed}
                duration={SIMULATION_DURATION}
              />
            </div>
          )}

          {Object.keys(currentSimulationResult).length > 0 && (
            <div style={styles.simulationResultSection}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>实时模拟数据</h3>
              </div>
              <div style={styles.simulationResult}>
                {Object.entries(currentSimulationResult).map(([key, value]) => (
                  <div key={key} style={styles.resultItem}>
                    <span style={styles.resultKey}>{key}:</span>
                    <span style={styles.resultValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.controlSection}>
            <ParameterControl
              parameters={selectedFormula.parameters}
              values={params}
              onChange={handleParamChange}
              title="参数调整"
            />
          </div>

          <div style={styles.explanationSection}>
            <FormulaExplanation
              formula={selectedFormula}
              currentValues={params}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '24px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#333',
    margin: '0 0 8px 0'
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0
  },
  formulaSelector: {
    marginBottom: '24px'
  },
  selectorTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
    margin: '0 0 16px 0'
  },
  formulaCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  formulaCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent'
  },
  formulaCardActive: {
    borderColor: '#52c41a',
    boxShadow: '0 4px 16px rgba(82, 196, 26, 0.2)'
  },
  formulaCardName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '8px'
  },
  formulaCardFormula: {
    fontSize: '11px',
    color: '#666',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  sectionHeader: {
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
    margin: 0
  },
  chartSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
  },
  animationSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
  },
  simulationResultSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
  },
  simulationResult: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  resultItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#f6ffed',
    borderRadius: '8px',
    border: '1px solid #b7eb8f'
  },
  resultKey: {
    fontSize: '12px',
    color: '#52c41a',
    fontWeight: 500
  },
  resultValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#333',
    fontFamily: 'monospace'
  },
  controlSection: {},
  explanationSection: {}
};

export default PhysicsFormulas;
