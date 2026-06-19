import './Readme.css'
import readmeRaw from '../../../README.md?raw'
import { backgroundColor } from './Background'
import { getContrastColor, TITLE_CONTRAST_RATIO, DESCRIPTION_CONTRAST_RATIO } from '../utils/contrastColor'
import { parseReadme } from '../utils/parseReadme'
import { useDocumentTitle } from '../utils/useDocumentTitle'
import Title from './Title'

function Readme({ isClosing }) {
  const { title, paragraphs } = parseReadme(readmeRaw)
  useDocumentTitle(title)

  const titleColor = getContrastColor(backgroundColor, TITLE_CONTRAST_RATIO)
  const descriptionColor = getContrastColor(backgroundColor, DESCRIPTION_CONTRAST_RATIO)

  return (
    <main className={`readme${isClosing ? ' closing' : ''}`} style={{ color: descriptionColor }}>
      <div className="readmeContent">
        <Title title={title} color={titleColor} />
        <div className="readmeParagraphs">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Readme
