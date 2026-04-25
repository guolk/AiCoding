import { useState, useEffect, useCallback } from 'react';
import { mathFormulas } from '../data/mathFormulas';
import { MathFormula } from '../types';
import FormulaChart from '../components/FormulaChart';
import ParameterControl from '../components/ParameterControl';
import FormulaExplanation from '../components/FormulaExplanation';
import AnimationControl from '../components/AnimationControl';
import { useAnimation } from '../hooks/useAnimation';

function MathFormulas() {
  const [selectedFormula, setSelectedFormula] = useState<MathFormula>(mathFormulas[0]);
  const [params, setParams] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [animationData, setAnimationData] = useState<{ x: number; y: number }[]>([]);

  const ANIMATION_DURATION = 10;

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
    duration: ANIMATION_DURATION,
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
    const { min, max } = selectedFormula.domain;
    const step = (max - min) / 200;

    for (let x = min; x <= max; x += step) {
      try {
        const y = selectedFormula.calculate(x, params);
        if (isFinite(y)) {
          data.push({ x, y });
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

  const handleParamChange = (name: string, value: number) => {
    setParams((prev) => ({ ...prev, [name]: value }));
    reset();
  };

  const handleFormulaSelect = (formula: MathFormula) => {
    setSelectedFormula(formula);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>数学公式</h2>
        <p style={styles.pageSubtitle}>
          通过动态交互理解数学公式，调整参数观察函数图像变化
        </p>
      </div>

      <div style={styles.formulaSelector}>
        <h3 style={styles.selectorTitle}>选择公式：</h3>
        <div style={styles.formulaCards}>
          {mathFormulas.map((formula) => (
            <div
              key={formula.id}
              onClick={() => handleFormulaSelect(formula)}
              style={{
                ...styles.formulaCard,
                ...(selectedFormula.id === formula.id ? styles.formulaCardActive : {})
              }}
            >
              <div style={styles.formulaCardName}>{formula.name}</div>
              <div style={styles.formulaCardFormula}>{formula.formula}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.leftColumn}>
          <div style={styles.chartSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>函数图像</h3>
            </div>
            <FormulaChart
              data={chartData}
              animationData={animationData}
              chartType={selectedFormula.chartType}
              xAxisLabel="x"
              yAxisLabel="y"
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
                duration={ANIMATION_DURATION}
              />
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
    borderColor: '#1890ff',
    boxShadow: '0 4px 16px rgba(24, 144, 255, 0.2)'
  },
  formulaCardName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '8px'
  },
  formulaCardFormula: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace'
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
  controlSection: {},
  explanationSection: {}
};

export default MathFormulas;
