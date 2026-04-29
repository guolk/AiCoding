import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-javascript'

const CodeContainer = styled.div`
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6a9955;
  }
  
  .token.punctuation {
    color: #d4d4d4;
  }
  
  .token.namespace {
    opacity: .7;
  }
  
  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #b5cea8;
  }
  
  .token.string,
  .token.attr-value {
    color: #ce9178;
  }
  
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #d4d4d4;
  }
  
  .token.atrule,
  .token.attr-name,
  .token.keyword {
    color: #569cd6;
  }
  
  .token.function,
  .token.class-name {
    color: #dcdcaa;
  }
  
  .token.regex,
  .token.important,
  .token.variable {
    color: #d16969;
  }
`

const TabContainer = styled.div`
  display: flex;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
`

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: ${props => props.active ? '#1e1e1e' : '#2d2d2d'};
  color: ${props => props.active ? '#ffffff' : '#999999'};
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  
  &:hover {
    color: #ffffff;
    background: ${props => props.active ? '#1e1e1e' : '#383838'};
  }
`

const CodeContent = styled.pre`
  margin: 0;
  padding: 20px;
  overflow-x: auto;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
  
  code {
    font-family: inherit;
    color: inherit;
  }
`

const LineNumber = styled.span`
  color: #858585;
  user-select: none;
  margin-right: 20px;
  display: inline-block;
  width: 30px;
  text-align: right;
`

interface CodeDisplayProps {
  pythonCode?: string
  javascriptCode?: string
  defaultLanguage?: 'python' | 'javascript'
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  pythonCode,
  javascriptCode,
  defaultLanguage = 'javascript',
}) => {
  const [activeLanguage, setActiveLanguage] = useState<'python' | 'javascript'>(defaultLanguage)
  const [highlightedCode, setHighlightedCode] = useState<string>('')

  useEffect(() => {
    const code = activeLanguage === 'python' ? pythonCode : javascriptCode
    if (code) {
      const language = activeLanguage === 'python' ? 'python' : 'javascript'
      try {
        const highlighted = Prism.highlight(code, Prism.languages[language], language)
        setHighlightedCode(highlighted)
      } catch {
        setHighlightedCode(code)
      }
    }
  }, [activeLanguage, pythonCode, javascriptCode])

  const renderWithLineNumbers = (code: string) => {
    const lines = code.split('\n')
    return lines.map((line, index) => (
      <div key={index}>
        <LineNumber>{index + 1}</LineNumber>
        <span dangerouslySetInnerHTML={{ __html: line }} />
      </div>
    ))
  }

  const activeCode = activeLanguage === 'python' ? pythonCode : javascriptCode

  if (!activeCode) {
    return null
  }

  return (
    <CodeContainer>
      <TabContainer>
        {pythonCode && (
          <Tab
            active={activeLanguage === 'python'}
            onClick={() => setActiveLanguage('python')}
          >
            Python
          </Tab>
        )}
        {javascriptCode && (
          <Tab
            active={activeLanguage === 'javascript'}
            onClick={() => setActiveLanguage('javascript')}
          >
            JavaScript
          </Tab>
        )}
      </TabContainer>
      
      <CodeContent>
        <code>
          {renderWithLineNumbers(highlightedCode || activeCode)}
        </code>
      </CodeContent>
    </CodeContainer>
  )
}

export default CodeDisplay
