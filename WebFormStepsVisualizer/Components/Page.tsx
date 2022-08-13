import * as React from 'react'
import styled from 'styled-components'

const PageContent = styled.div.attrs(props => ({className: props.className,}))`
  display: flex;
  flex-direction: row;
  flex: 1;
  width:80vw;
  max-width: 100vw;
  max-height: 100vh;
  height: 800px;
  white-space: normal;
`

export const Page = ({ children }: { children: any}) => (
  <div className='DancingWithCrmControls.WebFormStepsVisualizer'>
    {children}
  </div>
)
