import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PanelLeft, Film, Headset, SquarePlay, BriefcaseBusiness, ChevronDown, ChevronRight, BellOff, BookOpen, HardDrive, CircleHelp, MessageSquare, Plus, Play, Upload, Languages, FileCheck2, X, Check, Trash2, Search, ArrowDownUp, ListFilter, FileVideo, ExternalLink, RotateCcw, Info, MonitorPlay, Download, CircleCheck } from 'lucide-react'
import './styles.css'

type Task = { id: string; name: string; filename: string; size: number; created: string }
const KEY = 'qianyin-demo-tasks-v1'
const cover = `${import.meta.env.BASE_URL}tutorial-cover.png`
const brand = `${import.meta.env.BASE_URL}brand.png`
function loadTasks(): { tasks: Task[]; warning: string } {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(data) || !data.every(t => t && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.filename === 'string' && typeof t.size === 'number' && t.size > 0 && typeof t.created === 'string' && !isNaN(Date.parse(t.created)))) throw Error()
    return { tasks: data, warning: '' }
  } catch { return { tasks: [], warning: '本地数据无法读取。可清空示例数据后重新创建。' } }
}
function fileError(file: File) {
  if (!/\.(mp4|mov|webm)$/i.test(file.name)) return '请选择 MP4、MOV 或 WebM 格式的视频。'
  if (file.type && !file.type.startsWith('video/')) return '文件类型与视频格式不符，请重新选择。'
  if (!file.size) return '视频文件为空，请重新选择。'
  if (file.size > 2 * 1024 ** 3) return '视频不能超过 2 GB。'
  return ''
}
const formatSize = (size: number) => `${(size / 1024 ** 2).toFixed(1)} MB`
function Modal({ title, close, children, wide = false }: { title: string; close: () => void; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    const node = ref.current!
    const focusable = () => Array.from(node.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, [tabindex="0"], video'))
    ;(node.querySelector<HTMLElement>('input:not([type="file"])') || focusable()[0])?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') {
        const list = focusable(), first = list[0], last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); previous?.focus() }
  }, [close, title])
  return <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) close() }}><div ref={ref} className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={close} aria-label="关闭窗口"><X size={20}/></button></div>{children}</div></div>
}
function App() {
  const [initial] = useState(loadTasks)
  const [tasks, setTasks] = useState<Task[]>(initial.tasks)
  const [mode, setMode] = useState<'original' | 'improved'>('improved')
  const [tab, setTab] = useState('原剧管理')
  const [collapsed, setCollapsed] = useState(false)
  const [toolbox, setToolbox] = useState(true)
  const [social, setSocial] = useState(false)
  const [modal, setModal] = useState<'create' | 'tutorial' | 'clear' | 'detail' | 'info' | null>(null)
  const [info, setInfo] = useState({ title: '', body: '' })
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(initial.warning)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(false)
  const [selected, setSelected] = useState<Task | null>(null)
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})
  const urls = useRef<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const close = React.useCallback(() => setModal(null), [])
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), [])
  useEffect(() => { if (!notice) return; const id = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(id) }, [notice])
  const explain = (title: string, body: string) => { setInfo({ title, body }); setModal('info') }
  const create = () => { setName(''); setFile(null); setError(''); setModal('create') }
  const persist = (next: Task[]) => {
    try { localStorage.setItem(KEY, JSON.stringify(next)); setTasks(next); return true }
    catch { setError('浏览器无法保存数据，请检查存储权限或可用空间后重试。'); return false }
  }
  const chooseFile = (next: File | undefined) => { if (!next) return; const validation = fileError(next); setError(validation); setFile(validation ? null : next); if (!validation && !name.trim()) setName(next.name.replace(/\.[^.]+$/, '').slice(0, 50)) }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('请输入剧名。')
    if (!file) return setError('请先选择本地视频。')
    const validation = fileError(file); if (validation) return setError(validation)
    const task = { id: crypto.randomUUID(), name: name.trim(), filename: file.name, size: file.size, created: new Date().toISOString() }
    if (!persist([task, ...tasks])) return
    const url = URL.createObjectURL(file); urls.current.push(url); setVideoUrls(prev => ({ ...prev, [task.id]: url }))
    setTab('原剧管理'); setQuery(''); setPage(1); close(); setNotice('原剧创建成功，已保存到本地任务列表。')
  }
  const isOriginal = mode === 'original'
  const allRows = tasks.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).sort((a,b) => sort ? a.created.localeCompare(b.created) : b.created.localeCompare(a.created))
  const rows = allRows.slice((page - 1) * pageSize, page * pageSize)
  const list = !isOriginal && tab === '原剧管理' && tasks.length > 0
  return <div className="app">
    <div className="demo-bar"><div className="demo-label"><span className="demo-tag">UI/UX DEMO</span><span>视频翻译工作台<span className="demo-sub"> · 首次使用体验优化</span></span></div><div className="demo-actions"><div className="mode-switch" aria-label="版本切换"><button aria-pressed={isOriginal} onClick={() => setMode('original')}>原版页面</button><button aria-pressed={!isOriginal} onClick={() => setMode('improved')}>优化页面<span className="tiny-dot"/></button></div><button className="reset-button" onClick={() => { setError(''); setModal('clear') }}><RotateCcw size={14}/><span>清空示例数据</span></button></div></div>
    <div className={`product ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar"><div className="brand"><img src={brand} alt="趣丸千音 All Voice Lab."/><button className="icon-button" aria-label={collapsed ? '展开侧栏' : '收起侧栏'} onClick={() => setCollapsed(!collapsed)}><PanelLeft size={17}/></button></div><div className="nav-caption">应用场景</div><nav><button className="nav-item active" title="视频翻译" onClick={() => setTab('原剧管理')}><Film size={18}/><span>视频翻译</span></button><button className="nav-item" title="高光解说" onClick={() => explain('高光解说', '本 Demo 聚焦视频翻译工作台。高光解说不在本次演示范围内。')}><Headset size={18}/><span>高光解说</span></button><button className="nav-item" title="社媒运营" onClick={() => setSocial(!social)}><SquarePlay size={17}/><span>社媒运营</span><ChevronDown className={social ? 'rotated' : ''} size={14}/></button>{social && !collapsed && <button className="subnav" onClick={() => explain('社媒运营', '账号管理与视频分发不在本次演示范围内。')}>账号与内容管理</button>}<button className="nav-item" title="工具箱" onClick={() => setToolbox(!toolbox)}><BriefcaseBusiness size={18}/><span>工具箱</span><ChevronDown className={toolbox ? 'rotated' : ''} size={14}/></button>{toolbox && <button className="subnav" onClick={() => explain('剧本翻译', '可先创建原剧并上传视频。本 Demo 不接入真实剧本翻译服务。')}>剧本翻译</button>}</nav><div className="sidebar-bottom"><button className="account" onClick={() => explain('体验会员', '当前为本地交互演示，存储空间、积分和账号信息参考原产品截图，不代表真实账户。')}><span className="avatar">∿</span><span className="account-text">体验用户<small>体验会员</small></span><ChevronRight size={16}/></button><div className="social-links"><button onClick={() => explain('微信', '演示环境未连接官方社交账号。')}>●●</button><button onClick={() => explain('小红书', '演示环境未连接官方社交账号。')}>小红书</button><button onClick={() => explain('哔哩哔哩', '演示环境未连接官方社交账号。')}>bilibili</button></div></div></aside>
      <div className="workspace"><header className="toolbar"><h1>视频翻译</h1><div className="toolbar-actions"><button className="storage" onClick={() => explain('存储空间', `本地已记录 ${tasks.length} 个原剧，共 ${formatSize(tasks.reduce((n,t) => n+t.size,0))}。视频文件不会上传或存入 localStorage。`)}><HardDrive size={15}/><span>存储 <b>{(tasks.reduce((n,t) => n+t.size,0)/1024**3).toFixed(1)} GB / 100.0 GB</b></span><small>2026-08-05开启收费</small></button><button onClick={() => explain('任务通知', '本 Demo 无后台处理任务，因此无需开启浏览器通知。创建结果将直接显示在工作台。')}><BellOff size={16}/><span>开启通知</span></button><button onClick={() => explain('产品介绍', '趣丸千音视频翻译工作台 UI/UX 笔试 Demo。通过原版与优化版切换，对比首次使用体验；支持创建本地任务、视频预览和数据重置。')}><BookOpen size={16}/><span>产品介绍</span></button><button onClick={() => explain('积分说明', '160 为参考截图中的演示数值。本 Demo 不扣除积分，也不执行真实 AI 翻译。')}><span className="coin">◒</span>积分 160</button></div></header>
      <main><div className="tabs-row"><div className="tabs">{['原剧管理','译制管理'].map(t => <button key={t} aria-pressed={tab === t} className={tab === t ? 'selected' : ''} onClick={() => {setTab(t); setPage(1)}}>{t}</button>)}</div>{list && <button className="primary small" onClick={create}><Plus size={16}/>创建原剧</button>}</div>
      {isOriginal ? <div className="original-view"><TableHead/><div className="original-tutorial"><button aria-label="展开原剧管理教学" onClick={() => setModal('tutorial')}><img src={cover} alt="短剧快译 原剧管理 功能教学"/><span className="play-overlay"><Play fill="currentColor" size={27}/></span></button></div></div> : list ? <section className="list-view"><div className="list-tools"><div><strong>全部原剧</strong><span className="count">{tasks.length}</span></div><label className="search"><Search size={16}/><input aria-label="搜索剧名" placeholder="搜索剧名" value={query} onChange={e => {setQuery(e.target.value); setPage(1)}}/></label></div><div className="table-scroll"><table><thead><tr><th>剧名</th><th>状态</th><th>提取方式</th><th>擦除状态</th><th>角色识别</th><th>存储</th><th><button className="sort-button" onClick={() => setSort(!sort)}>创建时间<ArrowDownUp size={13}/></button></th><th>操作</th></tr></thead><tbody>{rows.map(t => <tr key={t.id}><td><div className="task-name"><span className="file-symbol"><Film size={19}/></span><div><strong>{t.name}</strong><small title={t.filename}>{t.filename}</small></div></div></td><td><span className="status">待译制</span></td><td className="muted">未提取</td><td className="muted">未处理</td><td className="muted">未识别</td><td>{formatSize(t.size)}</td><td className="date">{new Date(t.created).toLocaleString('zh-CN', {hour12:false})}</td><td><button className="text-button" onClick={() => {setSelected(t); setModal('detail')}}>查看原剧</button></td></tr>)}</tbody></table>{!rows.length && <div className="no-results">未找到“{query}”相关原剧<button className="text-button" onClick={() => {setQuery(''); setPage(1)}}>清除搜索</button></div>}</div><div className="local-note"><Info size={14}/>本地演示任务 · 视频仅在当前页面可预览，刷新后保留任务信息</div></section> : tab === '译制管理' ? <section className="translation-empty"><div className="empty-icon"><Languages size={32}/></div><h2>还没有译制任务</h2><p>从一部原剧开始，开启你的多语言创作。</p><button className="primary" onClick={() => tasks.length ? setTab('原剧管理') : create()}>{tasks.length ? '前往原剧管理' : '创建原剧'}</button><p className="simulation-note">本 Demo 仅演示任务管理，不执行真实 AI 译制</p></section> : <section className="empty-view"><div className="onboarding"><div className="eyebrow"><span/> 让好故事，跨越语言</div><div className="empty-icon"><Film size={32} strokeWidth={1.5}/><span><Plus size={12}/></span></div><h2>从你的第一部原剧开始</h2><p className="intro">上传原剧，让 AI 帮你完成多语言译制。<br/>从字幕提取到配音导出，在一个工作台里完成。</p><button className="primary create-main" onClick={create}><Plus size={18}/>创建原剧</button><p className="file-hint">支持 MP4、MOV、WebM · 单个文件最大 2 GB</p><ol className="steps" aria-label="译制流程">{[{icon:Upload,title:'上传原剧',text:'创建剧名，上传本地视频'},{icon:Languages,title:'AI 智能译制',text:'提取字幕，翻译与配音'},{icon:FileCheck2,title:'审核导出',text:'校对内容，导出成片'}].map((s,i) => <li className="step" key={s.title}><div className="step-top"><span className="step-number">0{i+1}</span><s.icon size={20} strokeWidth={1.5}/></div>{i < 2 && <span className="flow-connector" aria-hidden="true"/>}<h3>{s.title}</h3><p>{s.text}</p></li>)}</ol></div><button className="tutorial-card" onClick={() => setModal('tutorial')}><div className="tutorial-thumb"><img src={cover} alt="原剧管理教程封面"/><span><Play size={14} fill="currentColor"/></span></div><div className="tutorial-copy"><span className="tutorial-label">新手入门</span><h3>第一次使用？看这里</h3><p>了解原剧创建与译制流程</p></div><span className="tutorial-link">展开教程<ExternalLink size={14}/></span></button></section>}
      </main><footer className="footer"><span>共 {list ? allRows.length : 0} 项数据</span><span className="footer-disclaimer">{isOriginal ? '相关内容由 AI 生成' : '本地交互演示 · 不执行真实 AI 译制'}</span>{(isOriginal || list) && <div className="pagination"><select aria-label="每页条数" value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setPage(1)}}><option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option></select><button aria-label="上一页" disabled={page===1} onClick={() => setPage(page-1)}><ChevronRight className="prev" size={14}/></button><b>{page}</b><button aria-label="下一页" disabled={!list || page*pageSize>=allRows.length} onClick={() => setPage(page+1)}><ChevronRight size={14}/></button><span>前往</span><input aria-label="跳转页码" type="number" min="1" max={Math.max(1,Math.ceil(allRows.length/pageSize))} value={page} onChange={e => {const p=Number(e.target.value); if(p>=1 && p<=Math.max(1,Math.ceil(allRows.length/pageSize)))setPage(p)}}/><span>页</span></div>}</footer></div>
      <button className="help-fab" aria-label="帮助中心" onClick={() => explain('需要帮助？', '点击「创建原剧」，填写剧名并选择 MP4、MOV 或 WebM 视频，确认后即可查看本地任务。首次使用可展开教程卡片。演示数据仅保存在当前浏览器，可随时在顶部清空。')}><MessageSquare size={23}/></button>
    </div>
    {notice && <div role="status" className="toast"><CircleCheck size={18}/>{notice}<button aria-label="关闭提示" onClick={() => setNotice('')}><X size={14}/></button></div>}
    {modal === 'create' && <Modal title="创建原剧" close={close}><form onSubmit={submit} noValidate><div className="modal-body"><p className="modal-description">添加原剧信息，开始你的视频译制工作流。</p><label className="field-label" htmlFor="drama-name">剧名 <span>*</span><small>{name.length}/50</small></label><input className="name-input" id="drama-name" autoFocus value={name} maxLength={50} onChange={e => setName(e.target.value)} placeholder="例如：我的第一部短剧"/><label className="field-label">原剧视频 <span>*</span></label><label className={`upload-zone ${file ? 'has-file' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); chooseFile(e.dataTransfer.files[0])}}><input aria-label="选择本地视频" type="file" accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm" onChange={e => chooseFile(e.target.files?.[0])}/>{file ? <><FileVideo size={28}/><strong>{file.name}</strong><span>{formatSize(file.size)} · 点击重新选择</span></> : <><Upload size={27}/><strong>点击选择或拖拽视频到这里</strong><span>MP4、MOV、WebM · 最大 2 GB</span></>}</label><div className="privacy-note"><Info size={15}/><span>视频不会上传到服务器，仅记录任务信息。<br/>本 Demo 不执行 AI 翻译，不消耗积分。</span></div>{error && <p className="form-error" role="alert">{error}</p>}</div><div className="modal-footer"><button type="button" className="secondary" onClick={close}>取消</button><button className="primary" type="submit"><Check size={16}/>确认创建</button></div></form></Modal>}
    {modal === 'tutorial' && <Modal title="原剧管理 · 新手教程" close={close} wide><div className="modal-body tutorial-body"><img className="tutorial-poster" src={cover} alt="原剧管理教学封面"/><div className="tutorial-notice"><Info size={15}/>参考素材仅含视频封面，以下提供可操作的图文教程。</div><ol className="tutorial-guide"><li><strong>上传原剧</strong><p>点击「创建原剧」，输入剧名并选择本地视频，确认后自动进入原剧列表。</p></li><li><strong>AI 智能译制</strong><p>正式产品支持字幕提取、翻译和配音。本 Demo 保留“待译制”状态，不生成翻译结果。</p></li><li><strong>审核导出</strong><p>正式工作流中需校对字幕与配音后导出。Demo 可查看原剧信息、预览本次选择的视频。</p></li></ol></div><div className="modal-footer"><button className="primary" onClick={create}>我知道了，创建原剧</button></div></Modal>}
    {modal === 'clear' && <Modal title="清空示例数据？" close={close}><div className="modal-body"><div className="clear-icon"><Trash2 size={25}/></div><p>将清除当前浏览器保存的 {tasks.length} 个模拟任务，并恢复优化版首次使用空状态。</p><p className="muted mt-3">不会删除你电脑中的视频文件，此操作无法撤销。</p>{error && <p role="alert" className="form-error">{error}</p>}</div><div className="modal-footer"><button className="secondary" onClick={close}>取消</button><button className="primary" onClick={() => {try {localStorage.removeItem(KEY); setTasks([]); urls.current.forEach(URL.revokeObjectURL); urls.current=[]; setVideoUrls({}); setMode('improved'); setTab('原剧管理'); setPage(1); setQuery(''); close(); setNotice('示例数据已清空，可以重新开始演示。')}catch{setError('无法清空本地存储，请检查浏览器权限。')}}}>确认清空</button></div></Modal>}
    {modal === 'info' && <Modal title={info.title} close={close}><div className="modal-body"><p className="info-body">{info.body}</p></div><div className="modal-footer"><button className="primary" onClick={close}>知道了</button></div></Modal>}
    {modal === 'detail' && selected && <Modal title="原剧详情" close={close} wide><div className="modal-body"><div className="detail-title"><h3>{selected.name}</h3><span className="status">待译制</span></div><dl className="details"><dt>视频文件</dt><dd>{selected.filename}</dd><dt>文件大小</dt><dd>{formatSize(selected.size)}</dd><dt>创建时间</dt><dd>{new Date(selected.created).toLocaleString('zh-CN')}</dd></dl>{videoUrls[selected.id] ? <><video className="video-preview" controls src={videoUrls[selected.id]}/><p className="muted mt-3">本地预览；如无法播放，可能是浏览器不支持该视频编码。</p></> : <div className="reselect"><MonitorPlay size={27}/><p>任务信息已保留，重新选择原视频即可预览</p><label className="secondary file-picker">选择视频<input aria-label="重新选择预览视频" type="file" accept=".mp4,.mov,.webm" onChange={e => {const f=e.target.files?.[0]; if(!f)return;const err=fileError(f);if(err){setNotice(err);return}if(f.name!==selected.filename||f.size!==selected.size){setNotice('请选择与任务文件名和大小一致的原视频。');return}const url=URL.createObjectURL(f);urls.current.push(url);setVideoUrls(p=>({...p,[selected.id]:url}))}}/></label></div>}<div className="privacy-note"><CircleHelp size={16}/>此任务尚未译制。真实 AI 译制与成片导出不在 Demo 范围内。</div></div><div className="modal-footer"><button className="secondary" onClick={() => {const blob=new Blob([JSON.stringify(selected,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`原剧任务-${selected.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}><Download size={15}/>导出任务信息</button><button className="primary" onClick={close}>完成</button></div></Modal>}
  </div>
}
function TableHead() { return <div className="reference-table-head">{['剧名','状态','提取方式','擦除状态','角色识别','备注','存储','创建时间','更新时间','操作'].map((h,i)=><div key={h}>{h}{[1,2,3,4].includes(i) && <ChevronDown size={13}/>} {[7,8].includes(i) && <ArrowDownUp size={14}/>} {[0,5].includes(i)&&<ListFilter size={15}/>}</div>)}</div> }
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
