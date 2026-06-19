/** @paper-design/shaders-react@0.0.76 */
import { Dithering } from '@paper-design/shaders-react';
import { useLocation } from 'react-router-dom'

/**
 * from Paper
 * https://app.paper.design/file/01KKYJR2CT322FXY567HWVG1TQ/01KKYJR2CTKQ05P1DJQ56M9MYA/4N-0
 * on Jun 19, 2026
 */

export const backgroundColor = '#E8E1F2'

const fullScreenStyle = {
    backgroundColor,
    position: 'fixed',
    inset: 0,
    height: '100vh',
    width: '100vw',
    zIndex: -1,
}

function Background() {
    const isReadme = useLocation().pathname === '/readme'

    return (
        <div style={fullScreenStyle}>
            <Dithering
                speed={0.12}
                shape="warp"
                type="4x4"
                size={2}
                scale={1}
                frame={146997.106999932}
                colorBack="#00000000"
                colorFront="#D2CAE8"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: isReadme ? 0 : 1,
                    transition: 'opacity 0.3s ease',
                }}
            />
        </div>
    )
}

export default Background