import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'math',
      name: '数学公式',
      icon: '📐',
      description: '探索一次函数、二次函数、三角函数、指数函数、对数函数等数学公式，通过动态交互理解函数图像变化规律。',
      color: '#1890ff',
      formulas: 5,
      examples: ['一次函数 y = kx + b', '二次函数 y = ax² + bx + c', '正弦函数 y = A sin(Bx + C) + D']
    },
    {
      id: 'physics',
      name: '物理公式',
      icon: '⚛️',
      description: '学习匀速直线运动、自由落体、欧姆定律、简谐运动、抛体运动等物理公式，通过模拟实验理解物理规律。',
      color: '#52c41a',
      formulas: 5,
      examples: ['匀速运动 s = s₀ + v·t', '自由落体 h = h₀ - ½·g·t²', '欧姆定律 I = U / R']
    }
  ];

  const features = [
    {
      icon: '🎚️',
      title: '参数动态调整',
      description: '通过滑块实时调整公式参数，立即看到图表变化，直观理解各参数对公式结果的影响。'
    },
    {
      icon: '📊',
      title: '可视化图表',
      description: '使用 ECharts 强大的图表功能，将抽象的公式以生动的曲线、散点图等形式展示，便于理解。'
    },
    {
      icon: '🎬',
      title: '动画演示',
      description: '通过动画展示公式的变化过程，如动点移动、曲线形成、波形变化等，让学习更加生动有趣。'
    },
    {
      icon: '📖',
      title: '详细解释',
      description: '每个公式都配有详细的解释说明，包括公式含义、参数说明、应用场景等，帮助深入理解。'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>欢迎使用科学公式动态演示系统</h1>
        <p style={styles.heroSubtitle}>
          通过动态交互与可视化图表，让数学和物理公式变得更加直观易懂
        </p>
      </div>

      <div style={styles.categoriesSection}>
        <h2 style={styles.sectionTitle}>选择学习内容</h2>
        <div style={styles.categoriesGrid}>
          {categories.map((category) => (
            <div 
              key={category.id}
              style={{ ...styles.categoryCard, borderLeftColor: category.color }}
              onClick={() => navigate(`/${category.id}`)}
            >
              <div style={styles.categoryHeader}>
                <span style={styles.categoryIcon}>{category.icon}</span>
                <div>
                  <h3 style={styles.categoryName}>{category.name}</h3>
                  <span style={styles.formulaCount}>{category.formulas} 个公式</span>
                </div>
              </div>
              <p style={styles.categoryDescription}>{category.description}</p>
              <div style={styles.examplesList}>
                <h4 style={styles.examplesTitle}>示例公式：</h4>
                {category.examples.map((example, index) => (
                  <div key={index} style={styles.exampleItem}>
                    <span style={styles.exampleBullet}>•</span>
                    <span style={styles.exampleText}>{example}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...styles.categoryButton, backgroundColor: category.color }}>
                开始学习 →
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>系统特色</h2>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <span style={styles.featureIcon}>{feature.icon}</span>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.targetUsersSection}>
        <h2 style={styles.sectionTitle}>适用人群</h2>
        <div style={styles.usersGrid}>
          <div style={styles.userCard}>
            <span style={styles.userIcon}>🎓</span>
            <h3 style={styles.userTitle}>初高中学生</h3>
            <p style={styles.userDescription}>
              通过可视化的方式理解抽象的数学和物理公式，提高学习兴趣和效果。动态调整参数，实时观察变化，让学习更加主动和直观。
            </p>
          </div>
          <div style={styles.userCard}>
            <span style={styles.userIcon}>👨‍🏫</span>
            <h3 style={styles.userTitle}>教师课堂演示</h3>
            <p style={styles.userDescription}>
              在课堂上使用本系统进行公式演示，通过动态交互帮助学生理解公式含义。丰富的可视化效果让教学更加生动有趣。
            </p>
          </div>
          <div style={styles.userCard}>
            <span style={styles.userIcon}>💻</span>
            <h3 style={styles.userTitle}>在线教育课程</h3>
            <p style={styles.userDescription}>
              作为在线教育平台的辅助教学工具，为学生提供互动式的公式学习体验。随时随地进行公式探索和实验。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '48px',
    padding: '32px'
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#333',
    marginBottom: '16px'
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#666',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: 1.6
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '24px',
    textAlign: 'center'
  },
  categoriesSection: {
    marginBottom: '48px'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px'
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    borderLeft: '4px solid',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  categoryIcon: {
    fontSize: '40px'
  },
  categoryName: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#333',
    margin: 0
  },
  formulaCount: {
    fontSize: '14px',
    color: '#666'
  },
  categoryDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6,
    marginBottom: '16px'
  },
  examplesList: {
    marginBottom: '16px'
  },
  examplesTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '8px'
  },
  exampleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  exampleBullet: {
    color: '#1890ff'
  },
  exampleText: {
    fontSize: '13px',
    color: '#666',
    fontFamily: 'monospace'
  },
  categoryButton: {
    textAlign: 'center',
    padding: '12px 24px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'opacity 0.3s'
  },
  featuresSection: {
    marginBottom: '48px'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    textAlign: 'center'
  },
  featureIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px'
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '12px'
  },
  featureDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6
  },
  targetUsersSection: {
    marginBottom: '24px'
  },
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    textAlign: 'center'
  },
  userIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px'
  },
  userTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '12px'
  },
  userDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6
  }
};

export default Home;
