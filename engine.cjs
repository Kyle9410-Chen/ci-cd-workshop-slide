const ITEM_HEIGHT = 80

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const offsetFor = (index) => (1 - index) * ITEM_HEIGHT

const chapterDrawer = (md) => {
  md.core.ruler.push('chapter_drawer', (state) => {
    const slides = state.tokens.filter((token) => token.type === 'marpit_slide_open')
    const headers = slides.map((token) => (token.meta?.marpitDirectives?.header ?? '').trim())

    const chapters = []
    headers.forEach((header) => {
      if (!header) return
      const last = chapters[chapters.length - 1]
      if (last && last.name === header) last.count += 1
      else chapters.push({ name: header, count: 1 })
    })

    const seen = new Map()
    slides.forEach((token, slideIndex) => {
      const header = headers[slideIndex]
      if (!header) return

      const current = chapters.findIndex((chapter) => chapter.name === header)
      const position = seen.get(header) ?? 0
      seen.set(header, position + 1)
      const entering = position === 0 && current > 0
      const from = entering ? current - 1 : current

      const items = chapters
        .map((chapter, index) => {
          const classes = [index < current ? 'done' : index === current ? 'now' : 'todo']
          if (entering && index === current) classes.push('arrive')
          if (entering && index === from) classes.push('was')
          const number = String(index + 1).padStart(2, '0')
          const [head, ...rest] = chapter.name.split(' · ')
          const tail = rest.join(' · ')
          const long = tail.length > 6
          const title = long ? head : chapter.name
          const caption = long ? `${number} · ${tail}` : number
          return `<li class="${classes.join(' ')}"><span class="lbl"><small>${escapeHtml(caption)}</small><b>${escapeHtml(title)}</b></span></li>`
        })
        .join('')

      const listClass = entering ? ' class="moving"' : ''
      const drawer = new state.Token('html_block', '', 0)
      drawer.content = `<nav class="chapter-drawer" aria-hidden="true"><div class="view"><ol${listClass} style="--from:${offsetFor(from)}px;--to:${offsetFor(current)}px">${items}</ol></div></nav>\n`
      state.tokens.splice(state.tokens.indexOf(token) + 1, 0, drawer)
    })
  })
}

const WALK_SPEC = /\s*\{([\d\s,|-]+)\}\s*$/

const parseSteps = (spec) =>
  spec.split('|').map((step) =>
    step.split(',').map((part) => {
      const [start, end] = part.trim().split('-').map(Number)
      return [start, end ?? start]
    }),
  )

const splitLines = (html) => {
  const stack = []
  return html.replace(/\n$/, '').split('\n').map((line) => {
    const prefix = stack.join('')
    const tokens = line.match(/<span[^>]*>|<\/span>/g) ?? []
    tokens.forEach((tag) => (tag.startsWith('</') ? stack.pop() : stack.push(tag)))
    return prefix + line + '</span>'.repeat(stack.length)
  })
}

const codeWalk = (md) => {
  const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const match = token.info.match(WALK_SPEC)
    if (!match) return fence(tokens, index, options, env, self)

    const steps = parseSteps(match[1])
    token.info = token.info.slice(0, match.index)
    const html = fence(tokens, index, options, env, self)
    const [, codeOpen, body] = html.match(/<pre[^>]*>(<code[^>]*>)([\s\S]*)<\/code><\/pre>/)
    const lines = splitLines(body)

    const vars = [`--total:${lines.length}`]
    steps.forEach((ranges, stepIndex) => {
      const first = Math.min(...ranges.map(([start]) => start))
      const last = Math.max(...ranges.map(([, end]) => end))
      vars.push(`--s${stepIndex + 1}:${first - 1}`, `--l${stepIndex + 1}:${last - first + 1}`)
    })

    const rows = lines
      .map((line, lineIndex) => {
        const number = lineIndex + 1
        const classes = ['ln']
        steps.forEach((ranges, stepIndex) => {
          if (ranges.some(([start, end]) => number >= start && number <= end)) classes.push(`s${stepIndex + 1}`)
        })
        return `<span class="${classes.join(' ')}">${line}</span>`
      })
      .join('')

    return `<pre class="walk-code" style="${vars.join(';')}"><div class="walk-view">${codeOpen}${rows}</code></div></pre>\n`
  }
}

module.exports = ({ marp }) => marp.use(chapterDrawer).use(codeWalk)
