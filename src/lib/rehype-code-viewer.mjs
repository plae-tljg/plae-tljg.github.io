/**
 * Code fences become panels: title bar, copy button, collapse for long files.
 *
 * The VuePress manual had `<CodeViewer filePath="/lib/x.conf" title="…">` — a
 * titled box around a file from the repo. This restores the look. Two things
 * had to be discovered the hard way about carrying the title:
 *
 *   1. The fence's own info string (```conf title="x") does not work: Astro 7's
 *      native markdown parser drops `meta` before any plugin sees the node.
 *   2. Neither does `data.hProperties` set from a remark plugin: the properties
 *      do not survive the highlighting pass.
 *
 * What does survive is raw HTML, which the archive viewers already rely on. So
 * the title rides in a comment directly above the fence:
 *
 *   <!--code:title=根证书配置 · /lib/https/ca.conf collapse-->
 *   ```conf
 *   …
 *   ```
 */

/** `title="a b"` / `title=a` / `collapse` out of a directive. */
function parseMeta(meta) {
  const out = { title: '', collapse: false }
  if (!meta) return out
  const source = String(meta)
  const title = source.match(
    /title=(?:"([^"]*)"|'([^']*)'|([^]*?)(?=\s+\w+=|\s+collapse\s*$|$))/
  )
  if (title) out.title = (title[1] ?? title[2] ?? title[3] ?? '').trim()
  out.collapse = /(^|\s)collapse(\s|$)/.test(source)
  return out
}

/** `<!--code:…-->` → meta, or null when it is an ordinary comment. */
function readDirective(value) {
  const inner = String(value || '')
    .replace(/^<!--/, '')
    .replace(/-->$/, '')
    .trim()
  if (!inner.startsWith('code:')) return null
  const meta = parseMeta(inner.slice('code:'.length).trim())
  return meta.title || meta.collapse ? meta : null
}

function textOf(node) {
  if (node.type === 'text') return node.value
  if (node.children) return node.children.map(textOf).join('')
  return ''
}

function classesOf(node) {
  const value = node.properties?.className
  return Array.isArray(value) ? value : value ? [value] : []
}

const element = (tagName, properties, children = []) => ({
  type: 'element',
  tagName,
  properties,
  children,
})

const text = (value) => ({ type: 'text', value })

export default function rehypeCodeViewer(options = {}) {
  const { collapseAfter = 26, label = '复制' } = options

  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== 'object' || !Array.isArray(node.children)) return

      let pending = null

      node.children = node.children.map((child) => {
        // A directive applies to the next fence in the same block.
        if (child.type === 'comment' || child.type === 'raw') {
          const directive = readDirective(child.value)
          if (directive) {
            pending = directive
            return text('')
          }
        }

        if (child.type !== 'element' || child.tagName !== 'pre') {
          visit(child)
          return child
        }

        const code = child.children?.find((c) => c.type === 'element' && c.tagName === 'code')
        if (!code) return child

        // The language class sits on the code element after highlighting and on
        // the pre element before it; accept either.
        const language =
          classesOf(code)
            .concat(classesOf(child))
            .find((c) => c.startsWith('language-'))
            ?.slice('language-'.length) || ''

        const source = textOf(code)
        const lineCount = source.replace(/\n$/, '').split('\n').length
        const meta = pending || { title: '', collapse: false }
        pending = null

        const collapsed = meta.collapse || lineCount > collapseAfter
        const bar = element('figcaption', { className: ['code-viewer__bar'] }, [
          element('span', { className: ['code-viewer__title'] }, [
            text(meta.title || language || '代码'),
          ]),
          ...(meta.title && language
            ? [element('span', { className: ['code-viewer__lang'] }, [text(language)])]
            : []),
          element('span', { className: ['code-viewer__spacer'] }, []),
          element(
            'button',
            { type: 'button', className: ['code-viewer__button'], 'data-copy': '' },
            [text(label)]
          ),
          ...(collapsed
            ? [
                element(
                  'button',
                  {
                    type: 'button',
                    className: ['code-viewer__button'],
                    'data-expand': '',
                    'aria-expanded': 'false',
                  },
                  [text('展开')]
                ),
              ]
            : []),
        ])

        return element(
          'figure',
          {
            className: ['code-viewer', ...(collapsed ? ['is-collapsed'] : [])],
            'data-lines': String(lineCount),
          },
          [bar, child]
        )
      })
    }

    visit(tree)
  }
}
