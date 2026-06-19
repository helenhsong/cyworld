// Renders the page title from a prop (rather than hardcoded JSX text) so this
// component can be reused across projects that each supply their own title.
function Title({ title, color }) {
    return <h1 style={{ color }}>{title}</h1>
}

export default Title
