import { Box } from 'rebass'
import styled from 'styled-components'

const Markdown = styled(Box)`
 
  blockquote {
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    margin: 1.75em 0 1.75em -2.2em;
    padding: 0 0 0 1.75em;
    border-left: #4a4a4a 0.4em solid;
  }

  blockquote p {
    margin: 0.8em 0;
    font-style: italic;
  }

  blockquote small {
    display: inline-block;
    margin: 0.8em 0 0.8em 1.5em;
    font-size: 0.9em;
    color: #ccc;
  }

  blockquote small::before {
    content: '\\2014 \\00A0';
  }

  blockquote cite {
    font-weight: 700;
  }

  blockquote cite a {
    font-weight: normal;
  }

}
`

export default Markdown
