import { Formula } from '../types';

interface FormulaExplanationProps {
  formula: Formula;
  currentValues?: Record<string, number>;
  result?: number;
}

function FormulaExplanation({
  formula,
  currentValues,
  result
}: FormulaExplanationProps) {
  return (
    <div style={styles.container}>
      <div style={styles.formulaDisplay}>
        <div style={styles.formulaHeader}>
          <span style={styles.formulaCategory}>{formula.category}</span>
          <span style={styles.formulaName}>{formula.name}</span>
        </div>
        <div style={styles.formulaText}>
          {formula.formula}
        </div>
      </div>

      <div style={styles.description}>
        <p style={styles.descriptionText}>{formula.description}</p>
      </div>

      {currentValues && (
        <div style={styles.currentValues}>
          <h4 style={styles.sectionSubtitle}>当前参数值：</h4>
          <div style={styles.valuesGrid}>
            {Object.entries(currentValues).map(([key, value]) => {
              const param = formula.parameters.find(p => p.name === key);
              return (
                <div key={key} style={styles.valueItem}>
                  <span style={styles.valueSymbol}>
                    {param?.symbol || key} =
                  </span>
                  <span style={styles.valueNumber}>
                    {typeof value === 'number' ? value.toFixed(4) : value}
                    {param?.unit && <span style={styles.valueUnit}>{param.unit}</span>}
                  </span>
                </div>
              );
            })}
            {result !== undefined && (
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>计算结果：</span>
                <span style={styles.resultValue}>{result.toFixed(6)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={styles.explanations}>
        {formula.explanation.map((exp, index) => (
          <div key={index} style={styles.explanationSection}>
            <h4 style={styles.explanationTitle}>{exp.title}</h4>
            <p style={styles.explanationContent}>{exp.content}</p>
          </div>
        ))}
      </div>

      <div style={styles.applications}>
        <h4 style={styles.sectionSubtitle}>应用场景：</h4>
        <ul style={styles.applicationList}>
          {formula.applicationScenarios.map((scenario, index) => (
            <li key={index} style={styles.applicationItem}>
              <span style={styles.applicationBullet}>•</span>
              {scenario}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
  },
  formulaDisplay: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  formulaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  formulaCategory: {
    fontSize: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 12px',
    borderRadius: '4px'
  },
  formulaName: {
    fontSize: '18px',
    fontWeight: 600
  },
  formulaText: {
    fontSize: '28px',
    fontWeight: 700,
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: '2px'
  },
  description: {
    marginBottom: '20px'
  },
  descriptionText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6,
    margin: 0
  },
  currentValues: {
    backgroundColor: '#f6ffed',
    border: '1px solid #b7eb8f',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  },
  sectionSubtitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    margin: '0 0 12px 0'
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  valueItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px'
  },
  valueSymbol: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#52c41a',
    fontFamily: 'monospace'
  },
  valueNumber: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333'
  },
  valueUnit: {
    fontSize: '12px',
    color: '#666',
    marginLeft: '4px'
  },
  resultItem: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#e6f7ff',
    borderRadius: '8px',
    border: '1px solid #91d5ff'
  },
  resultLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1890ff'
  },
  resultValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1890ff',
    fontFamily: 'monospace'
  },
  explanations: {
    marginBottom: '20px'
  },
  explanationSection: {
    backgroundColor: '#fafafa',
    borderLeft: '4px solid #1890ff',
    padding: '16px',
    marginBottom: '12px',
    borderRadius: '0 8px 8px 0'
  },
  explanationTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1890ff',
    margin: '0 0 8px 0'
  },
  explanationContent: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6,
    margin: 0
  },
  applications: {},
  applicationList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  applicationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 0',
    borderBottom: '1px dashed #f0f0f0',
    fontSize: '14px',
    color: '#666'
  },
  applicationBullet: {
    color: '#1890ff',
    fontWeight: 'bold'
  }
};

export default FormulaExplanation;
