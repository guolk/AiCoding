import React, { useState } from 'react'
import styled from 'styled-components'

const PanelContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`

const PanelTitle = styled.h3`
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
`

const InputRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  align-items: center;
`

const Input = styled.input`
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  width: 150px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const Button = styled.button<{ primary?: boolean; disabled?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.primary ? '#667eea' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#5a67d8' : '#e0e0e0'};
  }
`

const Select = styled.select`
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const Label = styled.label`
  font-size: 14px;
  color: #666;
  margin-right: 5px;
`

interface InputControlPanelProps {
  onInsert?: (value: number) => void
  onDelete?: (value: number) => void
  onSearch?: (value: number) => void
  onTraverse?: (type: string) => void
  onClear?: () => void
  onRandom?: () => void
  showTraverse?: boolean
  traverseOptions?: { value: string; label: string }[]
  extraControls?: React.ReactNode
  disabled?: boolean
}

const InputControlPanel: React.FC<InputControlPanelProps> = ({
  onInsert,
  onDelete,
  onSearch,
  onTraverse,
  onClear,
  onRandom,
  showTraverse = false,
  traverseOptions = [],
  extraControls,
  disabled = false,
}) => {
  const [insertValue, setInsertValue] = useState<string>('')
  const [deleteValue, setDeleteValue] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [traverseType, setTraverseType] = useState<string>(
    traverseOptions.length > 0 ? traverseOptions[0].value : ''
  )

  const handleInsert = () => {
    const num = parseInt(insertValue)
    if (!isNaN(num) && onInsert) {
      onInsert(num)
      setInsertValue('')
    }
  }

  const handleDelete = () => {
    const num = parseInt(deleteValue)
    if (!isNaN(num) && onDelete) {
      onDelete(num)
      setDeleteValue('')
    }
  }

  const handleSearch = () => {
    const num = parseInt(searchValue)
    if (!isNaN(num) && onSearch) {
      onSearch(num)
      setSearchValue('')
    }
  }

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void
  ) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  return (
    <PanelContainer>
      <PanelTitle>操作面板</PanelTitle>
      
      {onInsert && (
        <InputRow>
          <Label>插入:</Label>
          <Input
            type="number"
            value={insertValue}
            onChange={(e) => setInsertValue(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleInsert)}
            placeholder="输入数字"
            disabled={disabled}
          />
          <Button onClick={handleInsert} primary disabled={disabled || !insertValue}>
            插入
          </Button>
        </InputRow>
      )}

      {onDelete && (
        <InputRow>
          <Label>删除:</Label>
          <Input
            type="number"
            value={deleteValue}
            onChange={(e) => setDeleteValue(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleDelete)}
            placeholder="输入数字"
            disabled={disabled}
          />
          <Button onClick={handleDelete} disabled={disabled || !deleteValue}>
            删除
          </Button>
        </InputRow>
      )}

      {onSearch && (
        <InputRow>
          <Label>查找:</Label>
          <Input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleSearch)}
            placeholder="输入数字"
            disabled={disabled}
          />
          <Button onClick={handleSearch} disabled={disabled || !searchValue}>
            查找
          </Button>
        </InputRow>
      )}

      {showTraverse && onTraverse && traverseOptions.length > 0 && (
        <InputRow>
          <Label>遍历:</Label>
          <Select
            value={traverseType}
            onChange={(e) => setTraverseType(e.target.value)}
            disabled={disabled}
          >
            {traverseOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button onClick={() => onTraverse(traverseType)} disabled={disabled}>
            开始遍历
          </Button>
        </InputRow>
      )}

      {extraControls && <InputRow>{extraControls}</InputRow>}

      <InputRow>
        {onRandom && (
          <Button onClick={onRandom} disabled={disabled}>
            随机生成
          </Button>
        )}
        {onClear && (
          <Button onClick={onClear} disabled={disabled}>
            清空
          </Button>
        )}
      </InputRow>
    </PanelContainer>
  )
}

export default InputControlPanel
