import { forwardRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { backgroundColor } from './Background'
import { getContrastColor } from '../utils/contrastColor'

const Header = forwardRef(function Header({ onCloseReadme }, ref) {
    const isReadme = useLocation().pathname === '/readme'
    const textColor = getContrastColor(backgroundColor)

    const handleReadmeLinkClick = (event) => {
        if (!isReadme) return
        event.preventDefault()
        onCloseReadme()
    }

    return (
        <header ref={ref} className="projectHeader" style={{ color: textColor }}>
            <p className="homeLink"><a href="https://helenhsong.github.io">helenhsong.com</a></p>
            <p className="readMeLink">
                <Link
                    to={isReadme ? '/' : '/readme'}
                    onClick={handleReadmeLinkClick}
                    style={isReadme ? { opacity: 1 } : undefined}
                >
                    {isReadme ? '[close]' : 'README'}
                </Link>
            </p>
        </header>
    )
})

export default Header