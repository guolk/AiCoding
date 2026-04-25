import { Parameter } from '../types';

interface ParameterControlProps {
  parameters: Parameter[];
  values: Record<string, number>;
  onChange: (name: string, value: number) => void;
  title?: string;
}

function ParameterControl({
  parameters,
  values,
  onChange,
  title = '参数调整'
}: ParameterControlProps) {
  const handleSliderChange = (param: Parameter, value: string) => {
    onChange(param.name, parseFloat(value));
  };

  const handleInputChange = (param: Parameter, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(param.min, Math.min(param.max, numValue));
      onChange(param.name, clampedValue);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.parametersList}>
        {parameters.map((param) => (
          <div key={param.name} style={styles.parameterItem}>
            <div style={styles.parameterHeader}>
              <div style={styles.parameterInfo}>
                <span style={styles.paramSymbol}>{param.symbol}</span>
                <span style={styles.paramLabel}>{param.label}</span>
                {param.unit && (
                  <span style={styles.paramUnit}>({param.unit})</span>
                )}
              </div>
              <input
                type="number"
                value={values[param.name] || param.defaultValue}
                onChange={(e) => handleInputChange(param, e.target.value)}
                step={param.step}
                min={param.min}
                max={param.max}
                style={styles.paramInput}
              />
            </div>
            <div style={styles.sliderContainer}>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={values[param.name] || param.defaultValue}
                onChange={(e) => handleSliderChange(param, e.target.value)}
                style={styles.slider}
              />
              <div style={styles.sliderLabels}>
                <span style={styles.sliderLabel}>{param.min}</span>
                <span style={styles.sliderLabel}>{param.max}</span>
              </div>
            </div>
            <p style={styles.paramDescription}>{param.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
    margin: '0 0 16px 0',
    paddingBottom: '12px',
    borderBottom: '1px solid #e0e0e0'
  },
  parametersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  parameterItem: {
    padding: '12px',
    backgroundColor: '#fafafa',
    borderRadius: '8px'
  },
  parameterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  parameterInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  paramSymbol: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1890ff',
    fontFamily: 'monospace'
  },
  paramLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#333'
  },
  paramUnit: {
    fontSize: '12px',
    color: '#666'
  },
  paramInput: {
    width: '80px',
    padding: '6px 10px',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'right',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s'
  },
  sliderContainer: {
    marginBottom: '8px'
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: '#e0e0e0',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer'
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px'
  },
  sliderLabel: {
    fontSize: '12px',
    color: '#999'
  },
  paramDescription: {
    fontSize: '12px',
    color: '#666',
    margin: '0',
    fontStyle: 'italic'
  }
};

export default ParameterControl;
