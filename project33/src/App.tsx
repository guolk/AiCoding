import { Routes, Route, Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import BinarySearchTreeVisualizer from './components/BinarySearchTree/BinarySearchTreeVisualizer'
import AVLTreeVisualizer from './components/AVLTree/AVLTreeVisualizer'
import HashTableVisualizer from './components/HashTable/HashTableVisualizer'
import MinHeapVisualizer from './components/MinHeap/MinHeapVisualizer'
import GraphVisualizer from './components/Graph/GraphVisualizer'

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`

const Title = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
`

const Nav = styled.nav`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`

const NavLink = styled(Link)<{ active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.active ? '#667eea' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#5a67d8' : '#e0e0e0'};
  }
`

const Content = styled.main`
  flex: 1;
  padding: 20px;
`

const HomePage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
  color: white;
`

const HomeTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 20px;
`

const HomeDescription = styled.p`
  font-size: 18px;
  max-width: 600px;
  line-height: 1.6;
  opacity: 0.9;
`

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
  max-width: 1200px;
  width: 100%;
`

const FeatureCard = styled(Link)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 16px;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-5px);
  }
`

const FeatureTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 10px;
`

const FeatureDesc = styled.p`
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.5;
`

function App() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: '首页', exact: true },
    { path: '/bst', label: '二叉搜索树' },
    { path: '/avl', label: 'AVL树' },
    { path: '/hashtable', label: '哈希表' },
    { path: '/heap', label: '最小堆' },
    { path: '/graph', label: '图遍历' },
  ]
  
  const features = [
    { 
      path: '/bst', 
      title: '二叉搜索树', 
      desc: '插入、删除、查找、遍历操作，每步高亮显示当前节点'
    },
    { 
      path: '/avl', 
      title: 'AVL树', 
      desc: '旋转操作动画演示，实时显示平衡因子'
    },
    { 
      path: '/hashtable', 
      title: '哈希表', 
      desc: '开放寻址法和链式法的冲突处理过程可视化'
    },
    { 
      path: '/heap', 
      title: '最小堆', 
      desc: '插入和提取的堆化过程动画演示'
    },
    { 
      path: '/graph', 
      title: '图遍历', 
      desc: 'BFS和DFS访问顺序动画，队列/栈实时状态显示'
    },
  ]

  return (
    <AppContainer>
      <Header>
        <Title>数据结构可视化教学工具</Title>
        <Nav>
          {navItems.map(item => (
            <NavLink 
              key={item.path} 
              to={item.path}
              active={item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)}
            >
              {item.label}
            </NavLink>
          ))}
        </Nav>
      </Header>
      
      <Content>
        <Routes>
          <Route path="/" element={
            <HomePage>
              <HomeTitle>交互式数据结构学习平台</HomeTitle>
              <HomeDescription>
                通过可视化动画深入理解数据结构与算法。支持自定义输入数据，
                自动演示和手动单步模式，让复杂概念变得简单易懂。
              </HomeDescription>
              <Features>
                {features.map(feature => (
                  <FeatureCard key={feature.path} to={feature.path}>
                    <FeatureTitle>{feature.title}</FeatureTitle>
                    <FeatureDesc>{feature.desc}</FeatureDesc>
                  </FeatureCard>
                ))}
              </Features>
            </HomePage>
          } />
          <Route path="/bst/*" element={<BinarySearchTreeVisualizer />} />
          <Route path="/avl/*" element={<AVLTreeVisualizer />} />
          <Route path="/hashtable/*" element={<HashTableVisualizer />} />
          <Route path="/heap/*" element={<MinHeapVisualizer />} />
          <Route path="/graph/*" element={<GraphVisualizer />} />
        </Routes>
      </Content>
    </AppContainer>
  )
}

export default App
